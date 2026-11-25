import { LoaderCircle } from "lucide-react";

const TOOL_LABELS: Record<string, string> = {
  "tool-getUserTrainData": "Consultando seus dados...",
  "tool-updateUserTrainData": "Salvando seus dados...",
  "tool-getWorkoutPlans": "Consultando seu plano...",
  "tool-createWorkoutPlan": "Montando seu plano de treino...",
};

const TOOL_DONE_LABELS: Record<string, string> = {
  "tool-updateUserTrainData": "Dados salvos",
  "tool-createWorkoutPlan": "Plano de treino criado",
};

interface ChatToolStatusProps {
  toolType: string;
  isDone: boolean;
}

export function ChatToolStatus({ toolType, isDone }: ChatToolStatusProps) {
  const label = isDone ? TOOL_DONE_LABELS[toolType] : TOOL_LABELS[toolType];

  if (!label) {
    return null;
  }

  return (
    <span className="bg-accent text-foreground flex w-fit items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs">
      {!isDone && <LoaderCircle className="size-3 animate-spin" />}
      {label}
    </span>
  );
}
