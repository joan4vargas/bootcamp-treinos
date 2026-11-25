"use client";

import { CircleQuestionMark } from "lucide-react";
import { useQueryStates } from "nuqs";

import {
  buildExerciseQuestion,
  chatQueryStateParsers,
} from "@/app/_lib/chat-query-state";
import { Button } from "@/components/ui/button";

interface ExerciseHelpButtonProps {
  exerciseName: string;
}

export function ExerciseHelpButton({ exerciseName }: ExerciseHelpButtonProps) {
  const [, setChatState] = useQueryStates(chatQueryStateParsers);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Tirar dúvida sobre ${exerciseName}`}
      className="text-muted-foreground size-5"
      onClick={() =>
        setChatState({
          chatOpen: true,
          initialMessage: buildExerciseQuestion(exerciseName),
        })
      }
    >
      <CircleQuestionMark className="size-5" />
    </Button>
  );
}
