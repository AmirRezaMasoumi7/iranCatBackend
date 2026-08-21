import { getSortedCarBrands } from "../../constants/car-brands.js";
import { prisma } from "../../lib/prisma.js";

export type OemSearchResult = {
  oem_code: string;
  car_brand: string | null;
};

export async function searchOemCodes(query: string): Promise<OemSearchResult[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const normalized = trimmed.replace(/[\s\-_.]/g, "").toLowerCase();
  const likePattern = `%${trimmed}%`;
  const normalizedPattern = `%${normalized}%`;
  const startsWithPattern = `${trimmed}%`;

  return prisma.$queryRaw<OemSearchResult[]>`
    SELECT c.oem_code, c.car_brand
    FROM cats c
    WHERE c.oem_code ILIKE ${likePattern}
       OR REGEXP_REPLACE(LOWER(c.oem_code), '[^a-z0-9]', '', 'g') LIKE ${normalizedPattern}
    ORDER BY
      CASE
        WHEN LOWER(c.oem_code) = LOWER(${trimmed}) THEN 0
        WHEN c.oem_code ILIKE ${startsWithPattern} THEN 1
        ELSE 2
      END,
      c.oem_code ASC
    LIMIT 20
  `;
}

export async function listCarBrands(): Promise<string[]> {
  return getSortedCarBrands();
}

export async function listOemCodesByBrand(carBrand: string): Promise<string[]> {
  const cats = await prisma.cat.findMany({
    where: {
      carBrand: {
        equals: carBrand,
        mode: "insensitive",
      },
    },
    select: {
      oemCode: true,
    },
    orderBy: {
      oemCode: "asc",
    },
  });

  return cats.map((cat) => cat.oemCode);
}
