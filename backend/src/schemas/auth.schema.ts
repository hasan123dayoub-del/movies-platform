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

// A new password. bcrypt only reads the first 72 bytes, so longer passwords are refused
function newPassword(label: string) {
  return z
    .string({
      error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be text`),
    })
    .min(8, `${label} must be at least 8 characters`)
    .max(72, `${label} must be at most 72 characters`);
}

export const registerSchema = z.object({
  name: requiredText("Name", 50),
  email,
  password: newPassword("Password"),
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

// PUT /auth/me: what a member may change about themselves (the email stays)
export const updateProfileSchema = z.object({
  name: requiredText("Name", 50),
});

// PUT /auth/me/password: the current password proves it is really them
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({
        error: (issue) =>
          issue.input === undefined ? "Current password is required" : "Current password must be text",
      })
      .min(1, "Current password is required"),
    newPassword: newPassword("New password"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    error: "The new password must be different from the current one",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
