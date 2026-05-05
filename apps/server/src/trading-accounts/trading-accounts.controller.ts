import { Controller, Get } from "@nestjs/common";
import {
  TradingAccountsService,
  type TradingAccountsTableResponse,
} from "./trading-accounts.service";

@Controller("trading-accounts")
export class TradingAccountsController {
  constructor(private readonly tradingAccountsService: TradingAccountsService) {}

  @Get()
  findAll(): Promise<TradingAccountsTableResponse> {
    return this.tradingAccountsService.findAll();
  }
}
