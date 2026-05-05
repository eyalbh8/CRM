import { Injectable } from "@nestjs/common";
import type { AssetGroup } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { ASSET_GROUP_TABLE_COLUMNS, type AssetGroupColumn } from "./asset-groups.columns";

export type AssetGroupRow = Record<string, unknown>;

export type AssetGroupsTableResponse = {
  columns: AssetGroupColumn[];
  data: AssetGroupRow[];
};

@Injectable()
export class AssetGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AssetGroupsTableResponse> {
    const assetGroups = await this.prisma.assetGroup.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return {
      columns: ASSET_GROUP_TABLE_COLUMNS,
      data: assetGroups.map((assetGroup) => this.toTableRow(assetGroup)),
    };
  }

  private toTableRow(assetGroup: AssetGroup): AssetGroupRow {
    return {
      id: assetGroup.id,
      name: assetGroup.name,
      created_at: assetGroup.createdAt.toISOString(),
    };
  }
}
