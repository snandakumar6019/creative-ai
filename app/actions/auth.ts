"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  ALLOWED_EMAIL_DOMAIN,
  isAllowedEmail,
  unauthorizedDomainMessage
} from "@/lib/auth/access";
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
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(encodedLoginError(error.message));
  }

  if (!isAllowedEmail(data.user?.email)) {
    await supabase.auth.signOut();
    redirect(encodedLoginError(unauthorizedDomainMessage()));
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

  if (!isAllowedEmail(email)) {
    redirect(encodedLoginError(unauthorizedDomainMessage()));
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(encodedLoginError(error.message));
  }

  redirect(`/login?message=${encodeURIComponent("Check your email to confirm your account.")}`);
}

export async function signInWithGoogle() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(encodedLoginError("Supabase environment variables are not configured."));
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const origin = requestHeaders.get("origin") ?? (host ? `${protocol}://${host}` : null);

  if (!origin) {
    redirect(encodedLoginError("Google sign-in could not determine the app URL."));
  }

  const redirectTo = `${origin}/auth/callback?next=/dashboard`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        hd: ALLOWED_EMAIL_DOMAIN
      }
    }
  });

  if (error) {
    redirect(encodedLoginError(error.message));
  }

  if (!data.url) {
    redirect(encodedLoginError("Google sign-in could not be started."));
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
