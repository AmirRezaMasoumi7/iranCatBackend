-- CreateTable
CREATE TABLE "user_login_logs" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "logged_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device" TEXT NOT NULL,

    CONSTRAINT "user_login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_login_logs_username_idx" ON "user_login_logs"("username");

-- CreateIndex
CREATE INDEX "user_login_logs_username_logged_in_at_idx" ON "user_login_logs"("username", "logged_in_at");
