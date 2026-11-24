import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";
import { toWorkoutExerciseDto } from "../lib/workout-mappers.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  name: string;
  order: number;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
}

interface OutputDto {
  id: string;
  name: string;
  order: number;
  workoutDayId: string;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export class CreateWorkoutExercise {
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
      },
    });

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        name: dto.name,
        order: dto.order,
        sets: dto.sets,
        reps: dto.reps,
        restTimeInSeconds: dto.restTimeInSeconds,
        workoutDayId: workoutDay.id,
      },
    });

    return toWorkoutExerciseDto(workoutExercise);
  }
}
