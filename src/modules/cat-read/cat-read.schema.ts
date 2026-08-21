import { z } from "zod";

export const readCatSchema = z.object({
  oem_code: z.string().trim().min(1, "OEM code is required").max(50),
});

export type ReadCatInput = z.infer<typeof readCatSchema>;
