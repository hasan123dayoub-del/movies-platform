import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNextPath } from "@/lib/auth";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const next = safeNextPath((await searchParams).next);

  // Already logged in: nothing to do here
  if (await getCurrentUser()) {
    redirect(next);
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Create an account</h1>
      <p className="mt-1 mb-8 text-sm text-zinc-400">
        Join to keep track of the movies you love.
      </p>
      <AuthForm mode="register" next={next} />
    </>
  );
}
