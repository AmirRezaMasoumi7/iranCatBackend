import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const outDir = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main(): Promise<void> {
  const rows = await prisma.price.findMany({ orderBy: { name: "asc" } });

  const json = rows.map((r) => ({
    name: r.name,
    price: Number(r.price),
  }));

  writeFileSync(join(outDir, "price_data.json"), `${JSON.stringify(json, null, 2)}\n`);

  const values = rows
    .map((r) => `  ('${r.name.replace(/'/g, "''")}', ${Number(r.price).toFixed(2)})`)
    .join(",\n");

  const sql = `-- Generated from local DB — safe to re-run (upsert by name)
BEGIN;

INSERT INTO public.price (name, price) VALUES
${values}
ON CONFLICT (name) DO UPDATE SET price = EXCLUDED.price;

COMMIT;
`;

  writeFileSync(join(outDir, "price_import.sql"), sql);
  console.log(`Wrote ${rows.length} price row(s) to price_data.json and price_import.sql`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
