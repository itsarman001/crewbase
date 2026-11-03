import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Please enter a valid work email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(60, { message: "Name must be at most 60 characters" }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Please enter a valid work email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least 1 letter" })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" }),
  teamCode: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
