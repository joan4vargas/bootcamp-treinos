"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { completeWorkoutAction } from "../_actions";

interface CompleteWorkoutButtonProps {
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
}

export function CompleteWorkoutButton({
  workoutPlanId,
  workoutDayId,
  sessionId,
}: CompleteWorkoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={isPending}
      className="h-9.5 w-full rounded-full text-sm leading-none font-semibold shadow-none"
      onClick={() =>
        startTransition(() =>
          completeWorkoutAction(workoutPlanId, workoutDayId, sessionId),
        )
      }
    >
      Marcar como concluído
    </Button>
  );
}
