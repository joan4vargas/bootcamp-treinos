"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { ChatPanel } from "@/app/_components/chat-panel";
import { useCoachChat } from "@/app/_components/use-coach-chat";
import { Button } from "@/components/ui/button";

const ONBOARDING_INITIAL_MESSAGE = "Quero começar a melhorar minha saúde";

const WELCOME_MESSAGES = [
  "Bem-vindo ao FIT.AI! 🎉",
  "O app que vai transformar a forma como você treina. Aqui você monta seu plano de treino personalizado, acompanha sua evolução com estatísticas detalhadas e conta com uma IA disponível 24h para te guiar em cada exercício.",
  "Tudo pensado para você alcançar seus objetivos de forma inteligente e consistente.",
  "Vamos configurar seu perfil?",
];

export function OnboardingChat() {
  const { messages, sendMessage, status, error } =
    useCoachChat("onboarding-chat");
  const hasSentInitialMessageRef = useRef(false);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (hasSentInitialMessageRef.current) {
      return;
    }

    hasSentInitialMessageRef.current = true;
    sendMessage({ text: ONBOARDING_INITIAL_MESSAGE });
  }, [sendMessage]);

  return (
    <ChatPanel
      messages={messages}
      isLoading={isLoading}
      hasError={!!error}
      welcomeMessages={WELCOME_MESSAGES}
      showSuggestions={false}
      onSendMessage={(text) => sendMessage({ text })}
      headerAction={
        <Button
          asChild
          className="h-7.5 rounded-full px-4 text-sm leading-none font-semibold"
        >
          <Link href="/">Acessar FIT.AI</Link>
        </Button>
      }
    />
  );
}
