import type { Role } from "../generated/prisma/client.js";

// Teaches TypeScript that requireAuth adds the logged-in user to the request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        role: Role;
        createdAt: Date;
      };
    }
  }
}

export {};
