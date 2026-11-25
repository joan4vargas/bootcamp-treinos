import { NotFoundError } from "../errors/index.js";
import type { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";
import {
  toWorkoutDayDto,
  toWorkoutSessionDto,
  workoutDayInclude,
} from "../lib/workout-mappers.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
}

interface OutputDto {
  id: string;
  name: string;
  workoutPlanId: string;
  isRest: boolean;
  weekDay: WeekDay;
  coverImageUrl: string | null;
  estimatedDurationInSeconds: number;
  exercises: Array<{
    id: string;
    name: string;
    order: number;
    workoutDayId: string;
    sets: number;
    reps: number;
    restTimeInSeconds: number;
    createdAt: string;
    updatedAt: string;
  }>;
  sessions: Array<{
    id: string;
    workoutDayId: string;
    startedAt: string;
    completedAt: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export class GetWorkoutDay {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutDay = await prisma.workoutDay.findFirst({
      where: {
        id: dto.workoutDayId,
        workoutPlanId: dto.workoutPlanId,
        workoutPlan: {
          userId: dto.userId,
        },
      },
      include: {
        ...workoutDayInclude,
        sessions: {
          orderBy: {
            startedAt: "desc",
          },
        },
      },
    });

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    return {
      ...toWorkoutDayDto(workoutDay),
      sessions: workoutDay.sessions.map(toWorkoutSessionDto),
    };
  }
}
