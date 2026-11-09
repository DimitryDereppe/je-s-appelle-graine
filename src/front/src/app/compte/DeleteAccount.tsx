"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientApi } from "../utils/clientApi";
import styles from "./page.module.css";

// Supprimer son compte : DELETE /api/users/me (le cookie est effacé par l'API)
export function DeleteAccount() {
  const [errorMessage, setErrorMessage] = useState("");
  // désactive le bouton pendant l'envoi : évite un double clic
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer votre compte ? Vous ne pourrez plus consulter vos commandes. Cette action est définitive.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      const response = await clientApi("users/me", "DELETE");

      // 409 : dernier administrateur → message de l'API
      if (!response.ok) {
        const data: { error?: string } = await response.json();
        setErrorMessage(data.error ?? "La suppression n’a pas fonctionné.");
        return;
      }

      // 204 : compte supprimé et déconnecté ; l'en-tête se met à jour en changeant de page
      router.push("/");
    } catch {
      setErrorMessage("Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <p className={styles.subtitle}>
        Vos informations personnelles seront effacées et vous ne pourrez plus
        consulter vos commandes, même en créant un nouveau compte.
      </p>
      <p className={styles.subtitle}>
        Elles restent enregistrées par l’association pour la comptabilité.
      </p>

      <button
        type="button"
        className={styles.dangerButton}
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "Suppression…" : "Supprimer mon compte"}
      </button>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
    </>
  );
}
