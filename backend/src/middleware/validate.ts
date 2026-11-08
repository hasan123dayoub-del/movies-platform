import type { Request, Response, NextFunction } from "express";
import type { ZodError, ZodType } from "zod";

type Schemas = {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
};

// [{ field: "rating", message: "Rating can't be above 10" }, ...]
// A rule on the whole body (like "send at least one field") has no field name
function toFieldErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

// Checks the URL params, the query string and the body before the request reaches
// the controller (like a Laravel FormRequest)
export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        res.status(400).json({
          message: "Invalid URL parameters",
          errors: toFieldErrors(result.error),
        });
        return;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        res.status(400).json({
          message: "Invalid query parameters",
          errors: toFieldErrors(result.error),
        });
        return;
      }
      // req.query is read-only in Express 5, so the clean values go in res.locals
      res.locals["query"] = result.data;
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          message: "Validation failed",
          errors: toFieldErrors(result.error),
        });
        return;
      }

      // Keep only the validated fields (unknown fields are dropped)
      req.body = result.data;
    }

    next();
  };
}
