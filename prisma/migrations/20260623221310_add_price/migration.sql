-- CreateTable
CREATE TABLE "price" (
    "name" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "price_pkey" PRIMARY KEY ("name")
);
