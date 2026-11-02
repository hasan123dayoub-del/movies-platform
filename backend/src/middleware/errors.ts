import type { Request, Response, NextFunction } from "express";

// Any URL that no route matched
export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

// Catches every error thrown in a route or controller
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // Broken JSON in the request body
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ message: "Invalid JSON in request body" });
    return;
  }

  // Full details stay in the server log, never in the response
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
}
