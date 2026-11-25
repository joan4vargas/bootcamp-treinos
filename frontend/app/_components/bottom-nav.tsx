import { Calendar, ChartNoAxesColumn, House, UserRound } from "lucide-react";

import { getHomeData } from "@/app/_lib/api/fetch-generated";
import { getTodayDateKey } from "@/app/_lib/dates";

import { BottomNavLink } from "./bottom-nav-link";
import { ChatOpenButton } from "./chat-open-button";

type BottomNavItem = "home" | "workout-plan" | "stats" | "profile";

interface BottomNavProps {
  activeItem?: BottomNavItem;
}

export async function BottomNav({ activeItem }: BottomNavProps) {
  const homeDataResponse = await getHomeData(getTodayDateKey());
  const activeWorkoutPlanId =
    homeDataResponse.status === 200
      ? homeDataResponse.data.activeWorkoutPlanId
      : undefined;

  return (
    <nav className="bg-background border-border fixed inset-x-0 bottom-0 z-40 mx-auto flex h-22 w-full max-w-md items-center justify-between border-t px-6 py-4">
      <BottomNavLink
        href="/"
        icon={House}
        label="Início"
        isActive={activeItem === "home"}
      />
      <BottomNavLink
        href={
          activeWorkoutPlanId
            ? `/workout-plans/${activeWorkoutPlanId}`
            : undefined
        }
        icon={Calendar}
        label="Plano de treino"
        isActive={activeItem === "workout-plan"}
      />
      <ChatOpenButton />
      <BottomNavLink
        href="/stats"
        icon={ChartNoAxesColumn}
        label="Estatísticas"
        isActive={activeItem === "stats"}
      />
      <BottomNavLink
        href="/profile"
        icon={UserRound}
        label="Perfil"
        isActive={activeItem === "profile"}
      />
    </nav>
  );
}
