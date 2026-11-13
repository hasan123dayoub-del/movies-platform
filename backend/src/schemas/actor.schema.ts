import { z } from "zod";
import {
  pageFields,
  requiredText,
  optionalImageUrl,
  atLeastOneField,
  atLeastOneFieldMessage,
  optionalSearch,
} from "./common.schema.js";

const actorFields = z.object({
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
  // Only for actors who have died; null clears it
  deathDate: z.iso
    .date({ error: "Date of death must be a date like 2008-01-22", abort: true })
    .refine((value) => new Date(value) <= new Date(), { error: "Date of death can't be in the future" })
    .transform((value) => new Date(value))
    .nullable()
    .exactOptional(),
  nationality: requiredText("Nationality", 50),
  photoUrl: optionalImageUrl("Photo"),
});

// Someone can't die before they were born
export const deathAfterBirth = (birthday: Date, deathDate: Date | null | undefined) =>
  !deathDate || deathDate >= birthday;
export const DEATH_BEFORE_BIRTH = "Date of death can't be before the birthday";

export const createActorSchema = actorFields.refine((actor) => deathAfterBirth(actor.birthday, actor.deathDate), {
  error: DEATH_BEFORE_BIRTH,
  path: ["deathDate"],
});

// On an edit the two dates may come one at a time: the service checks them against the saved ones
export const updateActorSchema = actorFields
  .partial()
  .refine(atLeastOneField, atLeastOneFieldMessage);

export type CreateActorInput = z.infer<typeof createActorSchema>;
export type UpdateActorInput = Partial<CreateActorInput>;

// GET /actors?search=leo
export const actorListQuery = z.object({
  // Part of the name, any case
  search: optionalSearch("Search"),
  ...pageFields,
});
export type ActorListQuery = z.infer<typeof actorListQuery>;
