import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { TRANSACTION_TABLE_COLUMNS, type TransactionColumn } from "./transactions.columns";

export type TransactionRow = Record<string, unknown>;

export type TransactionsTableResponse = {
  columns: TransactionColumn[];
  data: TransactionRow[];
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
    const transactions = await this.prisma.transaction.findMany({
      include: {
        brokerEmployee: true,
        createdByEmployee: true,
        customer: true,
        employee: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return {
      columns: TRANSACTION_TABLE_COLUMNS,
      data: transactions.map((transaction) => this.toTableRow(transaction)),
    };
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
      employee: transaction.employee?.fname ?? null,
      created_by_employee: transaction.createdByEmployee?.fname ?? null,
      created_from: transaction.createdFrom,
      meta: transaction.meta,
      trading_account_id: transaction.tradingAccountId,
      balance_before: transaction.balanceBefore.toString(),
      created_at: transaction.createdAt.toISOString(),
      actions: transaction.actions,
      customer_id: transaction.customerId,
    };
  }
}
