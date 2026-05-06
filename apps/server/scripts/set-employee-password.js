const { join } = require("node:path");
const { config } = require("dotenv");
const { hash } = require("argon2");
const { PrismaClient } = require("@prisma/client");

config({ path: join(__dirname, "..", ".env") });

const prisma = new PrismaClient();

async function main() {
  const email = normalizeEmail(process.env.EMPLOYEE_EMAIL || process.argv[2]);
  const password = process.env.EMPLOYEE_PASSWORD || process.argv[3];

  if (!email || !password) {
    throw new Error(
      "Usage: EMPLOYEE_EMAIL=<email> EMPLOYEE_PASSWORD=<password> npm run employee:set-password --workspace apps/server",
    );
  }

  if (password.length < 8) {
    throw new Error("Employee password must be at least 8 characters");
  }

  const employee = await prisma.employee.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      active: true,
      email: true,
    },
  });

  if (!employee) {
    throw new Error(`Employee email "${email}" was not found`);
  }

  if (!employee.active) {
    throw new Error(`Employee email "${email}" is inactive`);
  }

  await prisma.employee.update({
    where: {
      id: employee.id,
    },
    data: {
      passwordHash: await hash(toPasswordSecret(employee.email, password)),
      passwordRevoked: false,
    },
  });

  console.log(`Password hash updated for employee "${email}"`);
}

function normalizeEmail(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim().toLowerCase() : null;
}

function toPasswordSecret(email, password) {
  return `${email.toLowerCase()}\0${password}`;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
