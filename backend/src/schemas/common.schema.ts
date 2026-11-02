import { z } from "zod";

const id = z.coerce.number().int().positive();

// /movies/:id and /actors/:id
export const idParams = z.object({ id });

// /movies/:id/actors/:actorId
export const castParams = z.object({ id, actorId: id });
