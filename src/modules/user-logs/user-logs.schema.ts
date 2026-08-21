import { z } from "zod";

export const listUserLogSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
});

export type ListUserLogInput = z.infer<typeof listUserLogSchema>;
