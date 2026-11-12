import type { Metadata } from "next";
import Link from "next/link";
import { AdminOrderDetail } from "./AdminOrderDetail";

export const metadata: Metadata = {
  title: "Détail d’une commande — Administration",
  description:
    "Le détail d’une commande client et le changement de son statut.",
  // page réservée à l'admin : les moteurs de recherche ne l'indexent pas
  robots: { index: false },
};

// Next.js lit [id] dans l'URL (/admin/commandes/12 → "12") et le donne dans params
interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

// Page /admin/commandes/:id : page serveur, le chargement est fait par AdminOrderDetail (composant client)
// <main> et le menu viennent de app/admin/layout.tsx : on ne renvoie que le contenu, dans un fragment
export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;

  return (
    <>
      <p>
        <Link href="/admin/commandes">← Toutes les commandes</Link>
      </p>
      <AdminOrderDetail id={id} />
    </>
  );
}
