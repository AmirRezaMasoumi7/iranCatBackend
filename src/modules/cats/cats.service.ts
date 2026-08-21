import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { extractObjectKeyFromImageUrl } from "../../lib/minio.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { AddCatBodyInput, EditCatBodyInput } from "./cats.schema.js";
import {
  deleteMinioObjects,
  processImageToWebp,
  uploadWebpToMinio,
} from "./cat-image.storage.js";
const catImageSelect = {
  id: true,
  oemCode: true,
  imageUrl: true,
  sortOrder: true,
} as const;

const catWithImagesSelect = {
  oemCode: true,
  carBrand: true,
  description: true,
  weightGram: true,
  palladiumPpm: true,
  platinumPpm: true,
  rhodiumPpm: true,
  createdAt: true,
  updatedAt: true,
  images: {
    select: catImageSelect,
    orderBy: { sortOrder: "asc" as const },
  },
} as const;

export type CatImageItem = {
  id: string;
  oemCode: string;
  imageUrl: string;
  sortOrder: number;
};

export type CatWithImages = {
  oemCode: string;
  carBrand: string | null;
  description: string | null;
  weightGram: Prisma.Decimal | null;
  palladiumPpm: Prisma.Decimal | null;
  platinumPpm: Prisma.Decimal | null;
  rhodiumPpm: Prisma.Decimal | null;
  createdAt: Date;
  updatedAt: Date;
  images: CatImageItem[];
};

export type CatApiItem = {
  oem_code: string;
  car_brand: string | null;
  description: string | null;
  weight_gram: number | null;
  palladium_ppm: number | null;
  platinum_ppm: number | null;
  rhodium_ppm: number | null;
  images: string[];
};

function decimalToNumber(value: Prisma.Decimal | null): number | null {
  return value === null ? null : Number(value);
}

export function toCatApiResponse(cat: CatWithImages): CatApiItem {
  return {
    oem_code: cat.oemCode,
    car_brand: cat.carBrand,
    description: cat.description,
    weight_gram: decimalToNumber(cat.weightGram),
    palladium_ppm: decimalToNumber(cat.palladiumPpm),
    platinum_ppm: decimalToNumber(cat.platinumPpm),
    rhodium_ppm: decimalToNumber(cat.rhodiumPpm),
    images: cat.images.map((image) => image.imageUrl),
  };
}

function toEditCatData(input: EditCatBodyInput): Prisma.CatUpdateInput {
  const data: Prisma.CatUpdateInput = {};

  if (input.car_brand !== undefined) {
    data.carBrand = input.car_brand;
  }

  if (input.description !== undefined) {
    data.description = input.description;
  }

  if (input.weight_gram !== undefined) {
    data.weightGram = input.weight_gram;
  }

  if (input.palladium_ppm !== undefined) {
    data.palladiumPpm = input.palladium_ppm;
  }

  if (input.platinum_ppm !== undefined) {
    data.platinumPpm = input.platinum_ppm;
  }

  if (input.rhodium_ppm !== undefined) {
    data.rhodiumPpm = input.rhodium_ppm;
  }

  return data;
}
function toCatCreateData(input: AddCatBodyInput) {
  return {
    oemCode: input.oem_code,
    carBrand: input.car_brand ?? null,
    description: input.description ?? null,
    weightGram: input.weight_gram ?? null,
    palladiumPpm: input.palladium_ppm ?? null,
    platinumPpm: input.platinum_ppm ?? null,
    rhodiumPpm: input.rhodium_ppm ?? null,
  };
}

async function uploadCatImageBuffers(
  oemCode: string,
  imageBuffers: Buffer[],
): Promise<{
  objectKeys: string[];
  imageRecords: Array<{ imageUrl: string; sortOrder: number }>;
}> {
  const objectKeys: string[] = [];
  const imageRecords: Array<{ imageUrl: string; sortOrder: number }> = [];

  for (let index = 0; index < imageBuffers.length; index += 1) {
    const webpBuffer = await processImageToWebp(imageBuffers[index]);
    const fileName = `image${index + 1}.webp`;
    const { objectKey, imageUrl } = await uploadWebpToMinio(
      oemCode,
      fileName,
      webpBuffer,
    );

    objectKeys.push(objectKey);
    imageRecords.push({ imageUrl, sortOrder: index });
  }

  return { objectKeys, imageRecords };
}

async function getNextSortOrder(oemCode: string): Promise<number> {
  const latestImage = await prisma.catImage.findFirst({
    where: { oemCode },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return (latestImage?.sortOrder ?? -1) + 1;
}

async function rollbackCatCreation(oemCode: string, uploadedObjectKeys: string[]): Promise<void> {
  await deleteMinioObjects(uploadedObjectKeys);
  await prisma.cat.delete({ where: { oemCode } }).catch(() => undefined);
}

export async function addCat(
  input: AddCatBodyInput,
  imageBuffers: Buffer[],
): Promise<CatWithImages> {
  try {
    await prisma.cat.create({
      data: toCatCreateData(input),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "Cat with this OEM code already exists", "OEM_EXISTS");
    }

    throw error;
  }

  const uploadedObjectKeys: string[] = [];

  try {
    const { objectKeys, imageRecords } = await uploadCatImageBuffers(
      input.oem_code,
      imageBuffers,
    );

    uploadedObjectKeys.push(...objectKeys);

    if (imageRecords.length > 0) {
      await prisma.catImage.createMany({
        data: imageRecords.map((image) => ({
          oemCode: input.oem_code,
          imageUrl: image.imageUrl,
          sortOrder: image.sortOrder,
        })),
      });
    }

    return prisma.cat.findUniqueOrThrow({
      where: { oemCode: input.oem_code },
      select: catWithImagesSelect,
    });
  } catch (error) {
    await rollbackCatCreation(input.oem_code, uploadedObjectKeys);

    throw error;
  }
}

export async function uploadCatImage(
  oemCode: string,
  fileBuffer: Buffer,
): Promise<CatImageItem> {
  const cat = await prisma.cat.findUnique({
    where: { oemCode },
    select: { oemCode: true },
  });

  if (!cat) {
    throw new AppError(404, "Cat not found", "CAT_NOT_FOUND");
  }

  const webpBuffer = await processImageToWebp(fileBuffer);
  const sortOrder = await getNextSortOrder(oemCode);
  const fileName = `image${sortOrder + 1}.webp`;
  const { imageUrl } = await uploadWebpToMinio(oemCode, fileName, webpBuffer);

  return prisma.catImage.create({
    data: {
      oemCode,
      imageUrl,
      sortOrder,
    },
    select: catImageSelect,
  });
}

export async function editCat(
  oemCode: string,
  input: EditCatBodyInput,
  imageBuffers: Buffer[],
): Promise<CatApiItem> {
  const catData = toEditCatData(input);

  const existing = await prisma.cat.findUnique({
    where: { oemCode },
    select: {
      images: {
        select: { imageUrl: true },
      },
    },
  });

  if (!existing) {
    throw new AppError(404, "Cat not found", "CAT_NOT_FOUND");
  }

  const oldObjectKeys = existing.images
    .map((image) => extractObjectKeyFromImageUrl(image.imageUrl))
    .filter((objectKey): objectKey is string => objectKey !== null);

  // Always clear the previous image set before writing the new one.
  // Delete MinIO objects first so new uploads never collide with old keys
  // (e.g. both using cats/{oem}/image1.webp).
  await prisma.catImage.deleteMany({ where: { oemCode } });
  await deleteMinioObjects(oldObjectKeys);

  let uploadedObjectKeys: string[] = [];

  try {
    const { objectKeys, imageRecords } = await uploadCatImageBuffers(
      oemCode,
      imageBuffers,
    );
    uploadedObjectKeys = objectKeys;

    const cat = await prisma.$transaction(async (tx) => {
      await tx.cat.update({
        where: { oemCode },
        data:
          Object.keys(catData).length > 0
            ? catData
            : { updatedAt: new Date() },
      });

      if (imageRecords.length > 0) {
        await tx.catImage.createMany({
          data: imageRecords.map((image) => ({
            oemCode,
            imageUrl: image.imageUrl,
            sortOrder: image.sortOrder,
          })),
        });
      }

      return tx.cat.findUniqueOrThrow({
        where: { oemCode },
        select: catWithImagesSelect,
      });
    });

    return toCatApiResponse(cat);
  } catch (error) {
    await deleteMinioObjects(uploadedObjectKeys);
    throw error;
  }
}

export async function deleteCat(oemCode: string): Promise<void> {
  const cat = await prisma.cat.findUnique({
    where: { oemCode },
    select: {
      oemCode: true,
      images: {
        select: { imageUrl: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!cat) {
    throw new AppError(404, "Cat not found", "CAT_NOT_FOUND");
  }

  const objectKeys = cat.images
    .map((image) => extractObjectKeyFromImageUrl(image.imageUrl))
    .filter((objectKey): objectKey is string => objectKey !== null);

  await deleteMinioObjects(objectKeys);

  await prisma.$transaction([
    prisma.catImage.deleteMany({ where: { oemCode } }),
    prisma.cat.delete({ where: { oemCode } }),
  ]);
}

export async function listCats(): Promise<{
  total_cats: number;
  cats: CatApiItem[];
}> {
  const cats = await prisma.cat.findMany({
    select: catWithImagesSelect,
    orderBy: { createdAt: "desc" },
  });

  return {
    total_cats: cats.length,
    cats: cats.map(toCatApiResponse),
  };
}