-- CreateTable
CREATE TABLE "cats" (
    "oem_code" VARCHAR(50) NOT NULL,
    "car_brand" VARCHAR(100),
    "description" TEXT,
    "weight_gram" DECIMAL(10,2),
    "palladium_ppm" DECIMAL(10,2),
    "platinum_ppm" DECIMAL(10,2),
    "rhodium_ppm" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cats_pkey" PRIMARY KEY ("oem_code")
);

-- CreateTable
CREATE TABLE "cat_images" (
    "id" UUID NOT NULL,
    "oem_code" VARCHAR(50) NOT NULL,
    "image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cat_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cat_images_oem_code_idx" ON "cat_images"("oem_code");

-- AddForeignKey
ALTER TABLE "cat_images" ADD CONSTRAINT "cat_images_oem_code_fkey" FOREIGN KEY ("oem_code") REFERENCES "cats"("oem_code") ON DELETE CASCADE ON UPDATE CASCADE;
