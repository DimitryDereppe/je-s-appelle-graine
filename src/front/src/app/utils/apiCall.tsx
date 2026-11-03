import type { IFeaturedTree } from "../../@types";
export const dynamic = "force-dynamic";

export async function getAllTrees(): Promise<IFeaturedTree[]> {
  const res = await fetch(`${process.env.API_URL}/api/trees`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Erreur HTTP ${res.status}`);
  }

  return res.json();
}

