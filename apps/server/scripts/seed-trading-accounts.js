const { readFile } = require("node:fs/promises");
const { join } = require("node:path");
const { config } = require("dotenv");
const { PrismaClient } = require("@prisma/client");

config({ path: join(__dirname, "..", ".env") });

const prisma = new PrismaClient();
const seedPath = join(__dirname, "..", "..", "..", "seed_items", "trading_accounts.json");

async function main() {
  const seedFile = await readFile(seedPath, "utf8");
  const payload = JSON.parse(seedFile);

  if (!Array.isArray(payload.items)) {
    throw new Error("Expected seed_items/trading_accounts.json to contain an items array");
  }

  const traders = await prisma.trader.findMany({
    select: {
      id: true,
    },
  });
  const traderIds = new Set(traders.map((trader) => trader.id));
  const missingTraderIds = new Set();

  for (const item of payload.items) {
    const accountInput = toTradingAccountInput(item, traderIds, missingTraderIds);

    if (!accountInput) {
      continue;
    }

    await prisma.tradingAccount.upsert({
      where: {
        id: toNumber(item.id),
      },
      create: accountInput,
      update: accountInput,
    });
  }

  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('trading_accounts', 'id'),
      COALESCE((SELECT MAX(id) FROM trading_accounts), 1),
      true
    )
  `;

  if (missingTraderIds.size > 0) {
    console.warn(
      `Skipped trading accounts with missing trader IDs: ${Array.from(missingTraderIds).join(", ")}`,
    );
  }

  console.log(`Seeded ${payload.items.length - missingTraderIds.size} trading accounts`);
}

function toTradingAccountInput(item, traderIds, missingTraderIds) {
  const traderId = toCustomerId(item.customer);

  if (!traderIds.has(traderId)) {
    missingTraderIds.add(traderId);
    return null;
  }

  return {
    id: toNumber(item.id),
    login: toStringValue(item.login),
    traderId,
    currency: toNullableString(item.currency),
    accountGroup: toNullableString(item.group),
    balance: toDecimal(item.balance),
    equity: toDecimal(item.equity),
    volume: toDecimal(item.volume),
    margin: toDecimal(item.margin),
    marginFree: toDecimal(item.margin_free),
    marginLevel: toDecimal(item.margin_level),
    createdAt: toDate(item.created_at),
    actions: toJsonValue(item.actions),
  };
}

function toCustomerId(value) {
  if (value === null || value === undefined) {
    throw new Error("Expected trading account customer to contain an id");
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected a customer object, received ${value}`);
  }

  return toNumber(value.id);
}

function toNumber(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Expected a number, received ${value}`);
  }

  return numberValue;
}

function toStringValue(value) {
  if (value === null || value === undefined || value === "") {
    throw new Error(`Expected a non-empty string value, received ${value}`);
  }

  return String(value);
}

function toNullableString(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toDecimal(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const normalizedValue = String(value).replace(/[$,\s]/g, "");
  const numberValue = Number(normalizedValue);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Expected a decimal value, received ${value}`);
  }

  return normalizedValue;
}

function toDate(value) {
  if (typeof value !== "string") {
    throw new Error(`Expected a date string, received ${value}`);
  }

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return date;
}

function toJsonValue(value) {
  return value === undefined ? null : value;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
