import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash, verify } from "argon2";
import { PrismaService } from "@/prisma/prisma.service";
import { getJwtExpiresIn, getJwtSecret } from "./auth.config";
import type { AuthEmployee, JwtPayload } from "./auth.types";

export type LoginInput = {
  email?: unknown;
  password?: unknown;
};

export type LoginResponse = {
  accessToken: string;
  employee: AuthEmployee;
};

export type ChangePasswordInput = {
  currentPassword?: unknown;
  newPassword?: unknown;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(input: LoginInput): Promise<LoginResponse> {
    const email = normalizeCredential(input.email)?.toLowerCase();
    const password = normalizeCredential(input.password);

    if (!email || !password) {
      this.logger.warn("Auth login rejected: missing email or password");
      throw new UnauthorizedException("Invalid login or password");
    }

    this.logger.log(`Auth login attempt for employee email "${email}"`);

    const employee = await this.prisma.employee.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        login: true,
        fname: true,
        email: true,
        aclPermissions: true,
        active: true,
        passwordRevoked: true,
        passwordHash: true,
      },
    });

    const passwordMatches =
      employee?.passwordHash && employee.active && !employee.passwordRevoked
        ? await verify(employee.passwordHash, toPasswordSecret(email, password))
        : false;

    if (!passwordMatches || !employee) {
      await runDummyPasswordWork(email, password);
      this.logger.warn(`Auth login failed for employee email "${email}"`);
      throw new UnauthorizedException("Invalid login or password");
    }

    await this.prisma.employee.update({
      where: {
        id: employee.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    const authEmployee: AuthEmployee = {
      id: employee.id,
      login: employee.login,
      fname: employee.fname,
      email: employee.email,
      aclPermissions: employee.aclPermissions,
    };

    this.logger.log(`Auth login succeeded for employee ${employee.id} (${employee.login})`);

    const payload: JwtPayload = {
      sub: employee.id,
      login: employee.login,
      email: employee.email,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: getJwtExpiresIn(),
        secret: getJwtSecret(),
      }),
      employee: authEmployee,
    };
  }

  async changePassword(employeeId: number, input: ChangePasswordInput): Promise<{ ok: true }> {
    const currentPassword = normalizeCredential(input.currentPassword);
    const newPassword = normalizeCredential(input.newPassword);

    if (!currentPassword || !newPassword) {
      throw new BadRequestException("Current password and new password are required");
    }

    if (newPassword.length < 8) {
      throw new BadRequestException("New password must be at least 8 characters");
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException("New password must be different from current password");
    }

    const employee = await this.prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      select: {
        id: true,
        email: true,
        active: true,
        passwordRevoked: true,
        passwordHash: true,
      },
    });

    if (!employee?.email || !employee.active || employee.passwordRevoked || !employee.passwordHash) {
      throw new UnauthorizedException("Authentication required");
    }

    const currentPasswordMatches = await verify(
      employee.passwordHash,
      toPasswordSecret(employee.email, currentPassword),
    );

    if (!currentPasswordMatches) {
      this.logger.warn(`Password change rejected for employee ${employee.id}: current password mismatch`);
      throw new UnauthorizedException("Invalid current password");
    }

    await this.prisma.employee.update({
      where: {
        id: employee.id,
      },
      data: {
        passwordHash: await hash(toPasswordSecret(employee.email, newPassword)),
        passwordRevoked: false,
      },
    });

    this.logger.log(`Password changed for employee ${employee.id}`);

    return { ok: true };
  }
}

function toPasswordSecret(email: string, password: string): string {
  return `${email.toLowerCase()}\0${password}`;
}

function normalizeCredential(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

async function runDummyPasswordWork(email: string, password: string): Promise<void> {
  await hash(toPasswordSecret(email, password));
}
