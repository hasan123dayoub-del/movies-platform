import { z } from "zod";
import { requiredText, positiveId } from "./common.schema.js";

export const addActorSchema = z.object({
  actorId: positiveId("Actor ID"),
  role: requiredText("Role"),
});

export const updateRoleSchema = z.object({
  role: requiredText("Role"),
});

export type AddActorInput = z.infer<typeof addActorSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
