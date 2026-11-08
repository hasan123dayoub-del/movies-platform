"use client"; // remembers whether the password is shown

import { useState } from "react";
import { inputClass } from "@/components/form/Field";

type PasswordInputProps = {
  autoComplete: "new-password" | "current-password";
  placeholder?: string | undefined;
  invalid: boolean;
};

// A password box with an eye button that shows or hides what was typed
export default function PasswordInput({ autoComplete, placeholder, invalid }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name="password"
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid}
        // Room on the right for the eye button
        className={`${inputClass} pr-11`}
      />
      <button
        // "button", not "submit": clicking the eye must not send the form
        type="button"
        onClick={() => setVisible((shown) => !shown)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-zinc-500 transition hover:text-zinc-200 focus-visible:text-amber-400 focus-visible:outline-none"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.5" />
      <path d="M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
