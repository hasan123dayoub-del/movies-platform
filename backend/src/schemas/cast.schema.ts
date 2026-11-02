import { z } from "zod";

export const addActorSchema = z.object({
  actorId: z.number().int().positive(),
  role: z.string().trim().min(1),
});

export const updateRoleSchema = z.object({
  role: z.string().trim().min(1),
});
