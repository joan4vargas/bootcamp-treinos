import "@fontsource/inter-tight/400.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/anton/400.css";
import "streamdown/styles.css";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import { Chat } from "./_components/chat";

export const metadata: Metadata = {
  title: "FIT.AI",
  description: "O app que vai transformar a forma como você treina.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="bg-background min-h-dvh">
        <NuqsAdapter>
          <div className="relative mx-auto min-h-dvh w-full max-w-md">
            {children}
          </div>
          <Suspense>
            <Chat />
          </Suspense>
        </NuqsAdapter>
      </body>
    </html>
  );
}
