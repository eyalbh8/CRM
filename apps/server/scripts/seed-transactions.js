const { join } = require("node:path");
const { config } = require("dotenv");
const { PrismaClient } = require("@prisma/client");

config({ path: join(__dirname, "..", ".env") });

const prisma = new PrismaClient();

const mockTransactions = [
  {
    id: 9001,
    value: "2500.00",
    type: "Deposit",
    createdFrom: "Backoffice",
    meta: { comment: "Initial card deposit", payment_method: "Credit Card", status: "Approved" },
  },
  {
    id: 9002,
    value: "750.00",
    type: "Deposit",
    createdFrom: "Customer Portal",
    meta: { comment: "Follow-up deposit", payment_method: "Wire Transfer", status: "Approved" },
  },
  {
    id: 9003,
    value: "-300.00",
    type: "Withdrawal",
    createdFrom: "Backoffice",
    meta: { comment: "Partial withdrawal request", payment_method: "Bank Transfer", status: "Pending" },
  },
  {
    id: 9004,
    value: "125.00",
    type: "Bonus",
    createdFrom: "Campaign",
    meta: { comment: "Welcome campaign bonus", payment_method: "Bonus", status: "Approved" },
  },
  {
    id: 9005,
    value: "-25.00",
    type: "Fee",
    createdFrom: "Trading Server",
    meta: { comment: "Monthly inactivity fee", payment_method: "Balance", status: "Approved" },
  },
  {
    id: 9006,
    value: "5000.00",
    type: "Deposit",
    createdFrom: "Backoffice",
    meta: { comment: "VIP wire deposit", payment_method: "Wire Transfer", status: "Approved" },
  },
  {
    id: 9007,
    value: "-1200.00",
    type: "Withdrawal",
    createdFrom: "Customer Portal",
    meta: { comment: "Approved profit withdrawal", payment_method: "Bank Transfer", status: "Approved" },
  },
  {
    id: 9008,
    value: "300.00",
    type: "Adjustment",
    createdFrom: "Finance",
    meta: { comment: "Manual balance correction", payment_method: "Adjustment", status: "Approved" },
  },
  {
    id: 9009,
    value: "-150.00",
    type: "Chargeback",
    createdFrom: "Payments",
    meta: { comment: "Processor chargeback notice", payment_method: "Credit Card", status: "Review" },
  },
  {
    id: 9010,
    value: "1000.00",
    type: "Deposit",
    createdFrom: "Customer Portal",
    meta: { comment: "Crypto deposit confirmed", payment_method: "Crypto", status: "Approved" },
  },
  {
    id: 9011,
    value: "200.00",
    type: "Bonus",
    createdFrom: "Retention",
    meta: { comment: "Retention bonus", payment_method: "Bonus", status: "Approved" },
  },
  {
    id: 9012,
    value: "-60.00",
    type: "Fee",
    createdFrom: "Trading Server",
    meta: { comment: "Swap correction", payment_method: "Balance", status: "Approved" },
  },
];

async function main() {
  const [tradingAccounts, traders, employees] = await Promise.all([
    prisma.tradingAccount.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        traderId: true,
        balance: true,
        trader: {
          select: {
            country: true,
          },
        },
      },
    }),
    prisma.trader.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        country: true,
      },
    }),
    prisma.employee.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (traders.length === 0) {
    throw new Error("Seed traders before adding mock transactions");
  }

  const transactionSources =
    tradingAccounts.length > 0
      ? tradingAccounts.map((account) => ({
          accountId: account.id,
          balanceBefore: account.balance.toString(),
          country: account.trader.country,
          traderId: account.traderId,
        }))
      : traders.map((trader) => ({
          accountId: null,
          balanceBefore: "0",
          country: trader.country,
          traderId: trader.id,
        }));

  for (const [index, transaction] of mockTransactions.entries()) {
    const source = transactionSources[index % transactionSources.length];
    const brokerEmployeeId = getEmployeeId(employees, index);
    const employeeId = getEmployeeId(employees, index + 1);
    const createdByEmployeeId = getEmployeeId(employees, index + 2);

    await prisma.transaction.upsert({
      where: {
        id: transaction.id,
      },
      create: {
        id: transaction.id,
        value: transaction.value,
        baseCurrencyValue: transaction.value,
        transactionType: transaction.type,
        country: source.country,
        customerId: source.traderId,
        brokerEmployeeId,
        employeeId,
        createdByEmployeeId,
        createdFrom: transaction.createdFrom,
        meta: transaction.meta,
        tradingAccountId: source.accountId,
        balanceBefore: source.balanceBefore,
        createdAt: toMockDate(index),
        actions: [
          {
            label: "View",
            action: "view",
          },
        ],
      },
      update: {
        value: transaction.value,
        baseCurrencyValue: transaction.value,
        transactionType: transaction.type,
        country: source.country,
        customerId: source.traderId,
        brokerEmployeeId,
        employeeId,
        createdByEmployeeId,
        createdFrom: transaction.createdFrom,
        meta: transaction.meta,
        tradingAccountId: source.accountId,
        balanceBefore: source.balanceBefore,
        createdAt: toMockDate(index),
        actions: [
          {
            label: "View",
            action: "view",
          },
        ],
      },
    });
  }

  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('transactions', 'id'),
      COALESCE((SELECT MAX(id) FROM transactions), 1),
      true
    )
  `;

  console.log(`Seeded ${mockTransactions.length} mock transactions`);
}

function getEmployeeId(employees, index) {
  if (employees.length === 0) {
    return null;
  }

  return employees[index % employees.length].id;
}

function toMockDate(index) {
  const date = new Date("2026-05-05T09:00:00.000Z");
  date.setMinutes(date.getMinutes() + index * 17);
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
