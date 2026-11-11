import { Router, type Request, type Response } from "express";
import { validate } from "../middleware/validate.js";
import { idParams } from "../schemas/common.schema.js";
import { whereToWatchQuery, type WhereToWatchQuery } from "../schemas/where-to-watch.schema.js";
import { getWhereToWatch } from "../services/where-to-watch.service.js";
import type { Title } from "../services/reviews.service.js";

// GET /movies/:id/where-to-watch?country=SA (and the same for /series):
// the streaming services, rentals and purchases in that country (data: JustWatch via TMDB)
export function whereToWatchRoutes(kind: Title["kind"]) {
  const router = Router();
  router.get(
    "/:id/where-to-watch",
    validate({ params: idParams, query: whereToWatchQuery }),
    async (req: Request<{ id: string }>, res: Response<unknown, { query: WhereToWatchQuery }>) => {
      res.json(await getWhereToWatch({ kind, id: Number(req.params.id) }, res.locals.query.country));
    },
  );
  return router;
}
