import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
}

interface OutputDto {
  deleted: boolean;
}

export class DeleteWorkoutDay {
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

    await prisma.workoutDay.delete({
      where: {
        id: existingWorkoutDay.id,
      },
    });

    return { deleted: true };
  }
}
