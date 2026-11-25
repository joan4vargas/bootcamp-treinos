import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { AppLogo } from "./app-logo";

interface HomeBannerProps {
  userName: string;
  ctaHref: string;
}

export function HomeBanner({ userName, ctaHref }: HomeBannerProps) {
  const firstName = userName.split(" ")[0];

  return (
    <section className="bg-overlay relative flex h-74 flex-col justify-between overflow-hidden rounded-b-[20px] px-5 pt-5 pb-10">
      <Image
        src="/images/home-banner.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 448px) 100vw, 448px"
        className="object-cover object-top"
      />
      <div className="to-overlay absolute inset-0 bg-linear-to-bl from-transparent" />

      <AppLogo className="text-overlay-foreground relative" />

      <div className="relative flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-overlay-foreground text-2xl leading-[1.05] font-semibold">
            Olá, {firstName}
          </h1>
          <p className="text-overlay-foreground/70 text-sm leading-[1.15]">
            Bora treinar hoje?
          </p>
        </div>
        <Button
          asChild
          className="h-7.5 rounded-full px-4 text-sm leading-none font-semibold"
        >
          <Link href={ctaHref}>Bora!</Link>
        </Button>
      </div>
    </section>
  );
}
