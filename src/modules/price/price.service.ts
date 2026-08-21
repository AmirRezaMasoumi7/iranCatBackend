import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";
import type {
  AddPriceInput,
  BulkEditPriceInput,
  EditPriceInput,
} from "./price.schema.js";

export type PriceItem = {
  name: string;
  price: number;
};

const priceSelect = {
  name: true,
  price: true,
} as const;

function toPriceItem(record: { name: string; price: Prisma.Decimal }): PriceItem {
  return {
    name: record.name,
    price: Number(record.price),
  };
}

export async function listPrices(): Promise<PriceItem[]> {
  const records = await prisma.price.findMany({
    select: priceSelect,
    orderBy: { name: "asc" },
  });

  return records.map(toPriceItem);
}

export async function addPrice(input: AddPriceInput): Promise<PriceItem> {
  try {
    const record = await prisma.price.create({
      data: {
        name: input.name,
        price: input.price,
      },
      select: priceSelect,
    });

    return toPriceItem(record);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "Price name already exists", "PRICE_NAME_EXISTS");
    }

    throw error;
  }
}

export async function editPrice(
  name: string,
  input: EditPriceInput,
): Promise<PriceItem> {
  try {
    const record = await prisma.price.update({
      where: { name },
      data: { price: input.price },
      select: priceSelect,
    });

    return toPriceItem(record);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError(404, "Price not found", "PRICE_NOT_FOUND");
    }

    throw error;
  }
}

export async function editPrices(
  items: BulkEditPriceInput,
): Promise<PriceItem[]> {
  try {
    const records = await prisma.$transaction(
      items.map((item) =>
        prisma.price.update({
          where: { name: item.name },
          data: { price: item.price },
          select: priceSelect,
        }),
      ),
    );

    return records.map(toPriceItem);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError(404, "Price not found", "PRICE_NOT_FOUND");
    }

    throw error;
  }
}
