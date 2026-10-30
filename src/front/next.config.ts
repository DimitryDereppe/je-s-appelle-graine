import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Racine du front = ce dossier (sinon Next.js hésite avec le package-lock.json de la racine du dépôt)
  turbopack: { root: __dirname },

  // Production en Docker : le build produit .next/standalone, un dossier autonome
  // (server.js + seulement les node_modules utiles) -> image bien plus légère.
  output: "standalone",

  // /api/... -> l'API (API_URL : compose en Docker, .env.local en local)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL ?? "http://localhost:4050"}/api/:path*`,
      },
      // photos des arbres, servies par l'API
      {
        source: "/images/trees/:path*",
        destination: `${process.env.API_URL ?? "http://localhost:4050"}/images/trees/:path*`,
      },
    ];
  },
};

export default nextConfig;
