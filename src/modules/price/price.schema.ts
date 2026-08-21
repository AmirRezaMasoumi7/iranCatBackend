import { z } from "zod";

const priceValue = z.coerce
  .number()
  .positive("Price must be greater than 0");

export const addPriceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  price: priceValue,
});

export type AddPriceInput = z.infer<typeof addPriceSchema>;

export const editPriceSchema = z.object({
  price: priceValue,
});

export type EditPriceInput = z.infer<typeof editPriceSchema>;

export const bulkEditPriceSchema = z
  .array(
    z.object({
      name: z.string().trim().min(1, "Name is required").max(100),
      price: priceValue,
    }),
  )
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
