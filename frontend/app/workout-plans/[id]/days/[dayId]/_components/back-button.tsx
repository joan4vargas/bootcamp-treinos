"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Voltar"
      className="text-muted-foreground size-6"
      onClick={() => router.back()}
    >
      <ChevronLeft className="size-6" />
    </Button>
  );
}
