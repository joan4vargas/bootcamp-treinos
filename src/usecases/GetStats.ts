import dayjs from "dayjs";

import { prisma } from "../lib/db.js";
import {
  buildConsistencyByDay,
  calculateWorkoutStreak,
  type DayConsistency,
  getStreakWindowStart,
} from "../lib/workout-consistency.js";

interface InputDto {
  userId: string;
  from: string;
  to: string;
}

interface OutputDto {
  workoutStreak: number;
  consistencyByDay: Record<string, DayConsistency>;
  completedWorkoutsCount: number;
  conclusionRate: number;
  totalTimeInSeconds: number;
}

export class GetStats {
  async execute(dto: InputDto): Promise<OutputDto> {
    const from = dayjs(dto.from).startOf("day");
    const to = dayjs(dto.to).endOf("day");
    const today = dayjs();

    const [rangeSessions, streakSessions, activeWorkoutPlan] =
      await Promise.all([
        prisma.workoutSession.findMany({
          where: {
            workoutDay: {
              workoutPlan: {
                userId: dto.userId,
              },
            },
            startedAt: {
              gte: from.toDate(),
              lte: to.toDate(),
            },
          },
          select: {
            startedAt: true,
            completedAt: true,
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
              gte: getStreakWindowStart(today).toDate(),
            },
          },
          select: {
            startedAt: true,
            completedAt: true,
          },
        }),
        prisma.workoutPlan.findFirst({
          where: {
            userId: dto.userId,
            isActive: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
          select: {
            workoutDays: {
              where: {
                isRest: true,
              },
              select: {
                weekDay: true,
              },
            },
          },
        }),
      ]);

    const completedSessions = rangeSessions.filter(
      (session) => session.completedAt !== null,
    );
    const totalTimeInSeconds = completedSessions.reduce(
      (total, session) =>
        total +
        Math.max(
          0,
          dayjs(session.completedAt).diff(session.startedAt, "second"),
        ),
      0,
    );
    const restWeekDays =
      activeWorkoutPlan?.workoutDays.map((workoutDay) => workoutDay.weekDay) ??
      [];

    return {
      workoutStreak: calculateWorkoutStreak(
        streakSessions,
        restWeekDays,
        today,
      ),
      consistencyByDay: buildConsistencyByDay(rangeSessions, from, to),
      completedWorkoutsCount: completedSessions.length,
      conclusionRate:
        rangeSessions.length === 0
          ? 0
          : completedSessions.length / rangeSessions.length,
      totalTimeInSeconds,
    };
  }
}
