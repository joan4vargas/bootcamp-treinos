import { Goal } from "lucide-react";
import Image from "next/image";

import { AppLogo } from "@/app/_components/app-logo";
import { Badge } from "@/components/ui/badge";

interface WorkoutPlanBannerProps {
  workoutPlanName: string;
}

export function WorkoutPlanBanner({ workoutPlanName }: WorkoutPlanBannerProps) {
  return (
    <section className="bg-overlay relative flex h-74 flex-col justify-between overflow-hidden rounded-b-[20px] px-5 pt-5 pb-10">
      <Image
        src="/images/workout-plan-banner.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 448px) 100vw, 448px"
        className="object-cover object-center"
      />
      <div className="to-overlay absolute inset-0 bg-linear-to-bl from-transparent" />

      <AppLogo className="text-overlay-foreground relative" />

      <div className="relative flex flex-col items-start gap-3">
        <Badge className="h-6.5 gap-1 rounded-full px-2.5 text-xs leading-none font-semibold uppercase [&>svg]:size-4">
          <Goal />
          {workoutPlanName}
        </Badge>
        <h1 className="text-overlay-foreground text-2xl leading-[1.05] font-semibold">
          Plano de Treino
        </h1>
      </div>
    </section>
  );
}
