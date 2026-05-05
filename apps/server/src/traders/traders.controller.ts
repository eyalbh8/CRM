import { Body, Controller, Get, Post } from "@nestjs/common";
import {
  TradersService,
  type CreateTraderInput,
  type TraderRow,
  type TradersTableResponse,
} from "./traders.service";

@Controller("traders")
export class TradersController {
  constructor(private readonly tradersService: TradersService) {}

  @Get()
  findAll(): Promise<TradersTableResponse> {
    return this.tradersService.findAll();
  }

  @Post()
  create(@Body() input: CreateTraderInput): Promise<TraderRow> {
    return this.tradersService.create(input);
  }
}
