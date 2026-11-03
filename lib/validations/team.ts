import { z } from "zod";

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Squad name must be at least 2 characters" })
    .max(60, { message: "Squad name must be at most 60 characters" }),
  code: z
    .string()
    .trim()
    .min(2, { message: "Squad code must be at least 2 characters" })
    .max(10, { message: "Squad code must be at most 10 characters" })
    .toUpperCase(),
  description: z.string().trim().max(250).optional().nullable(),
});

export const updateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Squad name must be at least 2 characters" })
    .max(60, { message: "Squad name must be at most 60 characters" })
    .optional(),
  description: z.string().trim().max(250).optional().nullable(),
});

export const addTeamMemberSchema = z.object({
  userId: z.string().trim().min(1, { message: "User ID is required" }),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
