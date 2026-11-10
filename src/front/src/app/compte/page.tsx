import type { Metadata } from "next";
import { AccountContent } from "./AccountContent";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Mon compte",
  description:
    "Vos commandes, vos informations personnelles et votre mot de passe.",
  // page privée : les moteurs de recherche ne l'indexent pas
  robots: { index: false },
};

// Page /compte : page serveur ; AccountContent (client) vérifie la connexion avant d'afficher le reste
export default function AccountPage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>Mon compte</h1>
        <AccountContent />
      </div>
    </main>
  );
}
