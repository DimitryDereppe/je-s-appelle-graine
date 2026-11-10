import type { Metadata } from "next";
import { OrdersList } from "./OrdersList";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Mes commandes",
  description: "L’historique de vos commandes d’arbres et leur statut.",
  // page privée : les moteurs de recherche ne l'indexent pas
  robots: { index: false },
};

// Page /commandes : page serveur, le chargement des commandes est fait par OrdersList (page client)
export default function OrdersPage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>Mes commandes</h1>
        <OrdersList />
      </div>
    </main>
  );
}
