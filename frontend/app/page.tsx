import { BottomNav } from "./_components/bottom-nav";
import { ConsistencyTracker } from "./_components/consistency-tracker";
import { HomeBanner } from "./_components/home-banner";
import { RestDayCard } from "./_components/rest-day-card";
import { SectionHeader } from "./_components/section-header";
import { StreakBadge } from "./_components/streak-badge";
import { WorkoutDayCard } from "./_components/workout-day-card";
import { requireOnboardedUser } from "./_lib/require-onboarded-user";

export default async function HomePage() {
  const { user, homeData } = await requireOnboardedUser();
  const {
    activeWorkoutPlanId,
    todayWorkoutDay,
    workoutStreak,
    consistencyByDay,
  } = homeData;

  const workoutPlanHref = `/workout-plans/${activeWorkoutPlanId}`;
  const todayWorkoutHref = todayWorkoutDay
    ? `${workoutPlanHref}/days/${todayWorkoutDay.id}`
    : workoutPlanHref;

  return (
    <main className="pb-28">
      <HomeBanner
        userName={user.name}
        ctaHref={todayWorkoutDay?.isRest ? workoutPlanHref : todayWorkoutHref}
      />

      <section className="flex flex-col gap-3 px-5 pt-5">
        <SectionHeader
          title="Consistência"
          linkLabel="Ver histórico"
          linkHref="/stats"
        />
        <div className="flex gap-3">
          <ConsistencyTracker consistencyByDay={consistencyByDay} />
          <StreakBadge workoutStreak={workoutStreak} />
        </div>
      </section>

      <section className="flex flex-col gap-3 p-5">
        <SectionHeader
          title="Treino de Hoje"
          linkLabel="Ver treinos"
          linkHref={workoutPlanHref}
        />
        {!todayWorkoutDay && (
          <p className="text-muted-foreground text-sm">
            Nenhum treino cadastrado para hoje.
          </p>
        )}
        {todayWorkoutDay?.isRest && (
          <RestDayCard weekDay={todayWorkoutDay.weekDay} />
        )}
        {todayWorkoutDay && !todayWorkoutDay.isRest && (
          <WorkoutDayCard
            name={todayWorkoutDay.name}
            weekDay={todayWorkoutDay.weekDay}
            estimatedDurationInSeconds={
              todayWorkoutDay.estimatedDurationInSeconds
            }
            exercisesCount={todayWorkoutDay.exercisesCount}
            coverImageUrl={todayWorkoutDay.coverImageUrl}
            href={todayWorkoutHref}
          />
        )}
      </section>

      <BottomNav activeItem="home" />
    </main>
  );
}
