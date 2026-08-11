import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4.4mb",
    },
  },

  async redirects() {
    return [
      {
        source: "/offres-demploi",
        destination: "/fr/offres",
        permanent: true,
      },
      {
        source: "/contactez-nous",
        destination: "/fr",
        permanent: true,
      },
      {
        source: "/travailler-comme-medecin-en-france-2",
        destination: "/fr",
        permanent: true,
      },
      {
        source: "/pour-les-etablissements",
        destination: "/fr/etablissements",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;