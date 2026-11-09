import type { Metadata } from "next";
import Link from "next/link";
import { OrderDetail } from "./OrderDetail";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Détail de la commande",
  description:
    "Le détail de votre commande d’arbres, son statut et son annulation.",
  // page privée : les moteurs de recherche ne l'indexent pas
  robots: { index: false },
};

// Next.js lit [id] dans l'URL et le donne dans params
interface OrderPageProps {
  params: Promise<{ id: string }>;
}

// Page /commandes/:id : page serveur, le chargement et l'annulation sont faits par OrderDetail (page client)
export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <p className={styles.backLink}>
          <Link href="/commandes">← Mes commandes</Link>
        </p>
        <OrderDetail id={id} />
      </div>
    </main>
  );
}
