import type { Metadata } from "next";
import { AdminOrdersList } from "./AdminOrdersList";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Commandes",
  description: "Toutes les commandes des clients et leur statut.",
  // page réservée à l'admin : les moteurs de recherche ne l'indexent pas
  robots: { index: false },
};

// Page /admin/commandes : page serveur, le chargement des commandes est fait par AdminOrdersList (composant client)
// <main> et le menu des rubriques viennent de app/admin/layout.tsx (AdminGuard, carte #97) :
// la page ne renvoie que son contenu, dans un fragment <> </> (regroupe sans ajouter de balise)
export default function AdminOrdersPage() {
  return (
    <>
      <h1 className={styles.title}>Commandes</h1>
      <AdminOrdersList />
    </>
  );
}
