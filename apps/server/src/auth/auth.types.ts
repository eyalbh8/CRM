import type { Request } from "express";

export type AuthEmployee = {
  id: number;
  login: string;
  fname: string;
  email: string | null;
  aclPermissions: unknown;
};

export type JwtPayload = {
  sub: number;
  login: string;
  email: string | null;
};

export type RequestWithEmployee = Request & {
  user?: AuthEmployee;
  cookies?: Record<string, string | undefined>;
};
