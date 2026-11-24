import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
}

interface OutputDto {
  deleted: boolean;
}

export class DeleteWorkoutPlan {
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

    await prisma.workoutPlan.delete({
      where: {
        id: existingWorkoutPlan.id,
      },
    });

    return { deleted: true };
  }
}
