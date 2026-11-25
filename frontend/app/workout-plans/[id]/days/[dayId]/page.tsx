import { notFound } from "next/navigation";

import { BottomNav } from "@/app/_components/bottom-nav";
import { RestDayCard } from "@/app/_components/rest-day-card";
import { WorkoutDayCard } from "@/app/_components/workout-day-card";
import { getWorkoutDay } from "@/app/_lib/api/fetch-generated";
import { isInCurrentWeek } from "@/app/_lib/dates";
import { requireOnboardedUser } from "@/app/_lib/require-onboarded-user";
import { WEEK_DAY_LABELS } from "@/app/_lib/week-days";

import { BackButton } from "./_components/back-button";
import { CompleteWorkoutButton } from "./_components/complete-workout-button";
import { CompletedWorkoutBadge } from "./_components/completed-workout-badge";
import { ExerciseCard } from "./_components/exercise-card";
import { StartWorkoutButton } from "./_components/start-workout-button";

export default async function WorkoutDayPage({
  params,
}: PageProps<"/workout-plans/[id]/days/[dayId]">) {
  const { id: workoutPlanId, dayId } = await params;
  await requireOnboardedUser();

  const workoutDayResponse = await getWorkoutDay(workoutPlanId, dayId);

  if (workoutDayResponse.status !== 200) {
    notFound();
  }

  const workoutDay = workoutDayResponse.data;
  const weekSessions = workoutDay.sessions.filter((session) =>
    isInCurrentWeek(session.startedAt),
  );
  const inProgressSession = weekSessions.find(
    (session) => !session.completedAt,
  );
  const completedSession = weekSessions.find((session) => session.completedAt);
  const hasAnySession = !!inProgressSession || !!completedSession;

  const cardAction = completedSession ? (
    <CompletedWorkoutBadge />
  ) : hasAnySession ? undefined : (
    <StartWorkoutButton workoutPlanId={workoutPlanId} workoutDayId={dayId} />
  );

  return (
    <main className="flex flex-col gap-5 p-5 pb-28">
      <header className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-lg leading-[1.4] font-semibold">
          {WEEK_DAY_LABELS[workoutDay.weekDay]}
        </h1>
        <div className="size-6" />
      </header>

      {workoutDay.isRest ? (
        <RestDayCard weekDay={workoutDay.weekDay} />
      ) : (
        <WorkoutDayCard
          name={workoutDay.name}
          weekDay={workoutDay.weekDay}
          estimatedDurationInSeconds={workoutDay.estimatedDurationInSeconds}
          exercisesCount={workoutDay.exercises.length}
          coverImageUrl={workoutDay.coverImageUrl}
          action={cardAction}
        />
      )}

      <section className="flex flex-col gap-3">
        {workoutDay.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            name={exercise.name}
            sets={exercise.sets}
            reps={exercise.reps}
            restTimeInSeconds={exercise.restTimeInSeconds}
          />
        ))}
      </section>

      {inProgressSession && !completedSession && (
        <CompleteWorkoutButton
          workoutPlanId={workoutPlanId}
          workoutDayId={dayId}
          sessionId={inProgressSession.id}
        />
      )}

      <BottomNav activeItem="workout-plan" />
    </main>
  );
}
