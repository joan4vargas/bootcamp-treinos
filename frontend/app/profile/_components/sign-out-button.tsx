"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { authClient } from "@/app/_lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () =>
    startTransition(async () => {
      await authClient.signOut();
      router.replace("/auth");
    });

  return (
    <Button
      variant="ghost"
      disabled={isPending}
      onClick={handleSignOut}
      className="text-destructive hover:text-destructive hover:bg-destructive/8 h-8 self-center rounded-full px-4 text-base font-semibold"
    >
      Sair da conta
      <LogOut />
    </Button>
  );
}
