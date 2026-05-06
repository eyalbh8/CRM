import { Module } from "@nestjs/common";
import { PrismaModule } from "@/prisma/prisma.module";
import { TradingLiveController } from "./trading-live.controller";
import { TradingLiveService } from "./trading-live.service";

@Module({
  imports: [PrismaModule],
  controllers: [TradingLiveController],
  providers: [TradingLiveService],
})
export class TradingLiveModule {}
