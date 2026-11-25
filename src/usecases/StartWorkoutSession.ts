import dayjs from "dayjs";

import {
  NotFoundError,
  RestDayError,
  SessionAlreadyStartedError,
  WorkoutPlanNotActiveError,
} from "../errors/index.js";
import { getEndOfWeek, getStartOfWeek } from "../lib/dates.js";
import { prisma } from "../lib/db.js";
import { toWorkoutSessionDto } from "../lib/workout-mappers.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
}

interface OutputDto {
  id: string;
  workoutDayId: string;
  startedAt: string;
  completedAt: string | null;
}

export class StartWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutDay = await prisma.workoutDay.findFirst({
      where: {
        id: dto.workoutDayId,
        workoutPlanId: dto.workoutPlanId,
        workoutPlan: {
          userId: dto.userId,
        },
      },
      select: {
        id: true,
        isRest: true,
        workoutPlan: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    if (!workoutDay.workoutPlan.isActive) {
      throw new WorkoutPlanNotActiveError();
    }

    if (workoutDay.isRest) {
      throw new RestDayError();
    }

    const now = dayjs();
    const sessionThisWeek = await prisma.workoutSession.findFirst({
      where: {
        workoutDayId: workoutDay.id,
        startedAt: {
          gte: getStartOfWeek(now).toDate(),
          lte: getEndOfWeek(now).toDate(),
        },
      },
      select: {
        id: true,
      },
    });

    if (sessionThisWeek) {
      throw new SessionAlreadyStartedError();
    }

    const session = await prisma.workoutSession.create({
      data: {
        workoutDayId: workoutDay.id,
        startedAt: now.toDate(),
      },
    });

    return toWorkoutSessionDto(session);
  }
}
