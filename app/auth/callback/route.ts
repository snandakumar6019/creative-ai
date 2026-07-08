import { NextResponse, type NextRequest } from "next/server";

import { isAllowedEmail, unauthorizedDomainMessage } from "@/lib/auth/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function loginRedirect(request: NextRequest, message: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?error=${encodeURIComponent(message)}`;
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return loginRedirect(request, "Supabase environment variables are not configured.");
  }

  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return loginRedirect(request, "Google sign-in did not return an authorization code.");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return loginRedirect(request, error.message);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!isAllowedEmail(user?.email)) {
    await supabase.auth.signOut();
    return loginRedirect(request, unauthorizedDomainMessage());
  }

  const url = request.nextUrl.clone();
  url.pathname = next.startsWith("/") ? next : "/dashboard";
  url.search = "";
  return NextResponse.redirect(url);
}
