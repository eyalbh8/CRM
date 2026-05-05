import { Injectable } from "@nestjs/common";
import type { Employee, Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import {
  EMPLOYEE_SIP_PROVIDER_KEYS,
  EMPLOYEE_TABLE_COLUMNS,
  type EmployeeColumn,
} from "./employees.columns";

export type EmployeeRow = Record<string, unknown>;

export type EmployeesTableResponse = {
  columns: EmployeeColumn[];
  data: EmployeeRow[];
};

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EmployeesTableResponse> {
    const employees = await this.prisma.employee.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return {
      columns: EMPLOYEE_TABLE_COLUMNS,
      data: employees.map((employee) => this.toTableRow(employee)),
    };
  }

  private toTableRow(employee: Employee): EmployeeRow {
    const sipProviders = toPlainObject(employee.sipProviders);
    const row: EmployeeRow = {
      id: employee.id,
      login: employee.login,
      fname: employee.fname,
      customers_count: employee.customersCount,
      finance_customers_count: employee.financeCustomersCount,
      acl_permissions: employee.aclPermissions,
      phone_ext_desk: employee.phoneExtDesk,
      phone_ext: employee.phoneExt,
      email: employee.email,
      language: employee.language,
      google2fa_enable: employee.google2faEnable,
      additional_security_enable: employee.additionalSecurityEnable,
      group: employee.department,
      active: employee.active,
      password_revoked: employee.passwordRevoked,
      created_at: employee.createdAt.toISOString(),
      last_login: employee.lastLogin?.toISOString() ?? null,
      actions: employee.actions,
    };

    for (const providerKey of EMPLOYEE_SIP_PROVIDER_KEYS) {
      row[providerKey] = sipProviders[providerKey] ?? null;
    }

    return row;
  }
}

function toPlainObject(value: Prisma.JsonValue): Record<string, unknown> {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {};
  }

  return value as Record<string, unknown>;
}
