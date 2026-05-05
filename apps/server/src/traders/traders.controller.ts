import { Controller, Get } from "@nestjs/common";
import { TradersService, type TradersTableResponse } from "./traders.service";

@Controller("traders")
export class TradersController {
  constructor(private readonly tradersService: TradersService) {}

  @Get()
  findAll(): Promise<TradersTableResponse> {
    return this.tradersService.findAll();
  }
}
