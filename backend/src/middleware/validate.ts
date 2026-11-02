import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type Schemas = {
  params?: ZodType;
  body?: ZodType;
};

// Checks the URL params and the body before the request reaches the controller
export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        res.status(400).json({
          message: "Invalid URL parameters",
          errors: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          message: "Validation failed",
          errors: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }

      // Keep only the validated fields (unknown fields are dropped)
      req.body = result.data;
    }

    next();
  };
}
