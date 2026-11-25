import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className }: AppLogoProps) {
  return (
    <span className={cn("font-logo text-[22px] leading-[1.15]", className)}>
      Fit.ai
    </span>
  );
}
