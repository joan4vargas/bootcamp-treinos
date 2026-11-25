export function ChatTypingIndicator() {
  return (
    <div
      aria-label="Coach AI digitando"
      className="bg-secondary flex w-fit items-center gap-1 self-start rounded-xl p-3"
    >
      <span className="bg-muted-foreground size-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
      <span className="bg-muted-foreground size-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
      <span className="bg-muted-foreground size-1.5 animate-bounce rounded-full" />
    </div>
  );
}
