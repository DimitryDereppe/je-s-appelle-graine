import { Lora } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartCountProvider } from "@/app/context/CartCountContext";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CommitmentsOnOtherPages from "@/components/commitments/CommitmentsOnOtherPages";

type RootLayoutProps = {
  children: ReactNode;
};

// Metadata par défaut de tout le site : chaque page ne donne que son titre
export const metadata: Metadata = {
  // adresse du site : rend absolues les URL des images de partage (openGraph)
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Je s’appelle Graine",
    // %s = le titre de la page : « Nos arbres | Je s’appelle Graine »
    template: "%s | Je s’appelle Graine",
  },
  // icône de l'onglet (sinon le navigateur demande /favicon.ico : 404)
  icons: { icon: "/assets/graine-logo.ico" },
  description:
    "Achetez un arbre : nous le plantons dans une forêt partenaire, au lieu que vous avez choisi.",
};

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body className={lora.variable}>
        <CartCountProvider>
          <Header />
          {children}
        </CartCountProvider>
        <CommitmentsOnOtherPages />
        <Footer />
      </body>
    </html>
  );
}
