"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { startWorkoutAction } from "../_actions";

interface StartWorkoutButtonProps {
  workoutPlanId: string;
  workoutDayId: string;
}

export function StartWorkoutButton({
  workoutPlanId,
  workoutDayId,
}: StartWorkoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      className="h-7.5 shrink-0 rounded-full px-4 text-sm leading-none font-semibold"
      onClick={() =>
        startTransition(() => startWorkoutAction(workoutPlanId, workoutDayId))
      }
    >
      Iniciar Treino
    </Button>
  );
}
