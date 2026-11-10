import type { Metadata } from "next";
import { AdminOrdersList } from "./AdminOrdersList";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Commandes — Administration",
  description: "Toutes les commandes des clients et leur statut.",
  // page réservée à l'admin : les moteurs de recherche ne l'indexent pas
  robots: { index: false },
};

// Page /admin/commandes : page serveur, le chargement des commandes est fait par AdminOrdersList (composant client)
// la mise en page /admin (onglets Catalogue, Commandes, Comptes) vient de app/admin/layout.tsx (carte #97, Shanna)
export default function AdminOrdersPage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>Commandes</h1>
        <AdminOrdersList />
      </div>
    </main>
  );
}
