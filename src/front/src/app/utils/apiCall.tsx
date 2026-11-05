// Lit une route de l'API depuis une page serveur
export async function api<TResponse>(endpoint: string): Promise<TResponse> {
  const response = await fetch(`${process.env.API_URL}/api/${endpoint}`);

  if (!response.ok) {
    throw new Error(
      `Nous n'avons pas pu atteindre ${endpoint}: ${response.statusText}`,
    );
  }

  return (await response.json()) as TResponse;
}
