import { Dumbbell, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  formatDurationInMinutes,
  formatExercisesCount,
} from "@/app/_lib/format-duration";
import { WEEK_DAY_LABELS, type WeekDay } from "@/app/_lib/week-days";

import { WeekDayBadge } from "./week-day-badge";

const FALLBACK_COVER_IMAGE = "/images/workout-day-fallback.jpg";

interface WorkoutDayCardProps {
  name: string;
  weekDay: WeekDay;
  estimatedDurationInSeconds: number;
  exercisesCount: number;
  coverImageUrl?: string | null;
  href?: string;
  action?: ReactNode;
}

export function WorkoutDayCard({
  name,
  weekDay,
  estimatedDurationInSeconds,
  exercisesCount,
  coverImageUrl,
  href,
  action,
}: WorkoutDayCardProps) {
  const content = (
    <div className="relative flex h-50 flex-col justify-between overflow-hidden rounded-xl p-5">
      <Image
        src={coverImageUrl || FALLBACK_COVER_IMAGE}
        alt={name}
        fill
        sizes="(max-width: 448px) 100vw, 448px"
        className="object-cover object-center"
      />
      <div className="from-overlay/10 to-overlay/60 absolute inset-0 bg-linear-to-b" />

      <div className="relative">
        <WeekDayBadge label={WEEK_DAY_LABELS[weekDay]} />
      </div>

      <div className="relative flex items-end justify-between gap-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-overlay-foreground text-2xl leading-[1.05] font-semibold">
            {name}
          </h3>
          <div className="text-overlay-foreground/70 flex items-center gap-2 text-xs leading-[1.4]">
            <span className="flex items-center gap-1">
              <Timer className="size-3.5" />
              {formatDurationInMinutes(estimatedDurationInSeconds)}
            </span>
            <span className="flex items-center gap-1">
              <Dumbbell className="size-3.5" />
              {formatExercisesCount(exercisesCount)}
            </span>
          </div>
        </div>
        {action}
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block transition-opacity hover:opacity-95">
      {content}
    </Link>
  );
}
