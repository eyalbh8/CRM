import { Body, Controller, Get, Logger, Post, Req, Res } from "@nestjs/common";
import type { Response } from "express";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "./auth.config";
import {
  AuthService,
  type ChangePasswordInput,
  type LoginInput,
  type LoginResponse,
} from "./auth.service";
import { Public } from "./public.decorator";
import type { AuthEmployee, RequestWithEmployee } from "./auth.types";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  async login(
    @Body() input: LoginInput,
    @Req() request: RequestWithEmployee,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    this.logger.log(`Auth login request received from ${getRequestSource(request)}`);
    const result = await this.authService.login(input);
    response.cookie(AUTH_COOKIE_NAME, result.accessToken, getAuthCookieOptions());

    return result;
  }

  @Public()
  @Post("logout")
  logout(
    @Req() request: RequestWithEmployee,
    @Res({ passthrough: true }) response: Response,
  ): { ok: true } {
    this.logger.log(`Auth logout request received from ${getRequestSource(request)}`);
    response.clearCookie(AUTH_COOKIE_NAME, {
      ...getAuthCookieOptions(),
      maxAge: undefined,
    });

    return { ok: true };
  }

  @Get("me")
  me(@Req() request: RequestWithEmployee): AuthEmployee {
    this.logger.log(`Auth session request for employee ${request.user?.id ?? "unknown"}`);
    return request.user as AuthEmployee;
  }

  @Post("change-password")
  changePassword(
    @Body() input: ChangePasswordInput,
    @Req() request: RequestWithEmployee,
  ): Promise<{ ok: true }> {
    const employee = request.user as AuthEmployee;
    this.logger.log(`Password change request for employee ${employee.id}`);

    return this.authService.changePassword(employee.id, input);
  }
}

function getRequestSource(request: RequestWithEmployee): string {
  return request.ip || request.socket.remoteAddress || "unknown";
}
