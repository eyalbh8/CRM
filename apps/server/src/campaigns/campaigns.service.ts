import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CAMPAIGN_TABLE_COLUMNS, type CampaignColumn } from "./campaigns.columns";

export type CampaignRow = Record<string, unknown>;

export type CampaignsTableResponse = {
  columns: CampaignColumn[];
  data: CampaignRow[];
};

type CampaignWithCreator = Prisma.CampaignGetPayload<{
  include: {
    creator: true;
  };
}>;

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CampaignsTableResponse> {
    const campaigns = await this.prisma.campaign.findMany({
      include: {
        creator: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return {
      columns: CAMPAIGN_TABLE_COLUMNS,
      data: campaigns.map((campaign) => this.toTableRow(campaign)),
    };
  }

  private toTableRow(campaign: CampaignWithCreator): CampaignRow {
    return {
      id: campaign.id,
      name: campaign.name,
      cost: campaign.cost.toString(),
      calculation_type: campaign.calculationType,
      customer_count: campaign.customerCount,
      ftd_count: campaign.ftdCount,
      redeposit_count: campaign.redepositCount,
      creator: campaign.creator?.fname ?? null,
      created_at: campaign.createdAt.toISOString(),
    };
  }
}
