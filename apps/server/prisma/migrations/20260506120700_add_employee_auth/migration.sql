-- Add nullable password hashes so existing employee rows remain locked until a password is set explicitly.
ALTER TABLE "employees" ADD COLUMN "password_hash" TEXT;
