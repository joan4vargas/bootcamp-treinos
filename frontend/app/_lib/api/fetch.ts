import { headers } from "next/headers";

const EMPTY_BODY_STATUSES = [204, 205, 304];

const getResponseBody = async (response: Response) => {
  if (EMPTY_BODY_STATUSES.includes(response.status)) {
    return null;
  }

  const text = await response.text();

  return text ? JSON.parse(text) : null;
};

export async function customFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const requestUrl = new URL(url, process.env.NEXT_PUBLIC_API_URL);
  const requestHeaders = new Headers(options.headers);
  const cookie = (await headers()).get("cookie");

  if (cookie) {
    requestHeaders.set("cookie", cookie);
  }

  const response = await fetch(requestUrl, {
    ...options,
    headers: requestHeaders,
    credentials: "include",
    cache: "no-store",
  });

  const data = await getResponseBody(response);

  return { data, status: response.status, headers: response.headers } as T;
}
