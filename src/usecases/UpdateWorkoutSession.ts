import dayjs from "dayjs";

import {
  NotFoundError,
  SessionAlreadyCompletedError,
} from "../errors/index.js";
import { prisma } from "../lib/db.js";
import { toWorkoutSessionDto } from "../lib/workout-mappers.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  completedAt: string;
}

interface OutputDto {
  id: string;
  workoutDayId: string;
  startedAt: string;
  completedAt: string | null;
}

export class UpdateWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const existingSession = await prisma.workoutSession.findFirst({
      where: {
        id: dto.sessionId,
        workoutDayId: dto.workoutDayId,
        workoutDay: {
          workoutPlanId: dto.workoutPlanId,
          workoutPlan: {
            userId: dto.userId,
          },
        },
      },
      select: {
        id: true,
        completedAt: true,
      },
    });

    if (!existingSession) {
      throw new NotFoundError("Workout session not found");
    }

    if (existingSession.completedAt) {
      throw new SessionAlreadyCompletedError();
    }

    const session = await prisma.workoutSession.update({
      where: {
        id: existingSession.id,
      },
      data: {
        completedAt: dayjs(dto.completedAt).toDate(),
      },
    });

    return toWorkoutSessionDto(session);
  }
}
