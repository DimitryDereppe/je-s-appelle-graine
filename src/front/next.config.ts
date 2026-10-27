import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Racine du front = ce dossier (sinon Next.js hésite avec le package-lock.json de la racine du dépôt)
  turbopack: { root: __dirname },

  // /api/... -> l'API (API_URL : compose en Docker, .env.local en local)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL ?? "http://localhost:4050"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
