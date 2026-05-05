import { Controller, Get } from "@nestjs/common";
import {
  EmployeesService,
  type EmployeesTableResponse,
} from "./employees.service";

@Controller("employees")
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll(): Promise<EmployeesTableResponse> {
    return this.employeesService.findAll();
  }
}
