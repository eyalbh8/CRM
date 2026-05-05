const { readFile } = require("node:fs/promises");
const { join } = require("node:path");
const { config } = require("dotenv");
const { PrismaClient } = require("@prisma/client");

config({ path: join(__dirname, "..", ".env") });

const prisma = new PrismaClient();
const seedPath = join(__dirname, "..", "..", "..", "seed_items", "assets.json");

async function main() {
  const seedFile = await readFile(seedPath, "utf8");
  const payload = JSON.parse(seedFile);

  if (!Array.isArray(payload.items)) {
    throw new Error("Expected seed_items/assets.json to contain an items array");
  }

  const assetGroups = await prisma.assetGroup.findMany({
    select: {
      id: true,
    },
  });
  const assetGroupIds = new Set(assetGroups.map((assetGroup) => assetGroup.id));
  const missingGroupIds = new Set();

  for (const item of payload.items) {
    await prisma.asset.upsert({
      where: {
        id: toNumber(item.id),
      },
      create: toAssetInput(item, assetGroupIds, missingGroupIds),
      update: toAssetInput(item, assetGroupIds, missingGroupIds),
    });
  }

  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('assets', 'id'),
      COALESCE((SELECT MAX(id) FROM assets), 1),
      true
    )
  `;

  if (missingGroupIds.size > 0) {
    console.warn(
      `Skipped missing asset group IDs: ${Array.from(missingGroupIds).join(", ")}`,
    );
  }

  console.log(`Seeded ${payload.items.length} assets`);
}

function toAssetInput(item, assetGroupIds, missingGroupIds) {
  return {
    id: toNumber(item.id),
    icon: toJsonValue(item.icon),
    name: toStringValue(item.name),
    description: toNullableString(item.description),
    groupId: toGroupId(item.group, assetGroupIds, missingGroupIds),
    payout: toDecimal(item.payout),
    leverage: toDecimal(item.leverage),
    size: toDecimal(item.size),
    unit: toNullableString(item.unit),
    swapBuy: toDecimal(item.swap_buy),
    swapSell: toDecimal(item.swap_sell),
    minimumChange: toDecimal(item.minimum_change),
    spread: toDecimal(item.spread),
    commission: toDecimal(item.commission),
    expiration: toNullableDate(item.expiration),
    custom: toBoolean(item.custom),
    tradingHours: toJsonValue(item.trading_hours),
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

function toGroupId(value, assetGroupIds, missingGroupIds) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const groupId = toNumber(value);

  if (!assetGroupIds.has(groupId)) {
    missingGroupIds.add(groupId);
    return null;
  }

  return groupId;
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

function toNullableDate(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Expected a date string, received ${value}`);
  }

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return date;
}

function toBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
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
