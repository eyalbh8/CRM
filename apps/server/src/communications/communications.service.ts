import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import {
  COMMUNICATION_TABLE_COLUMNS,
  type CommunicationColumn,
} from "./communications.columns";

export type CommunicationRow = Record<string, unknown>;

export type CommunicationsTableResponse = {
  columns: CommunicationColumn[];
  data: CommunicationRow[];
};

type CommunicationWithRelations = Prisma.CommunicationGetPayload<{
  include: {
    campaign: true;
    customer: true;
    employee: true;
  };
}>;

@Injectable()
export class CommunicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CommunicationsTableResponse> {
    const communications = await this.prisma.communication.findMany({
      include: {
        campaign: true,
        customer: true,
        employee: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return {
      columns: COMMUNICATION_TABLE_COLUMNS,
      data: communications.map((communication) => this.toTableRow(communication)),
    };
  }

  private toTableRow(communication: CommunicationWithRelations): CommunicationRow {
    return {
      id: communication.id,
      type: communication.type,
      title: communication.title,
      description: communication.description,
      employee: communication.employee?.fname ?? null,
      customer: communication.customer?.fname ?? null,
      campaign: communication.campaign?.name ?? null,
      created_at: communication.createdAt.toISOString(),
      actions: communication.actions,
    };
  }
}
