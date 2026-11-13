// Le fichier robots.txt donne les consignes aux robots des moteurs de recherche (Google…),
// à l'adresse /robots.txt : c'est la première chose qu'un robot lit en arrivant sur un site.
// Il dit quelles pages le robot peut parcourir, et où trouver le plan du site (sitemap.ts).
//
// Next.js transforme ce fichier en /robots.txt tout seul :
// la fonction renvoie un objet, Next écrit le texte. Résultat :
//   User-Agent: *
//   Allow: /
//   Disallow: /admin
//   ...
//   Sitemap: https://…/sitemap.xml
//
// ⚠️ Ce n'est pas une protection : un robot honnête respecte ces consignes, les autres non.
// Les pages privées restent protégées par l'API (401, 403) ;
// robots: { index: false } dans leurs metadata dit en plus aux moteurs de ne pas les afficher dans les résultats.

import type { MetadataRoute } from "next";

// recalculé à chaque demande (et non une fois au build) :
// au build, SITE_URL n'est pas disponible (il arrive au démarrage du conteneur)
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  // adresse du site en ligne (.env du VPS), localhost en dev
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

  return {
    rules: {
      // * = tous les robots (Google, Bing…)
      userAgent: "*",
      // par défaut, tout le site peut être parcouru…
      allow: "/",
      // … sauf les pages privées : espace admin, compte, commandes et panier du client
      disallow: ["/admin", "/compte", "/commandes", "/panier"],
    },
    // adresse du plan du site (sitemap.ts), pour que le robot trouve toutes les pages publiques
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
