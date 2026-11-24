import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";
import { toWorkoutExerciseDto } from "../lib/workout-mappers.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  workoutExerciseId: string;
  name?: string;
  order?: number;
  sets?: number;
  reps?: number;
  restTimeInSeconds?: number;
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

export class UpdateWorkoutExercise {
  async execute(dto: InputDto): Promise<OutputDto> {
    const existingWorkoutExercise = await prisma.workoutExercise.findFirst({
      where: {
        id: dto.workoutExerciseId,
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
      },
    });

    if (!existingWorkoutExercise) {
      throw new NotFoundError("Workout exercise not found");
    }

    const workoutExercise = await prisma.workoutExercise.update({
      where: {
        id: existingWorkoutExercise.id,
      },
      data: {
        name: dto.name,
        order: dto.order,
        sets: dto.sets,
        reps: dto.reps,
        restTimeInSeconds: dto.restTimeInSeconds,
      },
    });

    return toWorkoutExerciseDto(workoutExercise);
  }
}
