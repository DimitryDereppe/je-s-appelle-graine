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
  const response = await fetch(`${process.env.API_URL}/api/${endpoint}`, {
    method:method,
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }

  return (await response.json()) as TResponse;
}
