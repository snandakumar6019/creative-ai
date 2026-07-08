"use client";

import { useSearchParams } from "next/navigation";

import { signIn, signInWithGoogle, signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in or create an account to continue to Creative AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <Button className="w-full" formAction={signInWithGoogle} type="submit" variant="outline">
            Continue with Google
          </Button>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>@goingmerry.xyz only</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@goingmerry.xyz" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          {error ? (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
              {message}
            </p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <Button formAction={signIn} type="submit">
              Sign in
            </Button>
            <Button formAction={signUp} type="submit" variant="outline">
              Create account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
