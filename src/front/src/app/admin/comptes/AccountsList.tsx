"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import Link from "next/link";
import { useEffect, useState } from "react";
import type { IAdminAccount } from "@/@types";
import { clientApi } from "@/app/utils/clientApi";
import styles from "../page.module.css";

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

  // Liste : un tableau, une ligne par compte ; le nom mène au détail
  return (
    <table>
      {/* le titre du tableau, lu en premier par les lecteurs d'écran */}
      <caption>Liste des comptes</caption>

      {/* les titres des colonnes, écrits une seule fois */}
      <thead>
        <tr>
          {/* scope="col" : le lecteur d'écran sait que c'est le titre de la colonne */}
          <th scope="col">Nom</th>
          <th scope="col">Email</th>
          <th scope="col">Rôle</th>
          <th scope="col">État</th>
        </tr>
      </thead>

      {/* les données : une ligne <tr> par compte */}
      <tbody>
        {accounts.map((account) => (
          // key : identifiant unique, React s'en sert pour suivre chaque ligne
          <tr key={account.id}>
            <td>
              <Link href={`/admin/comptes/${account.id}`}>
                {account.firstname} {account.lastname}
              </Link>
            </td>
            <td>{account.email}</td>
            <td>{account.role}</td>
            {/* booléen → texte : React n'affiche ni true ni false */}
            <td>{account.isActive ? "Actif" : "Désactivé"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
