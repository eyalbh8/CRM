const { readFile } = require("node:fs/promises");
const { join } = require("node:path");
const { config } = require("dotenv");
const { PrismaClient } = require("@prisma/client");

config({ path: join(__dirname, "..", ".env") });

const prisma = new PrismaClient();
const seedPath = join(__dirname, "..", "..", "..", "seed_items", "campaigns.json");

async function main() {
  const seedFile = await readFile(seedPath, "utf8");
  const payload = JSON.parse(seedFile);

  if (!Array.isArray(payload.items)) {
    throw new Error("Expected seed_items/campaigns.json to contain an items array");
  }

  const employees = await prisma.employee.findMany({
    select: {
      id: true,
    },
  });
  const employeeIds = new Set(employees.map((employee) => employee.id));
  const missingCreatorIds = new Set();

  for (const item of payload.items) {
    await prisma.campaign.upsert({
      where: {
        id: toNumber(item.id),
      },
      create: toCampaignInput(item, employeeIds, missingCreatorIds),
      update: toCampaignInput(item, employeeIds, missingCreatorIds),
    });
  }

  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('campaigns', 'id'),
      COALESCE((SELECT MAX(id) FROM campaigns), 1),
      true
    )
  `;

  if (missingCreatorIds.size > 0) {
    console.warn(
      `Skipped missing campaign creator employee IDs: ${Array.from(missingCreatorIds).join(", ")}`,
    );
  }

  console.log(`Seeded ${payload.items.length} campaigns`);
}

function toCampaignInput(item, employeeIds, missingCreatorIds) {
  return {
    id: toNumber(item.id),
    name: toStringValue(item.name),
    cost: toCostDecimal(item.cost),
    calculationType: toStringValue(item.calculation_type),
    customerCount: toNumber(item.customer_count),
    ftdCount: toNumber(item.ftd_count),
    redepositCount: toNumber(item.redeposit_count),
    creatorId: toCreatorId(item.creator, employeeIds, missingCreatorIds),
    createdAt: toDate(item.created_at),
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

function toCostDecimal(value) {
  if (typeof value !== "string") {
    throw new Error(`Expected a cost string, received ${value}`);
  }

  const normalizedValue = value.replace(/[$,\s]/g, "");
  const numberValue = Number(normalizedValue);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Expected a decimal cost, received ${value}`);
  }

  return normalizedValue;
}

function toCreatorId(value, employeeIds, missingCreatorIds) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected a creator object, received ${value}`);
  }

  const creatorId = toNumber(value.id);

  if (!employeeIds.has(creatorId)) {
    missingCreatorIds.add(creatorId);
    return null;
  }

  return creatorId;
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
