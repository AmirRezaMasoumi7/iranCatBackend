import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  device: z.string().trim().min(1, "Device is required"),
});

export const authCheckSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  device: z.string().trim().min(1, "Device is required"),
  jwt: z.string().min(1, "JWT is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AuthCheckInput = z.infer<typeof authCheckSchema>;
