import { NotFoundError } from "../errors/index.js";
import type { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";
import { toWorkoutDayDto, workoutDayInclude } from "../lib/workout-mappers.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
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

export class CreateWorkoutDay {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: dto.workoutPlanId,
        userId: dto.userId,
      },
      select: {
        id: true,
      },
    });

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found");
    }

    const workoutDay = await prisma.workoutDay.create({
      data: {
        name: dto.name,
        weekDay: dto.weekDay,
        isRest: dto.isRest,
        coverImageUrl: dto.coverImageUrl,
        workoutPlanId: workoutPlan.id,
        exercises: {
          create: dto.exercises.map((exercise) => ({
            name: exercise.name,
            order: exercise.order,
            sets: exercise.sets,
            reps: exercise.reps,
            restTimeInSeconds: exercise.restTimeInSeconds,
          })),
        },
      },
      include: workoutDayInclude,
    });

    return toWorkoutDayDto(workoutDay);
  }
}
