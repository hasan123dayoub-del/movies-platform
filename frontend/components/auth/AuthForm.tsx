"use client"; // useActionState keeps the errors and typed values in the browser

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/lib/types";
import { emptyFormState } from "@/lib/form";
import { loginAction, registerAction } from "@/app/(auth)/actions";
import { Field, inputClass, primaryButtonClass } from "@/components/form/Field";
import PasswordInput from "./PasswordInput";

type AuthFormProps = {
  mode: "login" | "register";
  // Where to go after logging in (e.g. back to the admin page that asked for it)
  next: string;
};

const actions = { login: loginAction, register: registerAction };

export default function AuthForm({ mode, next }: AuthFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    actions[mode],
    emptyFormState,
  );
  const { errors, values } = state;
  const isRegister = mode === "register";
  // Keep ?next= when switching between the two pages
  const query = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;

  return (
    <form action={formAction} noValidate className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {isRegister && (
        <Field label="Name" error={errors.name}>
          <input
            name="name"
            autoComplete="name"
            defaultValue={values.name}
            aria-invalid={Boolean(errors.name)}
            className={inputClass}
          />
        </Field>
      )}

      <Field label="Email" error={errors.email}>
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={values.email}
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          className={inputClass}
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <PasswordInput
          // Lets password managers save a new password or fill a saved one
          autoComplete={isRegister ? "new-password" : "current-password"}
          placeholder={isRegister ? "At least 8 characters" : undefined}
          invalid={Boolean(errors.password)}
        />
      </Field>

      {/* Errors that belong to no single field, like "Email or password is incorrect" */}
      {errors.form && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
          {errors.form}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full`}>
        {pending
          ? isRegister
            ? "Creating your account..."
            : "Logging in..."
          : isRegister
            ? "Create account"
            : "Log in"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        {isRegister ? "Already have an account? " : "New here? "}
        <Link
          href={`${isRegister ? "/login" : "/register"}${query}`}
          className="font-medium text-amber-400 hover:text-amber-300"
        >
          {isRegister ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
