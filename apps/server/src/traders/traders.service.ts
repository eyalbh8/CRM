import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { TRADER_TABLE_COLUMNS, type TraderColumn } from "./traders.columns";

export type TraderRow = Record<string, unknown>;

export type TradersTableResponse = {
  columns: TraderColumn[];
  data: TraderRow[];
};

export type CreateTraderInput = {
  fname?: unknown;
  lname?: unknown;
  email?: unknown;
  password?: unknown;
  phone?: unknown;
  country?: unknown;
  desk_id?: unknown;
  campaign_id?: unknown;
  affiliate_id?: unknown;
  broker_id?: unknown;
  trading_server?: unknown;
  comment?: unknown;
};

/** Partial update (snake_case keys align with table row fields). */
export type PatchTraderInput = {
  last_communication?: unknown;
  note?: unknown;
  memo?: unknown;
};

export type TraderCreateFormOption = {
  label: string;
  value: number;
};

export type TraderCreateFormResponse = {
  campaigns: TraderCreateFormOption[];
  desks: TraderCreateFormOption[];
  employees: TraderCreateFormOption[];
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

  async getCreateFormOptions(): Promise<TraderCreateFormResponse> {
    const [campaigns, desks, employees] = await Promise.all([
      this.prisma.campaign.findMany({
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
        },
      }),
      this.prisma.desk.findMany({
        orderBy: {
          deskName: "asc",
        },
        select: {
          deskName: true,
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

    return {
      campaigns: campaigns.map((campaign) => ({
        label: campaign.name,
        value: campaign.id,
      })),
      desks: desks.map((desk) => ({
        label: desk.deskName,
        value: desk.id,
      })),
      employees: employees.map((employee) => ({
        label: employee.fname,
        value: employee.id,
      })),
    };
  }

  async create(input: CreateTraderInput): Promise<TraderRow> {
    const firstName = toNullableString(input.fname);
    const lastName = toNullableString(input.lname);
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || null;
    const brokerEmployee = await this.toEmployeeJson(input.broker_id);
    const financeEmployee = await this.toEmployeeJson(input.affiliate_id);
    const deskId = await this.toExistingDeskId(input.desk_id);
    const campaignId = await this.toExistingCampaignId(input.campaign_id);

    const trader = await this.prisma.trader.create({
      data: {
        fname: fullName,
        email: toNullableString(input.email),
        phone: toNullableString(input.phone),
        country: toNullableString(input.country),
        deskId,
        campaignId,
        brokerEmployee,
        financeEmployee,
        tradingServer: toNullableString(input.trading_server),
        note: toNullableString(input.comment),
        active: true,
        activeDeposit: false,
        activeTrading: false,
        balance: "0",
        currency: "USD",
        selfStatus: "New",
        totalBonuses: "0",
        totalDeposits: "0",
        totalWithdrawals: "0",
        validationStatus: "Not Verified",
      },
      include: {
        campaign: true,
        desk: true,
      },
    });

    return this.toTableRow(trader);
  }

  async patch(id: number, input: PatchTraderInput): Promise<TraderRow> {
    if (!Number.isFinite(id) || id < 1) {
      throw new NotFoundException();
    }

    const data: Prisma.TraderUpdateInput = {};

    if ("last_communication" in input) {
      const text = patchNullableString(input.last_communication);
      data.lastCommunication = text;
      data.lastCommunicationDate = text ? new Date() : null;
    }

    if ("note" in input) {
      data.note = patchNullableString(input.note);
    }

    if ("memo" in input) {
      data.memo = patchNullableString(input.memo);
    }

    if (Object.keys(data).length === 0) {
      const existing = await this.prisma.trader.findUnique({
        where: { id },
        include: { campaign: true, desk: true },
      });
      if (!existing) {
        throw new NotFoundException();
      }
      return this.toTableRow(existing);
    }

    try {
      const trader = await this.prisma.trader.update({
        where: { id },
        data,
        include: {
          campaign: true,
          desk: true,
        },
      });
      return this.toTableRow(trader);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new NotFoundException();
      }
      throw error;
    }
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

  private async toExistingDeskId(value: unknown) {
    const deskId = toNullableNumber(value);

    if (!deskId) {
      return null;
    }

    const desk = await this.prisma.desk.findUnique({
      where: {
        id: deskId,
      },
      select: {
        id: true,
      },
    });

    return desk?.id ?? null;
  }

  private async toExistingCampaignId(value: unknown) {
    const campaignId = toNullableNumber(value);

    if (!campaignId) {
      return null;
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
      select: {
        id: true,
      },
    });

    return campaign?.id ?? null;
  }

  private async toEmployeeJson(value: unknown): Promise<Prisma.InputJsonValue | undefined> {
    const employeeId = toNullableNumber(value);

    if (!employeeId) {
      return undefined;
    }

    const employee = await this.prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      select: {
        id: true,
        fname: true,
      },
    });

    if (!employee) {
      return undefined;
    }

    return {
      id: employee.id,
      name: employee.fname,
    };
  }
}

function toNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function patchNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}
