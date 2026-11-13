// Le sitemap, c'est le plan du site pour les moteurs de recherche (Google…) :
// une liste des pages publiques, au format XML, à l'adresse /sitemap.xml.
// Le moteur de recherche le lit pour trouver toutes nos pages,
// même celles vers lesquelles peu de liens mènent (chaque fiche d'arbre).
// Il est annoncé dans /robots.txt (robots.ts) : « Sitemap: …/sitemap.xml ».
//
// Next.js transforme ce fichier en /sitemap.xml tout seul :
// la fonction renvoie un tableau de { url }, Next écrit le XML.
// Résultat : <urlset><url><loc>https://…/arbres/1</loc></url>…</urlset>

import type { MetadataRoute } from "next";
import type { ICatalogueTree } from "@/@types";
import { api } from "@/app/utils/apiCall";

// recalculé à chaque demande (et non une fois au build) :
// au build, ni SITE_URL ni l'API ne sont disponibles
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // adresse du site en ligne (.env du VPS), localhost en dev
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

  // 1. les pages fixes et publiques
  // (pas /compte, /commandes, /panier ni /admin :elles sont privées, interdites dans robots.ts)
  const pages = [
    "",
    "/arbres",
    "/qui-sommes-nous",
    "/mentions-legales",
    "/politique-de-confidentialite",
  ].map((path) => ({ url: `${siteUrl}${path}` }));

  // 2. une fiche par arbre du catalogue, lue dans l'API (GET /api/trees)
  // API indisponible : on renvoie au moins les pages fixes
  let trees: ICatalogueTree[] = [];
  try {
    trees = await api<ICatalogueTree[]>("trees");
  } catch {
    trees = [];
  }

  const treePages = trees.map((tree) => ({
    url: `${siteUrl}/arbres/${tree.id}`,
  }));

  // ... (spread) : un seul tableau avec les pages fixes puis les fiches
  return [...pages, ...treePages];
}
