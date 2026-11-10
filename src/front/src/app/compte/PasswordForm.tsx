"use client";

import { useState } from "react";
import { clientApi } from "../utils/clientApi";
import styles from "./page.module.css";

// Changer son mot de passe : PATCH /api/users/me/password
export function PasswordForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleChangePassword(formData: FormData) {
    setErrorMessage("");
    setSuccessMessage("");

    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");

    // même règle que l'API : on prévient avant l'envoi
    if (newPassword.length < 12) {
      setErrorMessage("Le mot de passe doit contenir au moins 12 caractères.");
      document.getElementById("newPassword")?.focus();
      return;
    }

    try {
      const response = await clientApi("users/me/password", "PATCH", {
        currentPassword,
        newPassword,
      });

      // 400 : mot de passe actuel faux ou nouveau trop court → message de l'API
      if (response.status === 400) {
        const apiMessage: { error?: string } = await response.json();
        setErrorMessage(
          apiMessage.error ?? "Le mot de passe n’a pas pu être changé.",
        );
        document.getElementById("currentPassword")?.focus();
        return;
      }
      if (!response.ok) {
        setErrorMessage("Quelque chose n’a pas fonctionné.");
        return;
      }

      // 204 : réussi, sans contenu ; React vide les champs après l'envoi
      setSuccessMessage("Votre mot de passe a été changé.");
    } catch {
      setErrorMessage("Une erreur est survenue.");
    }
  }

  return (
    <form className={styles.form} action={handleChangePassword}>
      <div className={styles.field}>
        <label htmlFor="currentPassword">Mot de passe actuel *</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="newPassword">Nouveau mot de passe *</label>
        {/* aria-describedby : la consigne est lue avec le champ */}
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          aria-describedby="newPassword-hint"
          required
        />
        <span id="newPassword-hint" className={styles.hint}>
          12 caractères minimum
        </span>
      </div>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className={styles.success} role="status">
          {successMessage}
        </p>
      )}

      <button className={styles.submitButton} type="submit">
        Changer le mot de passe
      </button>
    </form>
  );
}
