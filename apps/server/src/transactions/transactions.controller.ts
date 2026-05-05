import { Controller, Get } from "@nestjs/common";
import {
  TransactionsService,
  type TransactionsTableResponse,
} from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(): Promise<TransactionsTableResponse> {
    return this.transactionsService.findAll();
  }
}
