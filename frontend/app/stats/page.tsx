import dayjs from "dayjs";
import { CircleCheck, CirclePercent, Hourglass } from "lucide-react";

import { BottomNav } from "@/app/_components/bottom-nav";
import { PageHeader } from "@/app/_components/page-header";
import { SectionHeader } from "@/app/_components/section-header";
import { StatCard } from "@/app/_components/stat-card";
import { getStats } from "@/app/_lib/api/fetch-generated";
import { toDateKey } from "@/app/_lib/dates";
import { formatTotalTime } from "@/app/_lib/format-duration";
import { requireOnboardedUser } from "@/app/_lib/require-onboarded-user";

import { ConsistencyHeatmap } from "./_components/consistency-heatmap";
import { StreakBanner } from "./_components/streak-banner";

const MONTHS_IN_HEATMAP = 3;
const PERCENTAGE = 100;

export default async function StatsPage() {
  await requireOnboardedUser();

  const today = dayjs();
  const months = Array.from({ length: MONTHS_IN_HEATMAP }, (_, index) =>
    today.subtract(MONTHS_IN_HEATMAP - 1 - index, "month").startOf("month"),
  );
  const from = toDateKey(months[0]);
  const to = toDateKey(today.endOf("month"));

  const statsResponse = await getStats({ from, to });

  if (statsResponse.status !== 200) {
    throw new Error("Não foi possível carregar as estatísticas");
  }

  const {
    workoutStreak,
    consistencyByDay,
    completedWorkoutsCount,
    conclusionRate,
    totalTimeInSeconds,
  } = statsResponse.data;

  return (
    <main className="pb-28">
      <PageHeader />
      <StreakBanner workoutStreak={workoutStreak} />

      <section className="flex flex-col gap-3 p-5">
        <SectionHeader title="Consistência" />
        <ConsistencyHeatmap
          months={months}
          consistencyByDay={consistencyByDay}
        />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={CircleCheck}
            value={String(completedWorkoutsCount)}
            label="Treinos Feitos"
          />
          <StatCard
            icon={CirclePercent}
            value={`${Math.round(conclusionRate * PERCENTAGE)}%`}
            label="Taxa de conclusão"
          />
          <StatCard
            icon={Hourglass}
            value={formatTotalTime(totalTimeInSeconds)}
            label="Tempo Total"
            className="col-span-2"
          />
        </div>
      </section>

      <BottomNav activeItem="stats" />
    </main>
  );
}
