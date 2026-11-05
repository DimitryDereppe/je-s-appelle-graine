// Appelle l'API depuis un composant client : le navigateur envoie le cookie tout seul
// Renvoie la réponse telle quelle : chaque composant réagit selon response.status
export function clientApi(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<Response> {
  return fetch(`/api/${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
