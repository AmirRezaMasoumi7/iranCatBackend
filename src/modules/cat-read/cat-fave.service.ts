import { prisma } from "../../lib/prisma.js";

export async function getTopFrequentOemCodes(username: string): Promise<string[]> {
  const results = await prisma.$queryRaw<Array<{ oem_code: string }>>`
    SELECT oem_code
    FROM log_user_cat
    WHERE username = ${username}
    GROUP BY oem_code
    ORDER BY COUNT(*) DESC, oem_code ASC
    LIMIT 6
  `;

  return results.map((result) => result.oem_code);
}
