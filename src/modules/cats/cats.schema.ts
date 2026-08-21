import { z } from "zod";
import { isCarBrand } from "../../constants/car-brands.js";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null || value === undefined ? undefined : value;

const optionalDecimal = z.preprocess(
  emptyToUndefined,
  z.coerce.number().nonnegative().optional(),
);

const optionalCarBrand = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .max(100)
    .refine((value) => isCarBrand(value), {
      message: "Car brand must be selected from the allowed list",
    })
    .optional(),
);

export const oemCodeParamSchema = z.object({
  oem_code: z.string().trim().min(1).max(50),
});

export type OemCodeParam = z.infer<typeof oemCodeParamSchema>;

export const addCatBodySchema = z.object({
  oem_code: z.string().trim().min(1, "OEM code is required").max(50),
  car_brand: optionalCarBrand,
  description: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  weight_gram: optionalDecimal,
  palladium_ppm: optionalDecimal,
  platinum_ppm: optionalDecimal,
  rhodium_ppm: optionalDecimal,
});

export type AddCatBodyInput = z.infer<typeof addCatBodySchema>;

export const editCatBodySchema = z.object({
  car_brand: optionalCarBrand,
  description: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  weight_gram: optionalDecimal,
  palladium_ppm: optionalDecimal,
  platinum_ppm: optionalDecimal,
  rhodium_ppm: optionalDecimal,
});

export type EditCatBodyInput = z.infer<typeof editCatBodySchema>;
