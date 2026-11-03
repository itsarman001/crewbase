import { z } from "zod";
import { Role } from "@/types";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(60, { message: "Name must be at most 60 characters" }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least 1 letter" })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
    .optional(),
  role: z.nativeEnum(Role).default(Role.USER),
  teamId: z.string().trim().nullable().optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(60, { message: "Name must be at most 60 characters" })
    .optional(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least 1 letter" })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
    .optional(),
  teamId: z.string().trim().nullable().optional(),
});

export const changeRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const changeTeamSchema = z.object({
  teamId: z.string().trim().nullable(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional().default(""),
  role: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || val === "all" || Object.values(Role).includes(val as Role),
      { message: "Invalid role filter" }
    ),
  teamId: z.string().trim().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type ChangeTeamInput = z.infer<typeof changeTeamSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
