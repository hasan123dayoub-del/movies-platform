import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNextPath } from "@/lib/auth";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeNextPath((await searchParams).next);

  // Already logged in: nothing to do here
  if (await getCurrentUser()) {
    redirect(next);
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 mb-8 text-sm text-zinc-400">Log in to your account.</p>
      <AuthForm mode="login" next={next} />
    </>
  );
}
