-- CreateTable
CREATE TABLE "log_user_cat" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "oem_code" VARCHAR(50) NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_user_cat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_user_cat_username_idx" ON "log_user_cat"("username");

-- CreateIndex
CREATE INDEX "log_user_cat_username_requested_at_idx" ON "log_user_cat"("username", "requested_at");
