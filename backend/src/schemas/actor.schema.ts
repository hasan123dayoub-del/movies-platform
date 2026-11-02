import { z } from "zod";

export const createActorSchema = z.object({
  name: z.string().trim().min(1),
  birthday: z.iso.date(), // "YYYY-MM-DD"
  nationality: z.string().trim().min(1),
});

export const updateActorSchema = createActorSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Send at least one field to update",
  });
