import type { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";
import {
  toWorkoutPlanDto,
  workoutPlanInclude,
} from "../lib/workout-mappers.js";

interface InputDto {
  userId: string;
  name: string;
  isActive: boolean;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRest: boolean;
    coverImageUrl?: string;
    exercises: Array<{
      name: string;
      order: number;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
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
  }>;
}

export class CreateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.$transaction(async (tx) => {
      if (dto.isActive) {
        await tx.workoutPlan.updateMany({
          where: {
            userId: dto.userId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });
      }

      return tx.workoutPlan.create({
        data: {
          name: dto.name,
          isActive: dto.isActive,
          userId: dto.userId,
          workoutDays: {
            create: dto.workoutDays.map((workoutDay) => ({
              name: workoutDay.name,
              weekDay: workoutDay.weekDay,
              isRest: workoutDay.isRest,
              coverImageUrl: workoutDay.coverImageUrl,
              exercises: {
                create: workoutDay.exercises.map((exercise) => ({
                  name: exercise.name,
                  order: exercise.order,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restTimeInSeconds: exercise.restTimeInSeconds,
                })),
              },
            })),
          },
        },
        include: workoutPlanInclude,
      });
    });

    return toWorkoutPlanDto(workoutPlan);
  }
}
