"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientApi } from "../utils/clientApi";
import styles from "./page.module.css";

// Supprimer son compte : DELETE /api/users/me (le cookie est effacé par l'API)
export function DeleteAccount() {
  const [errorMessage, setErrorMessage] = useState("");
  // message affiché pendant les 3 secondes avant la redirection
  const [successMessage, setSuccessMessage] = useState("");
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
        const apiMessage: { error?: string } = await response.json();
        setErrorMessage(
          apiMessage.error ?? "La suppression n’a pas fonctionné.",
        );
        return;
      }

      // 204 : compte supprimé et cookie effacé par l'API
      setSuccessMessage(
        "Votre compte a été supprimé. Vous allez être redirigé vers la page de connexion.",
      );
      // setTimeout : attend 3 secondes (3000 ms) pour laisser lire le message, comme à l'inscription ;
      // en changeant de page, l'en-tête redemande qui est connecté et affiche « Connexion »
      setTimeout(() => {
        router.push("/connexion");
      }, 3000);
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
        // désactivé aussi une fois le compte supprimé, pendant les 3 secondes
        disabled={isDeleting || successMessage !== ""}
      >
        {isDeleting ? "Suppression…" : "Supprimer mon compte"}
      </button>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
      {/* role="status" : le lecteur d'écran annonce le message */}
      {successMessage && (
        <p className={styles.success} role="status">
          {successMessage}
        </p>
      )}
    </>
  );
}
