import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { TRANSACTION_TABLE_COLUMNS, type TransactionColumn } from "./transactions.columns";

export type TransactionRow = Record<string, unknown>;

export type TransactionsTableResponse = {
  columns: TransactionColumn[];
  filters: TransactionFilter[];
  data: TransactionRow[];
};

export type TransactionFilter = {
  key: string;
  type: "select";
  label: string;
  values: TransactionCreateFormOption[];
};

export type CreateTransactionInput = {
  trading_account_id?: unknown;
  value?: unknown;
  type?: unknown;
  employee_id?: unknown;
  created_by_employee_id?: unknown;
  created_from?: unknown;
  comment?: unknown;
};

export type TransactionCreateFormOption = {
  label: string;
  value: number | string;
};

export type TransactionCreateFormResponse = {
  employees: TransactionCreateFormOption[];
  tradingAccounts: Array<TransactionCreateFormOption & { balance: string; traderId: number }>;
  transactionTypes: TransactionCreateFormOption[];
};

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    brokerEmployee: true;
    createdByEmployee: true;
    customer: true;
    employee: true;
  };
}>;

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TransactionsTableResponse> {
    const [transactions, filters] = await Promise.all([
      this.prisma.transaction.findMany({
        include: {
          brokerEmployee: true,
          createdByEmployee: true,
          customer: true,
          employee: true,
        },
        orderBy: {
          id: "asc",
        },
      }),
      this.getFilters(),
    ]);

    return {
      columns: TRANSACTION_TABLE_COLUMNS,
      filters,
      data: transactions.map((transaction) => this.toTableRow(transaction)),
    };
  }

  async getCreateFormOptions(): Promise<TransactionCreateFormResponse> {
    const [employees, tradingAccounts] = await Promise.all([
      this.prisma.employee.findMany({
        orderBy: {
          fname: "asc",
        },
        select: {
          fname: true,
          id: true,
        },
      }),
      this.prisma.tradingAccount.findMany({
        include: {
          trader: true,
        },
        orderBy: {
          id: "asc",
        },
      }),
    ]);

    return {
      employees: employees.map((employee) => ({
        label: employee.fname,
        value: employee.id,
      })),
      tradingAccounts: tradingAccounts.map((account) => ({
        label: `${account.login} - ${account.trader.fname ?? `Trader ${account.traderId}`} (${account.balance.toString()} ${account.currency ?? ""})`,
        value: account.id,
        balance: account.balance.toString(),
        traderId: account.traderId,
      })),
      transactionTypes: ["Deposit", "Withdrawal", "Bonus", "Fee", "Adjustment", "Chargeback"].map(
        (transactionType) => ({
          label: transactionType,
          value: transactionType,
        }),
      ),
    };
  }

  async create(input: CreateTransactionInput): Promise<TransactionRow> {
    const tradingAccountId = toRequiredNumber(input.trading_account_id, "trading_account_id");
    const value = toRequiredDecimal(input.value, "value");
    const transactionType = toNullableString(input.type) ?? "Adjustment";
    const employeeId = await this.toExistingEmployeeId(input.employee_id);
    const createdByEmployeeId = await this.toExistingEmployeeId(input.created_by_employee_id);
    const createdFrom = toNullableString(input.created_from) ?? "UI";
    const comment = toNullableString(input.comment);

    const transactionId = await this.prisma.$transaction(async (tx) => {
      const account = await tx.tradingAccount.findUnique({
        where: {
          id: tradingAccountId,
        },
        include: {
          trader: true,
        },
      });

      if (!account) {
        throw new NotFoundException(`Trading account ${tradingAccountId} was not found`);
      }

      const balanceBefore = account.balance;
      const balanceAfter = balanceBefore.plus(value);

      await tx.tradingAccount.update({
        where: {
          id: account.id,
        },
        data: {
          balance: balanceAfter,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          value,
          baseCurrencyValue: value,
          transactionType,
          country: account.trader.country,
          customerId: account.traderId,
          brokerEmployeeId: employeeId,
          employeeId,
          createdByEmployeeId,
          createdFrom,
          meta: comment ? { comment } : Prisma.JsonNull,
          tradingAccountId: account.id,
          balanceBefore,
          actions: [
            {
              label: "View",
              action: "view",
            },
          ],
        },
      });

      return transaction.id;
    });

    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        brokerEmployee: true,
        createdByEmployee: true,
        customer: true,
        employee: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} was not found`);
    }

    return this.toTableRow(transaction);
  }

  private toTableRow(transaction: TransactionWithRelations): TransactionRow {
    return {
      id: transaction.id,
      value: transaction.value.toString(),
      base_currency_value: transaction.baseCurrencyValue.toString(),
      type: transaction.transactionType,
      country: transaction.country,
      customer: transaction.customer.fname,
      broker_employee: transaction.brokerEmployee?.fname ?? null,
      broker_employee_id: transaction.brokerEmployeeId,
      employee: transaction.employee?.fname ?? null,
      employee_id: transaction.employeeId,
      created_by_employee: transaction.createdByEmployee?.fname ?? null,
      created_by_employee_id: transaction.createdByEmployeeId,
      created_from: transaction.createdFrom,
      meta: transaction.meta,
      trading_account_id: transaction.tradingAccountId,
      balance_before: transaction.balanceBefore.toString(),
      created_at: transaction.createdAt.toISOString(),
      actions: transaction.actions,
      customer_id: transaction.customerId,
    };
  }

  private async getFilters(): Promise<TransactionFilter[]> {
    const [traders, employees] = await Promise.all([
      this.prisma.trader.findMany({
        orderBy: {
          fname: "asc",
        },
        select: {
          fname: true,
          id: true,
        },
      }),
      this.prisma.employee.findMany({
        orderBy: {
          fname: "asc",
        },
        select: {
          fname: true,
          id: true,
        },
      }),
    ]);

    const traderValues = traders.map((trader) => ({
      label: `${trader.fname ?? "Trader"} [${trader.id}]`,
      value: trader.id,
    }));
    const employeeValues = employees.map((employee) => ({
      label: `${employee.fname} [${employee.id}]`,
      value: employee.id,
    }));

    return [
      {
        key: "customer_id",
        type: "select",
        label: "Trader",
        values: traderValues,
      },
      {
        key: "broker_employee_id",
        type: "select",
        label: "Current Broker",
        values: employeeValues,
      },
      {
        key: "employee_id",
        type: "select",
        label: "Assigned Broker",
        values: employeeValues,
      },
      {
        key: "created_by_employee_id",
        type: "select",
        label: "Created By Employee",
        values: employeeValues,
      },
    ];
  }

  private async toExistingEmployeeId(value: unknown) {
    const employeeId = toNullableNumber(value);

    if (!employeeId) {
      return null;
    }

    const employee = await this.prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      select: {
        id: true,
      },
    });

    return employee?.id ?? null;
  }
}

function toRequiredDecimal(value: unknown, fieldName: string) {
  if (value === null || value === undefined || value === "") {
    throw new BadRequestException(`${fieldName} is required`);
  }

  const normalizedValue = String(value).replace(/[$,\s]/g, "");
  const decimalValue = new Prisma.Decimal(normalizedValue);

  if (!decimalValue.isFinite()) {
    throw new BadRequestException(`${fieldName} must be a valid decimal`);
  }

  return decimalValue;
}

function toRequiredNumber(value: unknown, fieldName: string) {
  const numberValue = toNullableNumber(value);

  if (!numberValue) {
    throw new BadRequestException(`${fieldName} is required`);
  }

  return numberValue;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isInteger(numberValue) ? numberValue : null;
}

function toNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}
