import type { Metadata } from "next";
import { CartSummary } from "./CartSummary";
import styles from "./page.module.css";

// Page serveur : le titre, puis un composant client qui charge le panier
// (le navigateur envoie le cookie de connexion, le serveur Next non)
export const metadata: Metadata = {
  title: "Récapitulatif de la commande",
  // page privée : les moteurs de recherche ne l'indexent pas
  robots: { index: false },
};

export default function SummaryPage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <p className={styles.tagline}>Commande · étape 1 sur 3</p>
        <h1 className={styles.title}>Récapitulatif</h1>
        <p className={styles.subtitle}>
          Vérifiez les arbres de votre commande avant de passer au paiement.
        </p>

        <CartSummary />
      </div>
    </main>
  );
}
