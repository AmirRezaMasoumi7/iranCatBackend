import { z } from "zod";
import { isCarBrand } from "../../constants/car-brands.js";

export const searchOemSchema = z.object({
  oem_code: z.string().trim().min(1, "OEM code is required").max(50),
});

export type SearchOemInput = z.infer<typeof searchOemSchema>;

export const listOemByBrandSchema = z.object({
  car_brand: z
    .string()
    .trim()
    .min(1, "Car brand is required")
    .max(100)
    .refine((value) => isCarBrand(value), {
      message: "Car brand must be selected from the allowed list",
    }),
});

export type ListOemByBrandInput = z.infer<typeof listOemByBrandSchema>;
