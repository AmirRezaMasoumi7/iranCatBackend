-- AlterTable
ALTER TABLE "users" ADD COLUMN "subscription_expiry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Migrate existing remaining_subscription_days to expiry dates
UPDATE "users"
SET "subscription_expiry_date" = (CURRENT_DATE + "remaining_subscription_days" * INTERVAL '1 day');

ALTER TABLE "users" DROP COLUMN "remaining_subscription_days";
