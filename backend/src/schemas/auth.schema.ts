import { z } from "zod";
import { requiredText } from "./common.schema.js";

// Trimmed and lowercased first, then checked, so " Sam@Mail.com " is saved as "sam@mail.com"
const email = z
  .string({
    error: (issue) =>
      issue.input === undefined ? "Email is required" : "Email must be text",
  })
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .pipe(z.email({ error: "Enter a valid email address" }));

export const registerSchema = z.object({
  name: requiredText("Name", 50),
  email,
  // bcrypt only reads the first 72 bytes, so longer passwords are refused
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Password is required" : "Password must be text",
    })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export const loginSchema = z.object({
  email,
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Password is required" : "Password must be text",
    })
    .min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
