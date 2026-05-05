const { readFile } = require("node:fs/promises");
const { join } = require("node:path");
const { config } = require("dotenv");
const { PrismaClient } = require("@prisma/client");

config({ path: join(__dirname, "..", ".env") });

const prisma = new PrismaClient();
const seedPath = join(__dirname, "..", "..", "..", "seed_items", "desks.json");

async function main() {
  const seedFile = await readFile(seedPath, "utf8");
  const payload = JSON.parse(seedFile);

  if (!Array.isArray(payload.items)) {
    throw new Error("Expected seed_items/desks.json to contain an items array");
  }

  for (const item of payload.items) {
    await prisma.desk.upsert({
      where: {
        id: toNumber(item.id),
      },
      create: toDeskInput(item),
      update: toDeskInput(item),
    });
  }

  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('desks', 'id'),
      COALESCE((SELECT MAX(id) FROM desks), 1),
      true
    )
  `;

  console.log(`Seeded ${payload.items.length} desks`);
}

function toDeskInput(item) {
  return {
    id: toNumber(item.id),
    deskName: toStringValue(item.desk_name),
    active: toBoolean(item.active),
    chatEnabled: toBoolean(item.chat_enabled),
    minDeposit: toNullableDecimal(item.min_deposit),
    maxDeposit: toNullableDecimal(item.max_deposit),
    customersCount: toNumber(item.customers_count),
    linkTradePlatform: toNullableString(item.link_trade_platform),
    linkMtAccount: toNullableString(item.link_mt_account),
    createdAt: item.created_at ? toDate(item.created_at) : undefined,
  };
}

function toNumber(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Expected a number, received ${value}`);
  }

  return numberValue;
}

function toStringValue(value) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected a non-empty string, received ${value}`);
  }

  return value;
}

function toNullableString(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function toNullableDecimal(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Expected a decimal, received ${value}`);
  }

  return String(value);
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

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
