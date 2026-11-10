import type { Metadata } from "next";
import { AdminGuard } from "./AdminGuard";

export const metadata: Metadata = {
  // titre par défaut de l'onglet : chaque page admin peut donner le sien
  title: "Administration",
  // pages privées : les moteurs de recherche ne les indexent pas
  robots: { index: false },
};

// Entoure automatiquement toutes les pages de app/admin/ (catalogue, commandes, comptes)
// layout serveur pour les metadata ; la vérification du rôle se fait dans AdminGuard (client)
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
