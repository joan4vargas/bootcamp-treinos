import { BicepsFlexed, Ruler, User, WeightTilde } from "lucide-react";

import { BottomNav } from "@/app/_components/bottom-nav";
import { PageHeader } from "@/app/_components/page-header";
import { StatCard } from "@/app/_components/stat-card";
import { requireOnboardedUser } from "@/app/_lib/require-onboarded-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { SignOutButton } from "./_components/sign-out-button";

const GRAMS_IN_KILOGRAM = 1000;

const formatWeight = (weightInGrams: number) =>
  (weightInGrams / GRAMS_IN_KILOGRAM).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });

export default async function ProfilePage() {
  const { user, trainData } = await requireOnboardedUser();
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();

  return (
    <main className="pb-28">
      <PageHeader />

      <section className="flex flex-col gap-5 p-5">
        <div className="flex items-center gap-3">
          <Avatar className="size-13">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-accent text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-lg leading-[1.05] font-semibold">
              {user.name}
            </h1>
            <p className="text-foreground/70 text-sm leading-[1.15]">
              {user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={WeightTilde}
            value={formatWeight(trainData.weightInGrams)}
            label="Kg"
          />
          <StatCard
            icon={Ruler}
            value={String(trainData.heightInCentimeters)}
            label="Cm"
          />
          <StatCard
            icon={BicepsFlexed}
            value={`${trainData.bodyFatPercentage}%`}
            label="Gc"
          />
          <StatCard icon={User} value={String(trainData.age)} label="Anos" />
        </div>

        <SignOutButton />
      </section>

      <BottomNav activeItem="profile" />
    </main>
  );
}
