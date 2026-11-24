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

export class GetWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: dto.workoutPlanId,
        userId: dto.userId,
      },
      include: workoutPlanInclude,
    });

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found");
    }

    return toWorkoutPlanDto(workoutPlan);
  }
}
