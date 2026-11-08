"use server";

import { redirect } from "next/navigation";
import { login, register } from "@/lib/api";
import { safeNextPath } from "@/lib/auth";
import { readText, emptyToUndefined } from "@/lib/form";
import { saveSession, clearSession } from "@/lib/session";
import type { FormState, LoginInput, RegisterInput } from "@/lib/types";

// The password is never sent back to the form: after a failed try that box starts empty
export async function registerAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    name: readText(formData, "name"),
    email: readText(formData, "email"),
  };
  // Empty means "not sent", so the API says "Password is required"
  const password = emptyToUndefined(String(formData.get("password") ?? ""));

  const result = await register({ ...values, password } as RegisterInput);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  // Registering logs you in straight away
  await saveSession(result.data.token);
  redirect(safeNextPath(formData.get("next")));
}

export async function loginAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = { email: readText(formData, "email") };
  // Empty means "not sent", so the API says "Password is required"
  const password = emptyToUndefined(String(formData.get("password") ?? ""));

  const result = await login({ ...values, password } as LoginInput);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  await saveSession(result.data.token);
  redirect(safeNextPath(formData.get("next")));
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
