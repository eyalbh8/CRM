import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AssetGroupsModule } from "./asset-groups/asset-groups.module";
import { AssetsModule } from "./assets/assets.module";
import { CampaignsModule } from "./campaigns/campaigns.module";
import { CommunicationsModule } from "./communications/communications.module";
import { CustomerDocumentsModule } from "./customer-documents/customer-documents.module";
import { DesksModule } from "./desks/desks.module";
import { EmployeesModule } from "./employees/employees.module";
import { PrismaModule } from "./prisma/prisma.module";
import { TradingAccountsModule } from "./trading-accounts/trading-accounts.module";
import { TradingLiveModule } from "./trading-live/trading-live.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { TradersModule } from "./traders/traders.module";

@Module({
  imports: [
    PrismaModule,
    AssetGroupsModule,
    AssetsModule,
    EmployeesModule,
    DesksModule,
    CampaignsModule,
    CommunicationsModule,
    TradersModule,
    TradingAccountsModule,
    TradingLiveModule,
    TransactionsModule,
    CustomerDocumentsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
