import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import {
  TRADING_ACCOUNT_TABLE_COLUMNS,
  type TradingAccountColumn,
  type TradingAccountFilter,
} from "./trading-accounts.columns";

export type TradingAccountRow = Record<string, unknown>;

export type TradingAccountsTableResponse = {
  columns: TradingAccountColumn[];
  filters: TradingAccountFilter[];
  data: TradingAccountRow[];
};

type TradingAccountWithTrader = Prisma.TradingAccountGetPayload<{
  include: {
    trader: true;
  };
}>;

@Injectable()
export class TradingAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TradingAccountsTableResponse> {
    const [accounts, filters] = await Promise.all([
      this.prisma.tradingAccount.findMany({
        include: {
          trader: true,
        },
        orderBy: {
          id: "asc",
        },
      }),
      this.getFilters(),
    ]);

    return {
      columns: TRADING_ACCOUNT_TABLE_COLUMNS,
      filters,
      data: accounts.map((account) => this.toTableRow(account)),
    };
  }

  private async getFilters(): Promise<TradingAccountFilter[]> {
    const [desks, employees] = await Promise.all([
      this.prisma.desk.findMany({
        orderBy: {
          id: "asc",
        },
      }),
      this.prisma.employee.findMany({
        orderBy: {
          id: "asc",
        },
      }),
    ]);

    return [
      {
        multiple: true,
        values: desks.map((desk) => ({
          value: desk.id,
          label: desk.deskName,
        })),
        key: "desk_id",
        type: "select",
        label: "Desk",
        query: {},
        associated_column_key: null,
        order: 0,
      },
      {
        multiple: true,
        values: employees.map((employee) => ({
          value: employee.id,
          label: `${employee.fname} [${employee.id}]`,
        })),
        key: "broker",
        type: "select",
        label: "Broker",
        query: {},
        associated_column_key: null,
        order: 1,
      },
      {
        key: "trader",
        type: "search",
        label: "Trader Name",
        query: {},
        associated_column_key: null,
        order: 2,
      },
      {
        key: "trader_id",
        type: "tags",
        label: "Trader Id",
        query: {},
        associated_column_key: null,
        order: 3,
      },
    ];
  }

  private toTableRow(account: TradingAccountWithTrader): TradingAccountRow {
    return {
      id: account.id,
      login: account.login,
      customer: account.trader.fname,
      currency: account.currency,
      group: account.accountGroup,
      balance: account.balance.toString(),
      equity: account.equity.toString(),
      volume: account.volume.toString(),
      margin: account.margin.toString(),
      margin_free: account.marginFree.toString(),
      margin_level: account.marginLevel.toString(),
      created_at: account.createdAt.toISOString(),
      actions: account.actions,
    };
  }
}
