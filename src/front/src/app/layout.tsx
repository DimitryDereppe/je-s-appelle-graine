import { Lora } from "next/font/google";

import type { ReactNode } from "react";
import "./globals.css";
import { CartCountProvider } from "@/app/context/CartCountContext";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CommitmentsOnOtherPages from "@/components/commitments/CommitmentsOnOtherPages";

type RootLayoutProps = {
  children: ReactNode;
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
