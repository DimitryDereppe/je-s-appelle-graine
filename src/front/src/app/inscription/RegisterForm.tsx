"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

import type { IRegister } from "@/@types";

interface RegisterFormProps {
  // Page à laquelle revenir après la connexion, transmise par page.tsx
  next?: string;
}

export default function RegisterForm({ next }: RegisterFormProps) {
  const [accountType, setAccountType] =
    useState<IRegister["accountType"]>("particulier");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Adresse de la page connexion, en gardant "next" pour que LoginForm
  // ramène ensuite le visiteur là où il était.
  // Sans "next", on met "/" (l'accueil) : sinon LoginForm ferait
  // router.back() et renverrait le visiteur sur... la page d'inscription.
  const loginUrl = `/connexion?next=${encodeURIComponent(next ?? "/")}`;

  async function handleRegister(formData: FormData) {
    setErrorMessage("");
    setSuccessMessage("");

    const firstname = String(formData.get("firstName") ?? "").trim();
    const lastname = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (password.length < 12) {
      setErrorMessage("Le mot de passe doit contenir au moins 12 caractères.");
      // focus sur le champ à corriger
      document.getElementById("password")?.focus();
      return;
    }

    // (US07) : structure facultative, champ vide → null
    const organizationName =
      accountType === "particulier"
        ? null
        : String(formData.get("organizationName") ?? "").trim() || null;

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

      if (response.status === 400 || response.status === 409) {
        const body = (await response.json()) as { error?: string };
        setErrorMessage(
          body.error ?? "Les informations saisies sont invalides.",
        );
        // 409, l'email est le champ à corriger
        if (response.status === 409) {
          document.getElementById("email")?.focus();
        }
        return;
      }

      if (!response.ok) {
        setErrorMessage("Quelque chose n’a pas fonctionné.");
        return;
      }

      // Ici, la réponse est forcément "ok" (2xx) : le compte est créé.
      setSuccessMessage(
        "Votre compte a été créé. Vous allez être redirigé vers la page de connexion.",
      );

      // Le compte est créé mais le visiteur n'est pas encore connecté :
      // on l'envoie vers la connexion (avec "next") plutôt que vers l'accueil.
      // setTimeout attend 3 secondes (3000 ms) avant de lancer la fonction,
      // pour laisser le temps de lire le message de succès.
      setTimeout(() => {
        router.push(loginUrl);
      }, 3000);
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
            <label htmlFor="organizationName">Nom de la structure </label>
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              autoComplete="organization"
              placeholder="Nom de l’association ou de l’entreprise"
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
            placeholder="12 caractères minimum"
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
        <button
          className={styles.submitButton}
          type="submit"
          // Désactivé une fois le compte créé : évite un 2e envoi
          // (l'API répondrait 409 "email déjà utilisé") pendant les 3 secondes.
          disabled={successMessage !== ""}
        >
          Créer mon compte
        </button>
      </form>
      <p className={styles.loginPrompt}>Déjà inscrit ?</p>
      <Link className={styles.loginLink} href={loginUrl}>
        Se connecter
      </Link>
    </section>
  );
}
