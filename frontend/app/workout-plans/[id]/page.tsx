import { notFound } from "next/navigation";

import { BottomNav } from "@/app/_components/bottom-nav";
import { RestDayCard } from "@/app/_components/rest-day-card";
import { WorkoutDayCard } from "@/app/_components/workout-day-card";
import { getWorkoutPlan } from "@/app/_lib/api/fetch-generated";
import { requireOnboardedUser } from "@/app/_lib/require-onboarded-user";
import { sortByWeekDay } from "@/app/_lib/week-days";

import { WorkoutPlanBanner } from "./_components/workout-plan-banner";

export default async function WorkoutPlanPage({
  params,
}: PageProps<"/workout-plans/[id]">) {
  const { id } = await params;
  await requireOnboardedUser();

  const workoutPlanResponse = await getWorkoutPlan(id);

  if (workoutPlanResponse.status !== 200) {
    notFound();
  }

  const workoutPlan = workoutPlanResponse.data;
  const workoutDays = sortByWeekDay(workoutPlan.workoutDays);

  return (
    <main className="pb-28">
      <WorkoutPlanBanner workoutPlanName={workoutPlan.name} />

      <section className="flex flex-col gap-3 p-5">
        {workoutDays.map((workoutDay) =>
          workoutDay.isRest ? (
            <RestDayCard key={workoutDay.id} weekDay={workoutDay.weekDay} />
          ) : (
            <WorkoutDayCard
              key={workoutDay.id}
              name={workoutDay.name}
              weekDay={workoutDay.weekDay}
              estimatedDurationInSeconds={workoutDay.estimatedDurationInSeconds}
              exercisesCount={workoutDay.exercises.length}
              coverImageUrl={workoutDay.coverImageUrl}
              href={`/workout-plans/${workoutPlan.id}/days/${workoutDay.id}`}
            />
          ),
        )}
      </section>

      <BottomNav activeItem="workout-plan" />
    </main>
  );
}
