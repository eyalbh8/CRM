import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@/prisma/prisma.service";
import { AUTH_COOKIE_NAME, getJwtSecret } from "./auth.config";
import { IS_PUBLIC_KEY } from "./public.decorator";
import type { AuthEmployee, JwtPayload, RequestWithEmployee } from "./auth.types";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithEmployee>();
    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn(`Auth guard rejected request without token: ${request.method} ${request.url}`);
      throw new UnauthorizedException("Authentication required");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: getJwtSecret(),
      });

      const employee = await this.prisma.employee.findUnique({
        where: {
          id: payload.sub,
        },
        select: {
          id: true,
          login: true,
          fname: true,
          email: true,
          aclPermissions: true,
          active: true,
          passwordRevoked: true,
        },
      });

      if (!employee || !employee.active || employee.passwordRevoked) {
        this.logger.warn(`Auth guard rejected inactive or revoked employee token for id ${payload.sub}`);
        throw new UnauthorizedException("Authentication required");
      }

      request.user = {
        id: employee.id,
        login: employee.login,
        fname: employee.fname,
        email: employee.email,
        aclPermissions: employee.aclPermissions,
      } satisfies AuthEmployee;

      this.logger.log(
        `Auth guard allowed employee ${employee.id} (${employee.login}) for ${request.method} ${request.url}`,
      );

      return true;
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        this.logger.warn(`Auth guard rejected invalid token for ${request.method} ${request.url}`);
      }
      throw new UnauthorizedException("Authentication required");
    }
  }

  private extractToken(request: RequestWithEmployee): string | undefined {
    const cookieToken = request.cookies?.[AUTH_COOKIE_NAME];

    if (cookieToken) {
      return cookieToken;
    }

    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
  }
}
