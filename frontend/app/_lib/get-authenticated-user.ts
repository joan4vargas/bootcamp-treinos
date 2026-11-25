import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "./auth-client";

export const getAuthenticatedUser = async () => {
  const cookie = (await headers()).get("cookie") ?? "";
  const session = await authClient.getSession({
    fetchOptions: { headers: { cookie } },
  });

  if (!session.data?.user) {
    redirect("/auth");
  }

  return session.data.user;
};
