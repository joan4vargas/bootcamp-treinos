import { Flame } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface StreakBannerProps {
  workoutStreak: number;
}

export function StreakBanner({ workoutStreak }: StreakBannerProps) {
  const hasStreak = workoutStreak > 0;

  return (
    <section className="px-5">
      <div className="bg-muted-foreground relative flex h-52.5 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl px-5 py-10">
        <Image
          src="/images/stats-banner.jpg"
          alt=""
          fill
          sizes="(max-width: 448px) 100vw, 448px"
          className={cn("object-cover", !hasStreak && "opacity-40 grayscale")}
        />
        <div className="border-overlay-foreground bg-overlay-foreground/12 relative flex size-14 items-center justify-center rounded-full border backdrop-blur-sm">
          <Flame
            className={cn(
              "size-8",
              hasStreak
                ? "fill-streak text-streak"
                : "fill-overlay-foreground text-overlay-foreground",
            )}
          />
        </div>
        <div className="relative flex flex-col items-center gap-1">
          <span className="text-overlay-foreground text-5xl leading-[0.95] font-semibold">
            {workoutStreak} {workoutStreak === 1 ? "dia" : "dias"}
          </span>
          <span className="text-overlay-foreground/60 text-base leading-[1.15]">
            Sequência Atual
          </span>
        </div>
      </div>
    </section>
  );
}
