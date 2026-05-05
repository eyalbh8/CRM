import { Controller, Get } from "@nestjs/common";
import { AssetsService, type AssetsTableResponse } from "./assets.service";

@Controller("assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(): Promise<AssetsTableResponse> {
    return this.assetsService.findAll();
  }
}
