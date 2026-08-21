import { UserRole } from "@prisma/client";
import { z } from "zod";

export const userBodySchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  username: z.string().trim().min(1, "Username is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  city: z.string().trim().min(1, "City is required"),
  remainingSubscriptionDays: z.coerce
    .number()
    .int()
    .min(0, "Remaining subscription days must be 0 or greater"),
  role: z.nativeEnum(UserRole, {
    error: "Role must be admin or user",
  }),
  password: z.string().min(1, "Password is required"),
  jwtToken: z.string().nullable().optional(),
  device: z.string().nullable().optional(),
});

export type UserBodyInput = z.infer<typeof userBodySchema>;

export const addUserSchema = userBodySchema;
export const editUserSchema = userBodySchema;
