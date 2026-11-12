"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { IAdminAccount } from "@/@types";
import { clientApi } from "@/app/utils/clientApi";
// styles de la page admin des commandes (F8) : mêmes classes (summary, actions…)
import styles from "../../commandes/page.module.css";

interface AccountDetailProps {
  id: string; // id du compte, lu dans l'URL par page.tsx
}

// Détail d'un compte pour l'admin (GET /api/admin/users/:id)
export function AccountDetail({ id }: AccountDetailProps) {
  // null tant que le compte n'est pas chargé
  const [account, setAccount] = useState<IAdminAccount | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // message de la suppression (ex. refus 409), affiché sous le compte
  const [deleteMessage, setDeleteMessage] = useState("");
  // true pendant l'envoi du DELETE : le bouton est grisé (évite un double clic)
  const [isDeleting, setIsDeleting] = useState(false);
  // pour changer de page depuis le code (retour à la liste après la suppression)
  const router = useRouter();

  // chargement du compte une fois la page affichée dans le navigateur (qui envoie le cookie)
  useEffect(() => {
    // useEffect ne peut pas être async : on déclare une fonction async, appelée juste après
    async function loadAccount() {
      try {
        const response = await clientApi(`admin/users/${id}`);

        // 404 : aucun compte avec cet id ; 400 : id invalide (ex. /admin/comptes/abc)
        if (response.status === 404 || response.status === 400) {
          setErrorMessage("Compte introuvable.");
          return;
        }
        // autre erreur de l'API (ex. 500) : fetch a réussi, mais la réponse est une erreur
        if (!response.ok) {
          setErrorMessage("Quelque chose n’a pas fonctionné.");
          return;
        }

        setAccount(await response.json());
      } catch {
        // l'API n'a pas répondu (réseau, serveur arrêté) : sans ce message, le chargement durerait toujours
        setErrorMessage("Une erreur est survenue.");
      }
    }

    loadAccount();
    // [id] : si l'id de l'adresse change, on recharge le bon compte
  }, [id]);

  // Au clic sur « Supprimer le compte » (DELETE /api/admin/users/:id)
  async function handleDelete() {
    // le compte n'est pas encore chargé : rien à supprimer
    if (!account) {
      return;
    }

    // fenêtre OK / Annuler du navigateur : la suppression est définitive
    if (
      !window.confirm(
        `Supprimer le compte de ${account.firstname} ${account.lastname} ? Cette action est définitive.`,
      )
    ) {
      return;
    }
    // bouton grisé pendant l'envoi, et on efface le message d'un essai précédent
    setIsDeleting(true);
    setDeleteMessage("");

    try {
      const response = await clientApi(`admin/users/${id}`, "DELETE");

      // 409 : dernier administrateur → on affiche le message de l'API
      if (response.status === 409) {
        const data = await response.json();
        setDeleteMessage(data.error);
        return;
      }

      // autre erreur de l'API (ex. 404 : compte déjà supprimé, 500)
      if (!response.ok) {
        setDeleteMessage("La suppression n’a pas fonctionné.");
        return;
      }

      // 204 : supprimé → retour à la liste
      router.push("/admin/comptes");
    } catch {
      // l'API n'a pas répondu (réseau, serveur arrêté)
      setDeleteMessage("Une erreur est survenue.");
    } finally {
      // dans tous les cas : le bouton redevient cliquable
      setIsDeleting(false);
    }
  }

  // ----------------------------------------------------------------------
  // un seul affichage à la fois : erreur, chargement ou détail
  // ----------------------------------------------------------------------

  // erreur : titre neutre, puisqu'on ne sait pas si le compte existe
  if (errorMessage) {
    return (
      <>
        <h1 className={styles.title}>Détail du compte</h1>
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
        <h1 className={styles.title}>Détail du compte</h1>
        <p className={styles.subtitle}>Chargement du compte…</p>
      </>
    );
  }

  return (
    <>
      {/* le nom du compte sert de titre à la page */}
      <h1 className={styles.title}>
        {account.firstname} {account.lastname}
      </h1>

      {/* dl : une liste « intitulé → valeur », lue comme telle par les lecteurs d'écran */}
      <dl className={styles.summary}>
        <dt>Email</dt>
        <dd>{account.email}</dd>

        <dt>Adresse</dt>
        {/* ?? : si l'adresse vaut null, on affiche le texte de droite */}
        <dd>{account.address ?? "Non renseignée"}</dd>

        <dt>Type de compte</dt>
        <dd>{account.accountType}</dd>

        {/* && : la structure n'est affichée que si elle existe (association, entreprise) */}
        {account.organizationName && (
          <>
            <dt>Structure</dt>
            <dd>{account.organizationName}</dd>
          </>
        )}

        <dt>Rôle</dt>
        <dd>{account.role}</dd>

        <dt>État</dt>
        {/* écrit en toutes lettres, comme dans la liste */}
        <dd>{account.isActive ? "Actif" : "Désactivé"}</dd>
      </dl>

      {/* les actions de l'admin sur ce compte */}
      <div className={styles.actions}>
        <Link
          href={`/admin/comptes/${id}/modifier`}
          className={styles.actionButton}
        >
          {" "}
          Gérer l’état du comptes
        </Link>

        {/* destructif : en terracotta, comme « Annuler la commande » (F8) */}
        <button
          type="button"
          className={styles.cancelButton}
          onClick={handleDelete}
          disabled={isDeleting}
        >
          Supprimer le compte
        </button>
      </div>
      {/* refus de la suppression (ex. 409 dernier admin) : le compte reste affiché */}
      {deleteMessage && (
        <p className={styles.error} role="alert">
          {deleteMessage}
        </p>
      )}
    </>
  );
}
