import { prisma } from "./db.js";

export async function findOwnedWorkoutPlan(planId: string, userId: string) {
  return prisma.workoutPlan.findFirst({
    where: {
      id: planId,
      userId,
    },
    select: {
      id: true,
    },
  });
}

export async function findOwnedWorkoutDay(
  planId: string,
  dayId: string,
  userId: string,
) {
  return prisma.workoutDay.findFirst({
    where: {
      id: dayId,
      workoutPlanId: planId,
      workoutPlan: {
        userId,
      },
    },
    select: {
      id: true,
    },
  });
}

export async function findOwnedWorkoutExercise(
  planId: string,
  dayId: string,
  exerciseId: string,
  userId: string,
) {
  return prisma.workoutExercise.findFirst({
    where: {
      id: exerciseId,
      workoutDayId: dayId,
      workoutDay: {
        workoutPlanId: planId,
        workoutPlan: {
          userId,
        },
      },
    },
    select: {
      id: true,
    },
  });
}
