"use server";

import { refresh } from "next/cache";
import { changeMyPassword, updateMyName } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { readText } from "@/lib/form";
import type { FormState } from "@/lib/types";

export async function updateNameAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  await requireUser("/account");
  const values = { name: readText(formData, "name") };

  const result = await updateMyName(values.name);
  if (!result.ok) {
    return { errors: result.errors, values };
  }
  // The navbar shows the name too: redraw the page
  refresh();
  return { errors: {}, values: {}, message: "Name saved" };
}

// The passwords are never sent back to the form: after any try the boxes start empty
export async function changePasswordAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  await requireUser("/account");
  const result = await changeMyPassword(
    String(formData.get("currentPassword") ?? ""),
    String(formData.get("newPassword") ?? ""),
  );
  if (!result.ok) {
    return { errors: result.errors, values: {} };
  }
  return { errors: {}, values: {}, message: "Password changed" };
}
