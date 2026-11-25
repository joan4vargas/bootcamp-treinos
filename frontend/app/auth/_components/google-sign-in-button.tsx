"use client";

import { useTransition } from "react";

import { authClient } from "@/app/_lib/auth-client";
import { Button } from "@/components/ui/button";

import { GoogleIcon } from "./google-icon";

export function GoogleSignInButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignIn = () =>
    startTransition(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: process.env.NEXT_PUBLIC_BASE_URL,
      });
    });

  return (
    <Button
      onClick={handleSignIn}
      disabled={isPending}
      className="bg-background text-foreground hover:bg-background/90 h-9.5 w-fit rounded-full px-6 text-sm font-semibold"
    >
      <GoogleIcon />
      Fazer login com Google
    </Button>
  );
}
