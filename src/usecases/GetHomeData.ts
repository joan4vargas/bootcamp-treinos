import dayjs from "dayjs";

import type { WeekDay } from "../generated/prisma/enums.js";
import { getEndOfWeek, getStartOfWeek, getWeekDay } from "../lib/dates.js";
import { prisma } from "../lib/db.js";
import {
  buildConsistencyByDay,
  calculateWorkoutStreak,
  type DayConsistency,
  getStreakWindowStart,
} from "../lib/workout-consistency.js";
import { estimateWorkoutDayDurationInSeconds } from "../lib/workout-mappers.js";

interface InputDto {
  userId: string;
  date: string;
}

interface OutputDto {
  activeWorkoutPlanId?: string;
  todayWorkoutDay?: {
    workoutPlanId: string;
    id: string;
    name: string;
    isRest: boolean;
    weekDay: WeekDay;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string;
    exercisesCount: number;
  };
  workoutStreak: number;
  consistencyByDay: Record<string, DayConsistency>;
}

export class GetHomeData {
  async execute(dto: InputDto): Promise<OutputDto> {
    const referenceDate = dayjs(dto.date);
    const startOfWeek = getStartOfWeek(referenceDate);
    const endOfWeek = getEndOfWeek(referenceDate);

    const [activeWorkoutPlan, sessions] = await Promise.all([
      prisma.workoutPlan.findFirst({
        where: {
          userId: dto.userId,
          isActive: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          workoutDays: {
            include: {
              exercises: {
                select: {
                  sets: true,
                  reps: true,
                  restTimeInSeconds: true,
                },
              },
            },
          },
        },
      }),
      prisma.workoutSession.findMany({
        where: {
          workoutDay: {
            workoutPlan: {
              userId: dto.userId,
            },
          },
          startedAt: {
            gte: getStreakWindowStart(referenceDate).toDate(),
            lte: referenceDate.endOf("day").toDate(),
          },
        },
        select: {
          startedAt: true,
          completedAt: true,
        },
      }),
    ]);

    const workoutDays = activeWorkoutPlan?.workoutDays ?? [];
    const todayWeekDay = getWeekDay(referenceDate);
    const todayWorkoutDay = workoutDays.find(
      (workoutDay) => workoutDay.weekDay === todayWeekDay,
    );
    const restWeekDays = workoutDays
      .filter((workoutDay) => workoutDay.isRest)
      .map((workoutDay) => workoutDay.weekDay);
    const weekSessions = sessions.filter(
      (session) =>
        !dayjs(session.startedAt).isBefore(startOfWeek) &&
        !dayjs(session.startedAt).isAfter(endOfWeek),
    );

    return {
      activeWorkoutPlanId: activeWorkoutPlan?.id,
      todayWorkoutDay: todayWorkoutDay
        ? {
            workoutPlanId: todayWorkoutDay.workoutPlanId,
            id: todayWorkoutDay.id,
            name: todayWorkoutDay.name,
            isRest: todayWorkoutDay.isRest,
            weekDay: todayWorkoutDay.weekDay,
            estimatedDurationInSeconds: estimateWorkoutDayDurationInSeconds(
              todayWorkoutDay.exercises,
            ),
            coverImageUrl: todayWorkoutDay.coverImageUrl ?? undefined,
            exercisesCount: todayWorkoutDay.exercises.length,
          }
        : undefined,
      workoutStreak: calculateWorkoutStreak(
        sessions,
        restWeekDays,
        referenceDate,
      ),
      consistencyByDay: buildConsistencyByDay(
        weekSessions,
        startOfWeek,
        endOfWeek,
      ),
    };
  }
}
