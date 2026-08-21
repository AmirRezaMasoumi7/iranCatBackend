import { z } from "zod";

export const catFaveSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
});

export type CatFaveInput = z.infer<typeof catFaveSchema>;
