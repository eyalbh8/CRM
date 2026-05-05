const { readFile } = require("node:fs/promises");
const { join } = require("node:path");
const { config } = require("dotenv");
const { PrismaClient } = require("@prisma/client");

config({ path: join(__dirname, "..", ".env") });

const prisma = new PrismaClient();
const seedPath = join(__dirname, "..", "..", "..", "seed_items", "employees.json");

async function main() {
  const seedFile = await readFile(seedPath, "utf8");
  const payload = JSON.parse(seedFile);

  if (!Array.isArray(payload.items)) {
    throw new Error("Expected seed_items/employees.json to contain an items array");
  }

  for (const item of payload.items) {
    await prisma.employee.upsert({
      where: {
        id: toNumber(item.id),
      },
      create: toEmployeeInput(item),
      update: toEmployeeInput(item),
    });
  }

  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('employees', 'id'),
      COALESCE((SELECT MAX(id) FROM employees), 1),
      true
    )
  `;

  console.log(`Seeded ${payload.items.length} employees`);
}

function toEmployeeInput(item) {
  return {
    id: toNumber(item.id),
    login: toStringValue(item.login),
    fname: toStringValue(item.fname),
    customersCount: toNumber(item.customers_count),
    financeCustomersCount: toNumber(item.finance_customers_count),
    aclPermissions: toJsonValue(item.acl_permissions),
    phoneExtDesk: toNullableString(item.phone_ext_desk),
    phoneExt: toJsonValue(item.phone_ext),
    email: toNullableString(item.email),
    language: toNullableString(item.language),
    google2faEnable: toBoolean(item.google2fa_enable),
    additionalSecurityEnable: toBoolean(item.additional_security_enable),
    department: toNullableString(item.group),
    active: toBoolean(item.active),
    passwordRevoked: toBoolean(item.password_revoked),
    createdAt: toDate(item.created_at),
    lastLogin: item.last_login ? toDate(item.last_login) : null,
    actions: toJsonValue(item.actions),
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
