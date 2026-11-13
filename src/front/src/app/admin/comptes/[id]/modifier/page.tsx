import type { Metadata } from "next";
import Link from "next/link";
import { AccountStatusForm } from "./AccountStatusForm";
import styles from "../../../commandes/page.module.css";

export const metadata: Metadata = {
  title: "Gérer l'état d'un compte — Administration",
  description: "Activer ou désactiver un compte.",
};

// Next.js lit [id] dans l'URL (/admin/comptes/6/modifier → "6") et le donne dans params
interface AccountStatusPageProps {
  params: Promise<{ id: string }>;
}

// Page /admin/comptes/:id/modifier : page serveur, le formulaire est AccountStatusForm (composant client)
// <main> et le menu viennent de app/admin/layout.tsx : on ne renvoie que le contenu, dans un fragment
export default async function AccountStatusPage({
  params,
}: AccountStatusPageProps) {
  const { id } = await params;

  return (
    <>
      <p className={styles.backLink}>
        <Link href={`/admin/comptes/${id}`}>← Retour au compte</Link>
      </p>
      <AccountStatusForm id={id} />
    </>
  );
}
