import { Controller, Get } from "@nestjs/common";
import {
  CustomerDocumentsService,
  type CustomerDocumentsTableResponse,
} from "./customer-documents.service";

@Controller("customer-documents")
export class CustomerDocumentsController {
  constructor(private readonly customerDocumentsService: CustomerDocumentsService) {}

  @Get()
  findAll(): Promise<CustomerDocumentsTableResponse> {
    return this.customerDocumentsService.findAll();
  }
}
