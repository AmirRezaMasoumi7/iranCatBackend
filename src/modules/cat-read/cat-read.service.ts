import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../middleware/errorHandler.js";
import {
  toCatApiResponse,
  type CatApiItem,
} from "../cats/cats.service.js";

function getTodayUtcRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

export async function readCat(
  username: string,
  oemCode: string,
): Promise<CatApiItem> {
  const { start, end } = getTodayUtcRange();

  return prisma.$transaction(async (tx) => {
    const todayUsageCount = await tx.logUserCat.count({
      where: {
        username,
        requestedAt: {
          gte: start,
          lte: end,
        },
      },
    });

    if (todayUsageCount >= env.DAILY_CAT_READ_LIMIT) {
      throw new AppError(
        429,
        "Daily cat read limit exceeded",
        "DAILY_LIMIT_EXCEEDED",
      );
    }

    const cat = await tx.cat.findUnique({
      where: { oemCode },
      select: {
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
          select: {
            id: true,
            oemCode: true,
            imageUrl: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!cat) {
      throw new AppError(404, "Cat not found", "CAT_NOT_FOUND");
    }

    await tx.logUserCat.create({
      data: {
        username,
        oemCode,
      },
    });

    return toCatApiResponse(cat);
  });
}
