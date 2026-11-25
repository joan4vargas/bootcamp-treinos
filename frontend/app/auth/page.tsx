import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { AppLogo } from "@/app/_components/app-logo";
import { authClient } from "@/app/_lib/auth-client";

import { GoogleSignInButton } from "./_components/google-sign-in-button";

export default async function AuthPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const session = await authClient.getSession({
    fetchOptions: { headers: { cookie } },
  });

  if (session.data?.user) {
    redirect("/");
  }

  return (
    <main className="bg-overlay relative flex min-h-dvh flex-col justify-between overflow-hidden">
      <Image
        src="/images/login-bg.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 448px) 100vw, 448px"
        className="object-cover object-center"
      />

      <div className="relative flex justify-center pt-12">
        <AppLogo className="text-overlay-foreground text-[38px] leading-none uppercase" />
      </div>

      <section className="bg-primary relative flex flex-col gap-15 rounded-t-3xl px-5 pt-12 pb-10">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-primary-foreground text-center text-[32px] leading-[1.05] font-semibold">
            O app que vai transformar a forma como você treina.
          </h1>
          <GoogleSignInButton />
        </div>
        <p className="text-primary-foreground/70 text-center text-xs leading-[1.4]">
          ©2026 Copyright FIT.AI. Todos os direitos reservados
        </p>
      </section>
    </main>
  );
}
