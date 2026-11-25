import { Zap } from "lucide-react";

import { ExerciseHelpButton } from "./exercise-help-button";
import { ExerciseInfoChip } from "./exercise-info-chip";

interface ExerciseCardProps {
  name: string;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
}

export function ExerciseCard({
  name,
  sets,
  reps,
  restTimeInSeconds,
}: ExerciseCardProps) {
  return (
    <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base leading-[1.4] font-semibold">{name}</h3>
        <ExerciseHelpButton exerciseName={name} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <ExerciseInfoChip>{sets} séries</ExerciseInfoChip>
        <ExerciseInfoChip>{reps} reps</ExerciseInfoChip>
        <ExerciseInfoChip>
          <Zap />
          {restTimeInSeconds}S
        </ExerciseInfoChip>
      </div>
    </div>
  );
}
