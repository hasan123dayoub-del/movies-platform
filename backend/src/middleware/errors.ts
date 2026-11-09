import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/http-error.js";

// Any URL that no route matched
export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

// Errors from express.json(): broken JSON (400), a body that is too large (413)...
// They carry their own status, and `expose` says the message is safe to show
type BodyParserError = { status: number; expose: boolean; type?: string; message: string };

function isBodyParserError(err: unknown): err is BodyParserError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "expose" in err &&
    (err as BodyParserError).expose
  );
}

// Catches every error thrown in a route or controller
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // The response already started (e.g. while streaming): let Express close it
  if (res.headersSent) {
    next(err);
    return;
  }

  // Expected errors from the services (404, 409...)
  if (err instanceof HttpError) {
    res.status(err.status).json(err.errors ? { message: err.message, errors: err.errors } : { message: err.message });
    return;
  }

  // Bad request bodies
  if (isBodyParserError(err)) {
    const message =
      err.type === "entity.parse.failed" ? "Invalid JSON in request body" : err.message;
    res.status(err.status).json({ message });
    return;
  }

  // Database rules that two requests at the same moment can still break,
  // even after the service checked (a race between the check and the write)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ message: "This record already exists" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ message: "Record not found" });
      return;
    }
  }

  // Full details stay in the server log, never in the response
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
}
