import type { Metadata } from "next";
import { AccountsList } from "./AccountsList";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Comptes",
  description: "La liste des comptes : rôle et état (actif ou désactivé).",
};

// Page /admin/comptes : page serveur, la liste est chargée par AccountsList (client)
export default function AccountsPage() {
  return (
    <>
      <h1 className={styles.title}>Comptes</h1>
      <AccountsList />
    </>
  );
}
