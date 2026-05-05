import { Controller, Get } from "@nestjs/common";
import { DesksService, type DesksTableResponse } from "./desks.service";

@Controller("desks")
export class DesksController {
  constructor(private readonly desksService: DesksService) {}

  @Get()
  findAll(): Promise<DesksTableResponse> {
    return this.desksService.findAll();
  }
}
