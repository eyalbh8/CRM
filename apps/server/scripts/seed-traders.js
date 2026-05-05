const { readFile } = require("node:fs/promises");
const { join } = require("node:path");
const { config } = require("dotenv");
const { PrismaClient } = require("@prisma/client");

config({ path: join(__dirname, "..", ".env") });

const prisma = new PrismaClient();
const seedPath = join(__dirname, "..", "..", "..", "seed_items", "traders.json");

async function main() {
  const seedFile = await readFile(seedPath, "utf8");
  const payload = JSON.parse(seedFile);

  if (!Array.isArray(payload.items)) {
    throw new Error("Expected seed_items/traders.json to contain an items array");
  }

  await ensureCampaignReferences(payload.items);

  const desks = await prisma.desk.findMany({
    select: {
      id: true,
    },
  });
  const deskIds = new Set(desks.map((desk) => desk.id));
  const missingDeskIds = new Set();

  for (const item of payload.items) {
    await prisma.trader.upsert({
      where: {
        id: toNumber(item.id),
      },
      create: toTraderInput(item, deskIds, missingDeskIds),
      update: toTraderInput(item, deskIds, missingDeskIds),
    });
  }

  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('traders', 'id'),
      COALESCE((SELECT MAX(id) FROM traders), 1),
      true
    )
  `;

  if (missingDeskIds.size > 0) {
    console.warn(
      `Skipped missing trader desk IDs: ${Array.from(missingDeskIds).join(", ")}`,
    );
  }

  console.log(`Seeded ${payload.items.length} traders`);
}

async function ensureCampaignReferences(items) {
  const campaignRefs = new Map();

  for (const item of items) {
    if (item.campaign && typeof item.campaign === "object" && !Array.isArray(item.campaign)) {
      campaignRefs.set(toNumber(item.campaign.id), toNullableString(item.campaign.name));
    }
  }

  for (const [id, name] of campaignRefs) {
    await prisma.campaign.upsert({
      where: {
        id,
      },
      create: {
        id,
        name: name ?? `Campaign ${id}`,
        calculationType: "Unknown",
      },
      update: {
        name: name ?? undefined,
      },
    });
  }

  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('campaigns', 'id'),
      COALESCE((SELECT MAX(id) FROM campaigns), 1),
      true
    )
  `;
}

function toTraderInput(item, deskIds, missingDeskIds) {
  return {
    id: toNumber(item.id),
    mt5Login: toJsonValue(item.mt5_login),
    promoCode: toNullableString(item.promo_code),
    fname: toNestedString(item.fname, "name"),
    selfStatus: toNestedString(item.self_status, "value"),
    email: toNullableString(item.email),
    phone: toNestedString(item.phone, "phone_formatted"),
    campaignId: toNestedId(item.campaign),
    brokerEmployee: toJsonValue(item.broker_employee),
    financeEmployee: toJsonValue(item.finance_employee),
    deskId: toDeskId(item.desk, deskIds, missingDeskIds),
    country: toNullableString(item.country),
    city: toNullableString(item.city),
    tradingServer: toNullableString(item.trading_server),
    balance: toMoneyDecimal(item.balance),
    currency: toNullableString(item.currency),
    totalDeposits: toMoneyDecimal(item.total_deposits),
    totalWithdrawals: toMoneyDecimal(item.total_withdrawals),
    totalBonuses: toMoneyDecimal(item.total_bonuses),
    validationStatus: toNullableString(item.validation_status),
    retentionStatus: toNestedString(item.retention_status, "value"),
    potentialStatus: toNestedString(item.potential_status, "value"),
    forcedStrategy: toNullableString(item.forced_strategy),
    active: toBoolean(item.active),
    activeTrading: toBoolean(item.active_trading),
    activeDeposit: toBoolean(item.active_deposit),
    lastLogin: toNullableDate(item.last_login),
    lastCommunication: toNullableString(item.last_communication),
    lastReminderStartAt: toNullableDate(item.last_reminder_start_at),
    note: toNestedString(item.note, "value"),
    memo: toNestedString(item.memo, "value"),
    lastCommunicationDate: toNullableDate(item.last_communication_date),
    importAAid: toNullableString(item.import_a_aid),
    importABid: toNullableString(item.import_a_bid),
    importACid: toNullableString(item.import_a_cid),
    createdAt: toDate(item.created_at),
    ftdDate: toNullableDate(item.ftd_date),
    lastChangeBrokerDate: toNullableDate(item.last_change_broker_date),
    lastChangeDeskDate: toNullableDate(item.last_change_desk_date),
    lastIp: toNullableString(item.last_ip),
    lastOpenDateTrade: toNullableDate(item.last_open_date_trade),
    reDepositDate: toNullableDate(item.re_deposit_date),
    resident: toNullableString(item.resident),
    markFtdEmployee: toJsonValue(item.mark_ftd_employee),
    registrationCity: toNullableString(item.registration_city),
    registrationIp: toNullableString(item.registration_ip),
  };
}

function toNumber(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Expected a number, received ${value}`);
  }

  return numberValue;
}

function toNullableString(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toNestedString(value, key) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return toNullableString(value);
  }

  return toNullableString(value[key]);
}

function toNestedId(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected an object with an id, received ${value}`);
  }

  return toNumber(value.id);
}

function toDeskId(value, deskIds, missingDeskIds) {
  const deskId = toNestedId(value);

  if (deskId === null || deskIds.has(deskId)) {
    return deskId;
  }

  missingDeskIds.add(deskId);
  return null;
}

function toBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function toMoneyDecimal(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const normalizedValue = String(value).replace(/[$,\s]/g, "");
  const numberValue = Number(normalizedValue);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Expected a money value, received ${value}`);
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

function toNullableDate(value) {
  return typeof value === "string" && value.length > 0 ? toDate(value) : null;
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
