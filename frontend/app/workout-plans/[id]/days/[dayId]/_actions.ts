"use server";

import { revalidatePath } from "next/cache";

import {
  startWorkoutSession,
  updateWorkoutSession,
} from "@/app/_lib/api/fetch-generated";

const getWorkoutDayPath = (workoutPlanId: string, workoutDayId: string) =>
  `/workout-plans/${workoutPlanId}/days/${workoutDayId}`;

export async function startWorkoutAction(
  workoutPlanId: string,
  workoutDayId: string,
) {
  await startWorkoutSession(workoutPlanId, workoutDayId);
  revalidatePath(getWorkoutDayPath(workoutPlanId, workoutDayId));
  revalidatePath("/");
}

export async function completeWorkoutAction(
  workoutPlanId: string,
  workoutDayId: string,
  sessionId: string,
) {
  await updateWorkoutSession(workoutPlanId, workoutDayId, sessionId, {
    completedAt: new Date().toISOString(),
  });
  revalidatePath(getWorkoutDayPath(workoutPlanId, workoutDayId));
  revalidatePath("/");
}
