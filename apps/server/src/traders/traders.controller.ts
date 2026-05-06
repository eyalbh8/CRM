import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import {
  TradersService,
  type CreateTraderInput,
  type PatchTraderInput,
  type TraderCreateFormResponse,
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

  @Get("create-form")
  getCreateFormOptions(): Promise<TraderCreateFormResponse> {
    return this.tradersService.getCreateFormOptions();
  }

  @Post()
  create(@Body() input: CreateTraderInput): Promise<TraderRow> {
    return this.tradersService.create(input);
  }

  @Patch(":id")
  patch(
    @Param("id", ParseIntPipe) id: number,
    @Body() input: PatchTraderInput,
  ): Promise<TraderRow> {
    return this.tradersService.patch(id, input);
  }
}
