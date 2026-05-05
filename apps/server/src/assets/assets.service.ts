import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { ASSET_TABLE_COLUMNS, type AssetColumn } from "./assets.columns";

export type AssetRow = Record<string, unknown>;

export type AssetsTableResponse = {
  columns: AssetColumn[];
  data: AssetRow[];
};

type AssetWithGroup = Prisma.AssetGetPayload<{
  include: {
    group: true;
  };
}>;

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AssetsTableResponse> {
    const assets = await this.prisma.asset.findMany({
      include: {
        group: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return {
      columns: ASSET_TABLE_COLUMNS,
      data: assets.map((asset) => this.toTableRow(asset)),
    };
  }

  private toTableRow(asset: AssetWithGroup): AssetRow {
    return {
      id: asset.id,
      icon: asset.icon,
      name: asset.name,
      description: asset.description,
      group: asset.group?.name ?? null,
      payout: asset.payout.toString(),
      leverage: asset.leverage.toString(),
      size: asset.size.toString(),
      unit: asset.unit,
      swap_buy: asset.swapBuy.toString(),
      swap_sell: asset.swapSell.toString(),
      minimum_change: asset.minimumChange.toString(),
      spread: asset.spread.toString(),
      commission: asset.commission.toString(),
      expiration: asset.expiration?.toISOString() ?? null,
      custom: asset.custom,
      trading_hours: asset.tradingHours,
    };
  }
}
