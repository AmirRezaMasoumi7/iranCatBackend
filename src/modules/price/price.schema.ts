import { z } from "zod";

const DAMPING_PRICE_NAME = "damping";

const priceName = z.string().trim().min(1, "Name is required").max(100);

function priceAllowsZero(name: string): boolean {
  return name === DAMPING_PRICE_NAME;
}

function invalidPriceMessage(name: string): string {
  return priceAllowsZero(name)
    ? "Damping must be 0 or greater"
    : "Price must be greater than 0";
}

function isValidPrice(name: string, price: number): boolean {
  if (!Number.isFinite(price)) {
    return false;
  }

  return priceAllowsZero(name) ? price >= 0 : price > 0;
}

const namedPriceSchema = z
  .object({
    name: priceName,
    price: z.coerce.number(),
  })
  .superRefine((value, ctx) => {
    if (isValidPrice(value.name, value.price)) {
      return;
    }

    ctx.addIssue({
      code: "custom",
      path: ["price"],
      message: invalidPriceMessage(value.name),
    });
  });

export const addPriceSchema = namedPriceSchema;

export type AddPriceInput = z.infer<typeof addPriceSchema>;

export function editPriceSchemaFor(name: string) {
  return z.object({
    price: z.coerce.number(),
  }).superRefine((value, ctx) => {
    if (isValidPrice(name, value.price)) {
      return;
    }

    ctx.addIssue({
      code: "custom",
      path: ["price"],
      message: invalidPriceMessage(name),
    });
  });
}

export type EditPriceInput = z.infer<ReturnType<typeof editPriceSchemaFor>>;

export const bulkEditPriceSchema = z
  .array(namedPriceSchema)
  .min(1, "At least one price update is required")
  .refine(
    (items) => new Set(items.map((item) => item.name)).size === items.length,
    { message: "Duplicate price names are not allowed" },
  );

export type BulkEditPriceInput = z.infer<typeof bulkEditPriceSchema>;

export const nameParamSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

export type NameParam = z.infer<typeof nameParamSchema>;
