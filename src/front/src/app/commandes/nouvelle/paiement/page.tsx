import type { Metadata } from "next";
import Link from "next/link";
import { PaymentForm } from "./PaymentForm";
import styles from "./page.module.css";

// Page serveur : le titre et le formulaire (composant client, car il réagit aux clics)
export const metadata: Metadata = {
  title: "Paiement",
  // page privée : les moteurs de recherche ne l'indexent pas
  robots: { index: false },
};

export default function PaymentPage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <p className={styles.tagline}>Commande · étape 2 sur 3</p>
        <h1 className={styles.title}>Paiement</h1>
        <p className={styles.subtitle}>
          Choisissez votre mode de paiement et indiquez votre adresse de
          facturation.
        </p>

        <PaymentForm />

        <p className={styles.back}>
          <Link href="/commandes/nouvelle">Revenir au récapitulatif</Link>
        </p>
      </div>
    </main>
  );
}
