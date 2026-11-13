import type { Metadata } from "next";
import Link from "next/link";
import { OrderConfirmation } from "./OrderConfirmation";
import styles from "./page.module.css";

// comme app/arbres/[id]/page.tsx : Next.js lit [id] dans l'URL et le donne dans params
interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

// Page serveur : elle récupère l'id dans l'URL, puis laisse un composant client
// charger la commande (le navigateur envoie le cookie de connexion, le serveur Next non)
export const metadata: Metadata = {
  title: "Commande confirmée",
  // page privée : les moteurs de recherche ne l'indexent pas
  robots: { index: false },
};

export default async function ConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { id } = await params;

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <p className={styles.tagline}>Commande · étape 3 sur 3</p>

        {/* le titre est dans OrderConfirmation : il change si la commande est introuvable */}
        <OrderConfirmation id={id} />

        <p className={styles.back}>
          <Link href="/arbres">Revenir aux arbres</Link>
        </p>
      </div>
    </main>
  );
}
