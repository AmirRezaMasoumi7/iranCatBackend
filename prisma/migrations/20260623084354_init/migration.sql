-- CreateTable
CREATE TABLE "cats" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT,
    "age" INTEGER,
    "description" TEXT,
    "image_url" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cats_is_available_idx" ON "cats"("is_available");

-- CreateIndex
CREATE INDEX "cats_breed_idx" ON "cats"("breed");
