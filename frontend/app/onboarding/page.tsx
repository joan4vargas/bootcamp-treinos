import { getAuthenticatedUser } from "@/app/_lib/get-authenticated-user";

import { OnboardingChat } from "./_components/onboarding-chat";

export default async function OnboardingPage() {
  await getAuthenticatedUser();

  return (
    <main className="h-dvh">
      <OnboardingChat />
    </main>
  );
}
