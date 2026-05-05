import { Controller, Get } from "@nestjs/common";
import {
  CommunicationsService,
  type CommunicationsTableResponse,
} from "./communications.service";

@Controller("communications")
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get()
  findAll(): Promise<CommunicationsTableResponse> {
    return this.communicationsService.findAll();
  }
}
