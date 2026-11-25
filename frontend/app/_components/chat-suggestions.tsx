import { Button } from "@/components/ui/button";

const SUGGESTED_MESSAGES = [
  "Monte meu plano de treino",
  "Alterar plano de treino",
  "Mudar objetivo",
  "Atualizar informações",
];

interface ChatSuggestionsProps {
  onSelect: (message: string) => void;
}

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto px-5 [scrollbar-width:none]">
      {SUGGESTED_MESSAGES.map((message) => (
        <Button
          key={message}
          type="button"
          variant="ghost"
          className="bg-accent hover:bg-primary-soft h-7.5 shrink-0 rounded-full px-4 text-sm font-normal"
          onClick={() => onSelect(message)}
        >
          {message}
        </Button>
      ))}
    </div>
  );
}
