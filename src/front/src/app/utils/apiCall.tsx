import { cookies } from "next/headers";
import type { IFeaturedTree } from "../../@types";

export const dynamic = "force-dynamic";

export async function api<
  TBody extends IFeaturedTree = IFeaturedTree,
  TResponse = unknown,
>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: TBody,
): Promise<TResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${process.env.API_URL}/api/${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`Nous n'avons pas pu atteindre ${endpoint}: ${response.statusText}`);
  }

  return (await response.json()) as TResponse;
}   