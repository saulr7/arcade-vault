import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign In · Arcade Vault" };

// The session lives in cookies, so this read is request-time. It sits under
// Suspense so the form itself stays in the static shell.
async function RedirectIfSignedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/games");
  return null;
}

export default function AuthPage() {
  return (
    <>
      <AuthForm />
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
    </>
  );
}
