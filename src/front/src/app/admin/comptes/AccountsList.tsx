"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import Link from "next/link";
import { useEffect, useState } from "react";
import type { IAdminAccount } from "@/@types";
import { clientApi } from "@/app/utils/clientApi";
// mêmes styles que la liste admin des commandes (F8) : list, card…
import styles from "../commandes/page.module.css";

// Liste de tous les comptes, pour l'admin (GET /api/admin/users)
export function AccountsList() {
  // null tant que la liste n'est pas chargée ([] = aucun compte)
  const [accounts, setAccounts] = useState<IAdminAccount[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // chargement une fois la page affichée dans le navigateur (qui envoie le cookie)
  useEffect(() => {
    // useEffect ne peut pas être async : on déclare une fonction async, appelée juste après
    async function loadAccounts() {
      try {
        const response = await clientApi("admin/users");

        // autre erreur de l'API (ex. 500) : fetch a réussi, mais la réponse est une erreur
        if (!response.ok) {
          setErrorMessage("Quelque chose n’a pas fonctionné.");
          return;
        }
        setAccounts(await response.json());
      } catch {
        // l'API n'a pas répondu (réseau, serveur arrêté) : sans ce message, le chargement durerait toujours
        setErrorMessage("Une erreur est survenue.");
      }
    }
    loadAccounts();

    // dépendances = ce que l'effet utilise et qui vient du composant ;
    // [] vide : l'effet ne se lance qu'une fois
  }, []);

  // ----------------------------------------------------------------------
  // un seul affichage à la fois : erreur, chargement, liste vide ou liste
  // ----------------------------------------------------------------------

  // erreur
  if (errorMessage) {
    return (
      <p className={styles.error} role="alert">
        {errorMessage}
      </p>
    );
  }

  // Chargement
  if (!accounts) {
    // null : la réponse de l'API n'est pas encore arrivée
    return <p className={styles.subtitle}>Chargement des comptes…</p>;
  }
  // liste vide :  un message plutôt qu'une page blanche
  if (accounts.length === 0) {
    return <p className={styles.subtitle}>Aucun compte.</p>;
  }

  // Liste : une carte par compte, entièrement cliquable vers le détail (comme les commandes)
  return (
    <ul className={styles.list}>
      {accounts.map((account) => (
        // key : identifiant unique, React s'en sert pour suivre chaque élément de la liste
        <li key={account.id}>
          {/* carte sur 2 colonnes : nom et état, puis email et rôle */}
          <Link href={`/admin/comptes/${account.id}`} className={styles.card}>
            <span className={styles.reference}>
              {account.firstname} {account.lastname}
            </span>
            {/* booléen → texte ; « Désactivé » en terracotta, mais écrit en toutes lettres */}
            {account.isActive ? (
              <span className={styles.status}>Actif</span>
            ) : (
              <span className={styles.late}>Désactivé</span>
            )}
            <span className={styles.date}>{account.email}</span>
            <span className={styles.status}>{account.role}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
