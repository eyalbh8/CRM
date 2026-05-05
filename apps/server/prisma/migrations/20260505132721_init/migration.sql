-- CreateTable
CREATE TABLE "hello_messages" (
    "id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "hello_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "customers_count" INTEGER NOT NULL DEFAULT 0,
    "finance_customers_count" INTEGER NOT NULL DEFAULT 0,
    "acl_permissions" JSONB,
    "phone_ext_desk" TEXT,
    "phone_ext" JSONB,
    "email" TEXT,
    "language" TEXT,
    "google2fa_enable" BOOLEAN NOT NULL DEFAULT false,
    "additional_security_enable" BOOLEAN NOT NULL DEFAULT false,
    "group" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "password_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMPTZ(3),
    "actions" JSONB,
    "sip_providers" JSONB,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desks" (
    "id" SERIAL NOT NULL,
    "desk_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "chat_enabled" BOOLEAN NOT NULL DEFAULT false,
    "min_deposit" DECIMAL(12,2),
    "max_deposit" DECIMAL(12,2),
    "customers_count" INTEGER NOT NULL DEFAULT 0,
    "link_trade_platform" TEXT,
    "link_mt_account" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "desks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "calculation_type" TEXT NOT NULL,
    "customer_count" INTEGER NOT NULL DEFAULT 0,
    "ftd_count" INTEGER NOT NULL DEFAULT 0,
    "redeposit_count" INTEGER NOT NULL DEFAULT 0,
    "creator_id" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traders" (
    "id" SERIAL NOT NULL,
    "mt5_login" JSONB,
    "promo_code" TEXT,
    "fname" TEXT,
    "self_status" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "campaign_id" INTEGER,
    "broker_employee" JSONB,
    "finance_employee" JSONB,
    "desk_id" INTEGER,
    "country" TEXT,
    "city" TEXT,
    "trading_server" TEXT,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT,
    "total_deposits" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_withdrawals" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_bonuses" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "validation_status" TEXT,
    "retention_status" TEXT,
    "potential_status" TEXT,
    "forced_strategy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "active_trading" BOOLEAN NOT NULL DEFAULT false,
    "active_deposit" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMPTZ(3),
    "last_communication" TEXT,
    "last_reminder_start_at" TIMESTAMPTZ(3),
    "note" TEXT,
    "memo" TEXT,
    "last_communication_date" TIMESTAMPTZ(3),
    "import_a_aid" TEXT,
    "import_a_bid" TEXT,
    "import_a_cid" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ftd_date" TIMESTAMPTZ(3),
    "last_change_broker_date" TIMESTAMPTZ(3),
    "last_change_desk_date" TIMESTAMPTZ(3),
    "last_ip" TEXT,
    "last_open_date_trade" TIMESTAMPTZ(3),
    "re_deposit_date" TIMESTAMPTZ(3),
    "resident" TEXT,
    "mark_ftd_employee" JSONB,
    "registration_city" TEXT,
    "registration_ip" TEXT,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "traders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trading_accounts" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "trader_id" INTEGER NOT NULL,
    "currency" TEXT,
    "group" TEXT,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "equity" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "volume" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "margin" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "margin_free" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "margin_level" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actions" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "trading_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "base_currency_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "type" TEXT,
    "country" TEXT,
    "customer_id" INTEGER NOT NULL,
    "broker_employee_id" INTEGER,
    "employee_id" INTEGER,
    "created_by_employee_id" INTEGER,
    "created_from" TEXT,
    "meta" JSONB,
    "trading_account_id" INTEGER,
    "balance_before" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actions" JSONB,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_documents" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "name" TEXT,
    "file_file_name" TEXT,
    "object" TEXT,
    "url" TEXT,
    "status" TEXT,
    "validation" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "customer_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_groups" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "asset_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "icon" JSONB,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "group_id" INTEGER,
    "payout" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "leverage" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "size" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unit" TEXT,
    "swap_buy" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "swap_sell" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "minimum_change" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "spread" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "commission" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expiration" TIMESTAMPTZ(3),
    "custom" BOOLEAN NOT NULL DEFAULT false,
    "trading_hours" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communications" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "title" TEXT,
    "description" TEXT,
    "employee_id" INTEGER,
    "customer_id" INTEGER,
    "campaign_id" INTEGER,
    "actions" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "communications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_login_key" ON "employees"("login");

-- CreateIndex
CREATE INDEX "campaigns_creator_id_idx" ON "campaigns"("creator_id");

-- CreateIndex
CREATE INDEX "traders_campaign_id_idx" ON "traders"("campaign_id");

-- CreateIndex
CREATE INDEX "traders_desk_id_idx" ON "traders"("desk_id");

-- CreateIndex
CREATE INDEX "trading_accounts_trader_id_idx" ON "trading_accounts"("trader_id");

-- CreateIndex
CREATE INDEX "transactions_customer_id_idx" ON "transactions"("customer_id");

-- CreateIndex
CREATE INDEX "transactions_broker_employee_id_idx" ON "transactions"("broker_employee_id");

-- CreateIndex
CREATE INDEX "transactions_employee_id_idx" ON "transactions"("employee_id");

-- CreateIndex
CREATE INDEX "transactions_created_by_employee_id_idx" ON "transactions"("created_by_employee_id");

-- CreateIndex
CREATE INDEX "transactions_trading_account_id_idx" ON "transactions"("trading_account_id");

-- CreateIndex
CREATE INDEX "customer_documents_customer_id_idx" ON "customer_documents"("customer_id");

-- CreateIndex
CREATE INDEX "assets_group_id_idx" ON "assets"("group_id");

-- CreateIndex
CREATE INDEX "communications_employee_id_idx" ON "communications"("employee_id");

-- CreateIndex
CREATE INDEX "communications_customer_id_idx" ON "communications"("customer_id");

-- CreateIndex
CREATE INDEX "communications_campaign_id_idx" ON "communications"("campaign_id");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traders" ADD CONSTRAINT "traders_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traders" ADD CONSTRAINT "traders_desk_id_fkey" FOREIGN KEY ("desk_id") REFERENCES "desks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_trader_id_fkey" FOREIGN KEY ("trader_id") REFERENCES "traders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "traders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_broker_employee_id_fkey" FOREIGN KEY ("broker_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_employee_id_fkey" FOREIGN KEY ("created_by_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_trading_account_id_fkey" FOREIGN KEY ("trading_account_id") REFERENCES "trading_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_documents" ADD CONSTRAINT "customer_documents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "traders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "asset_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "traders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
