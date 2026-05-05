import { Controller, Get } from "@nestjs/common";
import {
  CampaignsService,
  type CampaignsTableResponse,
} from "./campaigns.service";

@Controller("campaigns")
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  findAll(): Promise<CampaignsTableResponse> {
    return this.campaignsService.findAll();
  }
}
