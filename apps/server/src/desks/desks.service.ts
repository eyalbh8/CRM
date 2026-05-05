import { Injectable } from "@nestjs/common";
import type { Desk } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { DESK_TABLE_COLUMNS, type DeskColumn } from "./desks.columns";

export type DeskRow = Record<string, unknown>;

export type DesksTableResponse = {
  columns: DeskColumn[];
  data: DeskRow[];
};

@Injectable()
export class DesksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<DesksTableResponse> {
    const desks = await this.prisma.desk.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return {
      columns: DESK_TABLE_COLUMNS,
      data: desks.map((desk) => this.toTableRow(desk)),
    };
  }

  private toTableRow(desk: Desk): DeskRow {
    return {
      id: desk.id,
      desk_name: desk.deskName,
      active: desk.active,
      chat_enabled: desk.chatEnabled,
      min_deposit: desk.minDeposit?.toString() ?? null,
      max_deposit: desk.maxDeposit?.toString() ?? null,
      customers_count: desk.customersCount,
      link_trade_platform: desk.linkTradePlatform,
      link_mt_account: desk.linkMtAccount,
      created_at: desk.createdAt.toISOString(),
    };
  }
}
