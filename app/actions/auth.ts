"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function encodedLoginError(message: string) {
  return `/login?error=${encodeURIComponent(message)}`;
}

export async function signIn(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(encodedLoginError("Supabase environment variables are not configured."));
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(encodedLoginError(error.message));
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(encodedLoginError("Supabase environment variables are not configured."));
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(encodedLoginError(error.message));
  }

  redirect(`/login?message=${encodeURIComponent("Check your email to confirm your account.")}`);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
