"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IAdminAccount } from "@/@types";
import { clientApi } from "@/app/utils/clientApi";
// styles de la page admin des commandes (F8) : mêmes classes (filter, actions…)
import styles from "../../../commandes/page.module.css";

interface AccountStatusFormProps {
  id: string; // id du compte, lu dans l'URL par page.tsx
}

// Formulaire pour activer ou désactiver un compte (PATCH /api/admin/users/:id)
export function AccountStatusForm({ id }: AccountStatusFormProps) {
  // null tant que le compte n'est pas chargé
  const [account, setAccount] = useState<IAdminAccount | null>(null);
  // erreur de chargement : remplace tout le formulaire
  const [errorMessage, setErrorMessage] = useState("");
  // le choix de la liste déroulante (pas encore enregistré tant qu'on n'a pas cliqué sur Enregistrer)
  const [isActive, setIsActive] = useState(true);
  // message de l'enregistrement (ex. refus 409), affiché sous le formulaire
  const [saveMessage, setSaveMessage] = useState("");
  // true pendant l'envoi du PATCH : le bouton est grisé (évite un double clic)
  const [isSaving, setIsSaving] = useState(false);
  // pour changer de page depuis le code (retour au détail après l'enregistrement)
  const router = useRouter();

  // chargement du compte une fois la page affichée dans le navigateur (qui envoie le cookie)
  useEffect(() => {
    // useEffect ne peut pas être async : on déclare une fonction async, appelée juste après
    async function loadAccount() {
      try {
        const response = await clientApi(`admin/users/${id}`);

        // 404 : aucun compte avec cet id ; 400 : id invalide (ex. /admin/comptes/abc/modifier)
        if (response.status === 404 || response.status === 400) {
          setErrorMessage("Compte introuvable.");
          return;
        }
        // autre erreur de l'API (ex. 500)
        if (!response.ok) {
          setErrorMessage("Quelque chose n’a pas fonctionné.");
          return;
        }

        // rangé dans data : on s'en sert deux fois (et response.json() ne se lit qu'une fois)
        const data: IAdminAccount = await response.json();
        setAccount(data);
        // la liste déroulante affiche au départ l'état enregistré en base
        setIsActive(data.isActive);
      } catch {
        // l'API n'a pas répondu : sans ce message, le chargement durerait toujours
        setErrorMessage("Une erreur est survenue.");
      }
    }

    loadAccount();
    // [id] : si l'id de l'adresse change, on recharge le bon compte
  }, [id]);

  // À l'envoi du formulaire (bouton Enregistrer ou touche Entrée)
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // empêche le navigateur de recharger toute la page : c'est clientApi qui envoie
    event.preventDefault();

    setIsSaving(true);
    // efface le message d'un essai précédent
    setSaveMessage("");

    try {
      // { isActive } = { isActive: isActive } → corps envoyé : {"isActive": true} ou false
      const response = await clientApi(`admin/users/${id}`, "PATCH", {
        isActive,
      });

      // 409 : dernier administrateur actif → on affiche le message de l'API
      if (response.status === 409) {
        const data = await response.json();
        setSaveMessage(data.error);
        return;
      }

      // autre erreur de l'API (ex. 404 : compte supprimé entre-temps, 500)
      if (!response.ok) {
        setSaveMessage("L’enregistrement n’a pas fonctionné.");
        return;
      }

      // 200 : enregistré → retour au détail du compte
      router.push(`/admin/comptes/${id}`);
    } catch {
      // l'API n'a pas répondu (réseau, serveur arrêté)
      setSaveMessage("Une erreur est survenue.");
    } finally {
      // dans tous les cas : le bouton redevient cliquable
      setIsSaving(false);
    }
  }

  // ----------------------------------------------------------------------
  // un seul affichage à la fois : erreur, chargement ou formulaire
  // ----------------------------------------------------------------------

  if (errorMessage) {
    return (
      <>
        <h1 className={styles.title}>Gérer l’état du compte</h1>
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      </>
    );
  }

  // null : la réponse de l'API n'est pas encore arrivée
  if (!account) {
    return (
      <>
        <h1 className={styles.title}>Gérer l’état du compte</h1>
        <p className={styles.subtitle}>Chargement du compte…</p>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.title}>Gérer l’état du compte</h1>
      {/* le nom et l'email : pour savoir quel compte on modifie */}
      <p className={styles.subtitle}>
        {account.firstname} {account.lastname} — {account.email}
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.filter}>
          {/* htmlFor = id du select : le lecteur d'écran lit « État du compte » ; un clic sur le texte ouvre la liste */}
          <label htmlFor="account-status">État du compte</label>
          <select
            id="account-status"
            // un <select> ne contient que du texte : on traduit le booléen en "active" / "inactive"
            value={isActive ? "active" : "inactive"}
            // au changement, on met seulement l'état à jour : rien n'est envoyé avant Enregistrer
            onChange={(event) => setIsActive(event.target.value === "active")}
          >
            <option value="active">Actif</option>
            <option value="inactive">Désactivé</option>
          </select>
        </div>

        <div className={styles.actions}>
          {/* type="submit" : déclenche onSubmit du formulaire (clic ou touche Entrée) */}
          <button
            type="submit"
            className={styles.actionButton}
            disabled={isSaving}
          >
            Enregistrer
          </button>
        </div>
      </form>

      {/* refus de l'enregistrement (ex. 409 dernier admin) : le formulaire reste affiché */}
      {saveMessage && (
        <p className={styles.error} role="alert">
          {saveMessage}
        </p>
      )}
    </>
  );
}
