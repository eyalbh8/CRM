import { Controller, Get } from "@nestjs/common";
import {
  AssetGroupsService,
  type AssetGroupsTableResponse,
} from "./asset-groups.service";

@Controller("asset-groups")
export class AssetGroupsController {
  constructor(private readonly assetGroupsService: AssetGroupsService) {}

  @Get()
  findAll(): Promise<AssetGroupsTableResponse> {
    return this.assetGroupsService.findAll();
  }
}
