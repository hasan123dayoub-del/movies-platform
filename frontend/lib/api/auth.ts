import type { AuthResult, LoginInput, RegisterInput, User } from "../types";
import { sendJson, getJsonWithAuth } from "./client";

export function register(data: RegisterInput) {
  return sendJson<AuthResult>("POST", "/auth/register", data, "Failed to create the account", {
    auth: false,
  });
}

export function login(data: LoginInput) {
  return sendJson<AuthResult>("POST", "/auth/login", data, "Failed to log in", {
    auth: false,
  });
}

// The account behind a token; null when the token is expired or the account is gone
export function getMe(token: string) {
  return getJsonWithAuth<User>("/auth/me", token);
}
