import { redirect } from "next/navigation";

import { getHomeData, getUserTrainData } from "./api/fetch-generated";
import { getTodayDateKey } from "./dates";
import { getAuthenticatedUser } from "./get-authenticated-user";

export const requireOnboardedUser = async () => {
  const user = await getAuthenticatedUser();

  const [homeDataResponse, trainDataResponse] = await Promise.all([
    getHomeData(getTodayDateKey()),
    getUserTrainData(),
  ]);

  const homeData =
    homeDataResponse.status === 200 ? homeDataResponse.data : undefined;
  const trainData =
    trainDataResponse.status === 200 ? trainDataResponse.data : null;

  if (!homeData?.activeWorkoutPlanId || !trainData) {
    redirect("/onboarding");
  }

  return { user, homeData, trainData };
};
