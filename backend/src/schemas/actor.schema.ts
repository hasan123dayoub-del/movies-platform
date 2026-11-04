import { z } from "zod";
import {
  requiredText,
  optionalImageUrl,
  atLeastOneField,
  atLeastOneFieldMessage,
} from "./common.schema.js";

export const createActorSchema = z.object({
  name: requiredText("Name"),
  // "YYYY-MM-DD" in, a Date out, so the service gets a ready Date
  birthday: z.iso
    .date({
      error: (issue) =>
        issue.input === undefined
          ? "Birthday is required"
          : "Birthday must be a date like 1974-11-11",
      abort: true, // a broken date stops here, so the check below never sees it
    })
    .refine((value) => new Date(value) <= new Date(), {
      error: "Birthday can't be in the future",
    })
    .transform((value) => new Date(value)),
  nationality: requiredText("Nationality", 50),
  photoUrl: optionalImageUrl("Photo"),
});

export const updateActorSchema = createActorSchema
  .partial()
  .refine(atLeastOneField, atLeastOneFieldMessage);

export type CreateActorInput = z.infer<typeof createActorSchema>;
export type UpdateActorInput = Partial<CreateActorInput>;
