import { Body, Controller, Get, Post } from "@nestjs/common";
import {
  TransactionsService,
  type CreateTransactionInput,
  type TransactionCreateFormResponse,
  type TransactionRow,
  type TransactionsTableResponse,
} from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(): Promise<TransactionsTableResponse> {
    return this.transactionsService.findAll();
  }

  @Get("create-form")
  getCreateFormOptions(): Promise<TransactionCreateFormResponse> {
    return this.transactionsService.getCreateFormOptions();
  }

  @Post()
  create(@Body() input: CreateTransactionInput): Promise<TransactionRow> {
    return this.transactionsService.create(input);
  }
}
