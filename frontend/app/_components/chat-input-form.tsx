"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const chatInputSchema = z.object({
  message: z.string().trim().min(1),
});

type ChatInputValues = z.infer<typeof chatInputSchema>;

interface ChatInputFormProps {
  isDisabled: boolean;
  onSubmit: (message: string) => void;
}

export function ChatInputForm({ isDisabled, onSubmit }: ChatInputFormProps) {
  const form = useForm<ChatInputValues>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: { message: "" },
  });

  const handleSubmit = ({ message }: ChatInputValues) => {
    onSubmit(message);
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="border-border flex items-center gap-2 border-t p-5"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  {...field}
                  autoComplete="off"
                  placeholder="Digite sua mensagem"
                  className="bg-secondary border-secondary h-10.5 rounded-full px-4 text-sm shadow-none"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Enviar mensagem"
          disabled={isDisabled}
          className="size-10.5 rounded-full [&_svg:not([class*='size-'])]:size-5"
        >
          <ArrowUp />
        </Button>
      </form>
    </Form>
  );
}
