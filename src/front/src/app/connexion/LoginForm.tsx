"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

interface LoginFormProps {
  next?: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function handleLogin(formData: FormData) {
    setErrorMessage("");
    const email = formData.get("email");
    const password = formData.get("password");
    if (typeof email !== "string" || typeof password !== "string") {
      setErrorMessage("Adresse e-mail et mot de passe requis.");
      return;
    }
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 401) {
        setErrorMessage("Adresse e-mail ou mot de passe incorrect.");
        return;
      }
      if (response.status === 403) {
        setErrorMessage("Compte bloqué. Veuillez contacter l’administrateur.");
        return;
      }
      if (!response.ok) {
        setErrorMessage("Quelque chose n’a pas fonctionné.");
        return;
      }
      // Connexion réussie : où renvoyer l'utilisateur ? Deux cas, testés dans l'ordre.

      // 1. Une page a demandé la connexion et donné son adresse dans l'URL,
      //    ex. AddToCartButton → /connexion?next=/arbres/12 (page.tsx lit ?next= et le passe ici).
      //    On y retourne, mais seulement si c'est une adresse du site (sécurité) :
      //    - startsWith("/")     : chemin interne, ex. "/arbres" → accepté
      //    - !startsWith("//")   : "//autre-site.fr" serait lu par le navigateur comme un autre site
      //    - !startsWith("/\\")  : "/\autre-site.fr" aussi (certains navigateurs changent \ en /)
      //    "https://..." ne commence pas par "/" → refusé.
      //    Sans ces tests, un lien piégé /connexion?next=https://site-pirate.fr enverrait
      //    l'utilisateur, tout juste connecté, vers un faux site (redirection ouverte).
      if (
        next !== undefined &&
        next.startsWith("/") &&
        !next.startsWith("//") &&
        !next.startsWith("/\\")
      ) {
        // push : ajoute la page à l'historique, comme un clic sur un lien
        router.push(next);
      } else {
        // 2. Pas de ?next= valide : on envoie vers l'accueil.
        //    (Pas de router.back() : après une inscription, la page précédente serait /inscription.)
        router.push("/");
      }
    } catch {
      setErrorMessage("Une erreur est survenue.");
    }
  }

  return (
    <form className={styles.form} action={handleLogin}>
      <p className={styles.requiredNote}>* (champs obligatoires)</p>

      <label className={styles.label} htmlFor="email">
        Adresse e-mail *
      </label>
      <input
        className={styles.input}
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="exemple@adresse.fr"
        required
      />

      <label className={styles.label} htmlFor="password">
        Mot de passe *
      </label>
      <input
        className={styles.input}
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      <button className={styles.submit} type="submit">
        Se connecter
      </button>
    </form>
  );
}
