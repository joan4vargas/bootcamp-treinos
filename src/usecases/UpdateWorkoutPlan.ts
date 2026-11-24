import { NotFoundError } from "../errors/index.js";
import type { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";
import {
  toWorkoutPlanDto,
  workoutPlanInclude,
} from "../lib/workout-mappers.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  name?: string;
  isActive?: boolean;
}

interface OutputDto {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  workoutDays: Array<{
    id: string;
    name: string;
    workoutPlanId: string;
    isRest: boolean;
    weekDay: WeekDay;
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
  }>;
}

export class UpdateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const existingWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: dto.workoutPlanId,
        userId: dto.userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingWorkoutPlan) {
      throw new NotFoundError("Workout plan not found");
    }

    const workoutPlan = await prisma.workoutPlan.update({
      where: {
        id: existingWorkoutPlan.id,
      },
      data: {
        name: dto.name,
        isActive: dto.isActive,
      },
      include: workoutPlanInclude,
    });

    return toWorkoutPlanDto(workoutPlan);
  }
}
