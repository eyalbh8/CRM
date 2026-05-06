import { Controller, Get } from "@nestjs/common";
import { TradingLiveService, type TradingLiveResponse } from "./trading-live.service";

@Controller("trading-live")
export class TradingLiveController {
  constructor(private readonly tradingLiveService: TradingLiveService) {}

  @Get()
  findAll(): Promise<TradingLiveResponse> {
    return this.tradingLiveService.findAll();
  }
}
