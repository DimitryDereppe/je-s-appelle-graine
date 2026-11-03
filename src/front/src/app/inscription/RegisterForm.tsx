"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

import type { IRegister } from "@/@types";

export default function RegisterForm() {
  const [accountType, setAccountType] =
    useState<IRegister["accountType"]>("particulier");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleRegister(formData: FormData) {
    setErrorMessage("");
    setSuccessMessage("");

    const submittedAccountType = formData.get("accountType");

    if (
      submittedAccountType !== "particulier" &&
      submittedAccountType !== "association" &&
      submittedAccountType !== "entreprise"
    ) {
      setErrorMessage("Veuillez sélectionner un type de compte valide.");
      return;
    }

    const firstname = String(formData.get("firstName") ?? "").trim();
    const lastname = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (password.length < 12) {
      setErrorMessage("Le mot de passe doit contenir au moins 12 caractères.");
      return;
    }

    const organizationName =
      accountType === "particulier"
        ? null
        : String(formData.get("organizationName") ?? "").trim();

    if (accountType !== "particulier" && !organizationName) {
      setErrorMessage("Veuillez renseigner le nom de la structure.");
      return;
    }

    const values: IRegister = {
      firstname,
      lastname,
      accountType: accountType,
      organizationName,
      email,
      // Le mot de passe est envoyé tel que saisi ; l’API se charge de le hacher.
      password,
    };

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.status === 400) {
        const body = (await response.json()) as { error?: string };
        setErrorMessage(
          body.error ?? "Les informations saisies sont invalides.",
        );
        return;
      }
      if (response.status === 409) {
        const body = (await response.json()) as { error?: string };
        setErrorMessage(body.error ?? "Cet email est déjà utilisé.");
        return;
      }

      if (!response.ok) {
        setErrorMessage("Quelque chose n’a pas fonctionné.");
        return;
      }

      if (response.status === 201) {
        setSuccessMessage(
          "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
        );
      }
    } catch {
      setErrorMessage("Une erreur est survenue.");
    }
  }

  return (
    <section className={styles.formSection} aria-labelledby="register-title">
      <h1 className={styles.title} id="register-title">
        Créer un compte
      </h1>

      <p className={styles.introduction}>
        Inscrivez-vous pour ajouter un arbre au panier.
      </p>

      <p className={styles.requiredNote}>
        <span aria-hidden="true">*</span> Champ obligatoire
      </p>

      <form className={styles.form} action={handleRegister}>
        <div className={styles.field}>
          <label htmlFor="firstName">Prénom *</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="lastName">Nom *</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="accountType">Type de compte *</label>
          <select
            id="accountType"
            name="accountType"
            value={accountType}
            onChange={(event) =>
              setAccountType(event.target.value as IRegister["accountType"])
            }
            required
          >
            <option value="particulier">Particulier</option>
            <option value="association">Association</option>
            <option value="entreprise">Entreprise</option>
          </select>
        </div>

        {accountType !== "particulier" && (
          <div className={styles.field}>
            <label htmlFor="organizationName">Nom de la structure *</label>
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              autoComplete="organization"
              placeholder="Nom de l’association ou de l’entreprise"
              required
            />
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="email">Adresse e-mail *</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="exemple@adresse.fr"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Mot de passe *</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>

        {errorMessage && (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className={styles.successMessage} role="status">
            {successMessage}
          </p>
        )}
        <button className={styles.submitButton} type="submit">
          Créer mon compte
        </button>
      </form>
      <p className={styles.loginPrompt}>Déjà inscrit ?</p>
      <Link className={styles.loginLink} href="/connexion">
        Se connecter
      </Link>
    </section>
  );
}
