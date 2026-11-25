import { NotFoundError } from "../errors/index.js";
import type { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";
import { toWorkoutDayDto, workoutDayInclude } from "../lib/workout-mappers.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  name?: string;
  weekDay?: WeekDay;
  isRest?: boolean;
  coverImageUrl?: string | null;
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
  createdAt: string;
  updatedAt: string;
}

export class UpdateWorkoutDay {
  async execute(dto: InputDto): Promise<OutputDto> {
    const existingWorkoutDay = await prisma.workoutDay.findFirst({
      where: {
        id: dto.workoutDayId,
        workoutPlanId: dto.workoutPlanId,
        workoutPlan: {
          userId: dto.userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!existingWorkoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    const workoutDay = await prisma.workoutDay.update({
      where: {
        id: existingWorkoutDay.id,
      },
      data: {
        name: dto.name,
        weekDay: dto.weekDay,
        isRest: dto.isRest,
        coverImageUrl: dto.coverImageUrl,
      },
      include: workoutDayInclude,
    });

    return toWorkoutDayDto(workoutDay);
  }
}
