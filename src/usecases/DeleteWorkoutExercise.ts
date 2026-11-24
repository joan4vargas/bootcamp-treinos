import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  workoutExerciseId: string;
}

interface OutputDto {
  deleted: boolean;
}

export class DeleteWorkoutExercise {
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

    await prisma.workoutExercise.delete({
      where: {
        id: existingWorkoutExercise.id,
      },
    });

    return { deleted: true };
  }
}
