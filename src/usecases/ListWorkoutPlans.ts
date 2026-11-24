import type { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";
import {
  toWorkoutPlanDto,
  workoutPlanInclude,
} from "../lib/workout-mappers.js";

interface InputDto {
  userId: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

interface OutputDto {
  items: Array<{
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
  }>;
  total: number;
}

export class ListWorkoutPlans {
  async execute(dto: InputDto): Promise<OutputDto> {
    const where = {
      userId: dto.userId,
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    };

    const [workoutPlans, total] = await prisma.$transaction([
      prisma.workoutPlan.findMany({
        where,
        include: workoutPlanInclude,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: dto.offset,
        take: dto.limit,
      }),
      prisma.workoutPlan.count({
        where,
      }),
    ]);

    return {
      items: workoutPlans.map(toWorkoutPlanDto),
      total,
    };
  }
}
