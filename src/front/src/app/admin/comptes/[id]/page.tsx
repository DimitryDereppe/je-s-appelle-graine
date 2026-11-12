import type { Metadata } from "next";
import Link from "next/link";
import { AccountDetail } from "./AccountDetail";
import styles from "../../commandes/page.module.css";

export const metadata: Metadata = {
  title: "Détail d'un compte — Administration",
  description:
    "Le détail d'un compte, la gestion de son état et sa suppression.",
};

// Next.js lit [id] dans l'URL (/admin/comptes/6 → "6") et AccountDetail
interface AccountPageProps {
  params: Promise<{ id: string }>;
}

// Page /admin/commandes/:id : page serveur, le chargement est fait par AdminOrderDetail (composant client)
// <main> et le menu viennent de app/admin/layout.tsx : on ne renvoie que le contenu, dans un fragment
export default async function AccountPage({ params }: AccountPageProps) {
  const { id } = await params;

  return (
    <>
      <p className={styles.AccountDetail}>
        <Link href="/admin/comptes">← Tous les comptes</Link>
      </p>
      <AccountDetail id={id} />
    </>
  );
}
