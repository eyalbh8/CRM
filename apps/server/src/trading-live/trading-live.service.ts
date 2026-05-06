import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { TRADING_LIVE_COLUMNS, type TradingLiveColumn } from "./trading-live.columns";

export type TradingLiveRow = Record<string, unknown>;

export type TradingLiveResponse = {
  columns: TradingLiveColumn[];
  data: TradingLiveRow[];
};

type TraderWithAccounts = Prisma.TraderGetPayload<{
  include: {
    tradingAccounts: true;
  };
}>;

@Injectable()
export class TradingLiveService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TradingLiveResponse> {
    const traders = await this.prisma.trader.findMany({
      include: {
        tradingAccounts: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return {
      columns: TRADING_LIVE_COLUMNS,
      data: traders.map((trader) => this.toRow(trader)),
    };
  }

  private toRow(trader: TraderWithAccounts): TradingLiveRow {
    const accounts = trader.tradingAccounts;

    const sumOf = (field: keyof typeof accounts[0]): number =>
      accounts.reduce((acc, a) => acc + Number(a[field] ?? 0), 0);

    const balance = sumOf("balance");
    const equity = sumOf("equity");
    const margin = sumOf("margin");
    const marginFree = sumOf("marginFree");
    const marginLevel = accounts.length > 0 ? sumOf("marginLevel") / accounts.length : 0;
    const pnl = equity - balance;

    const activePositionsCount = accounts.reduce((acc, a) => {
      const actions = a.actions;
      if (actions && typeof actions === "object" && !Array.isArray(actions)) {
        const ap = (actions as Record<string, unknown>).active_positions;
        return acc + (typeof ap === "number" ? ap : 0);
      }
      return acc;
    }, 0);

    const allPositionsCount = accounts.reduce((acc, a) => {
      const actions = a.actions;
      if (actions && typeof actions === "object" && !Array.isArray(actions)) {
        const ap = (actions as Record<string, unknown>).all_positions;
        return acc + (typeof ap === "number" ? ap : 0);
      }
      return acc;
    }, 0);

    return {
      id: trader.id,
      name: trader.fname ?? null,
      self_status: trader.selfStatus ?? null,
      retention_status: trader.retentionStatus ?? null,
      email: trader.email ?? null,
      phone: trader.phone ?? null,
      active_positions_count: activePositionsCount,
      all_positions_count: allPositionsCount,
      bonus: Number(trader.totalBonuses ?? 0),
      balance,
      active_margin: margin,
      pnl,
      free: marginFree,
      equity,
      margin_level: marginLevel,
    };
  }
}
