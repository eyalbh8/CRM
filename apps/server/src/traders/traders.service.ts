import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { TRADER_TABLE_COLUMNS, type TraderColumn } from "./traders.columns";

export type TraderRow = Record<string, unknown>;

export type TradersTableResponse = {
  columns: TraderColumn[];
  data: TraderRow[];
};

type TraderWithRelations = Prisma.TraderGetPayload<{
  include: {
    campaign: true;
    desk: true;
  };
}>;

@Injectable()
export class TradersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TradersTableResponse> {
    const traders = await this.prisma.trader.findMany({
      include: {
        campaign: true,
        desk: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return {
      columns: TRADER_TABLE_COLUMNS,
      data: traders.map((trader) => this.toTableRow(trader)),
    };
  }

  private toTableRow(trader: TraderWithRelations): TraderRow {
    return {
      id: trader.id,
      mt5_login: trader.mt5Login,
      promo_code: trader.promoCode,
      fname: trader.fname,
      self_status: trader.selfStatus,
      email: trader.email,
      phone: trader.phone,
      campaign: trader.campaign?.name ?? null,
      broker_employee: trader.brokerEmployee,
      finance_employee: trader.financeEmployee,
      desk: trader.desk?.deskName ?? null,
      country: trader.country,
      city: trader.city,
      trading_server: trader.tradingServer,
      balance: trader.balance.toString(),
      currency: trader.currency,
      total_deposits: trader.totalDeposits.toString(),
      total_withdrawals: trader.totalWithdrawals.toString(),
      total_bonuses: trader.totalBonuses.toString(),
      validation_status: trader.validationStatus,
      retention_status: trader.retentionStatus,
      potential_status: trader.potentialStatus,
      forced_strategy: trader.forcedStrategy,
      active: trader.active,
      active_trading: trader.activeTrading,
      active_deposit: trader.activeDeposit,
      last_login: trader.lastLogin?.toISOString() ?? null,
      last_communication: trader.lastCommunication,
      last_reminder_start_at: trader.lastReminderStartAt?.toISOString() ?? null,
      note: trader.note,
      memo: trader.memo,
      last_communication_date: trader.lastCommunicationDate?.toISOString() ?? null,
      import_a_aid: trader.importAAid,
      import_a_bid: trader.importABid,
      import_a_cid: trader.importACid,
      created_at: trader.createdAt.toISOString(),
      ftd_date: trader.ftdDate?.toISOString() ?? null,
      last_change_broker_date: trader.lastChangeBrokerDate?.toISOString() ?? null,
      last_change_desk_date: trader.lastChangeDeskDate?.toISOString() ?? null,
      last_ip: trader.lastIp,
      last_open_date_trade: trader.lastOpenDateTrade?.toISOString() ?? null,
      re_deposit_date: trader.reDepositDate?.toISOString() ?? null,
      resident: trader.resident,
      mark_ftd_employee: trader.markFtdEmployee,
      registration_city: trader.registrationCity,
      registration_ip: trader.registrationIp,
    };
  }
}
