"use client";

import { useState } from "react";

export function LoginForm() {
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(formData: FormData) {
    setErrorMessage("");
    const email = formData.get("email");
    const password = formData.get("password");
    if (typeof email !== "string" || typeof password !== "string") {
      setErrorMessage("Adresse e-mail et mot de passe requis.");
      return;
    }
    console.log("Connexion demandée pour :", email);
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
        throw new Error("Quelque chose n’a pas fonctionné.");
        return;
      }
      console.log("Connecté");
    } catch {
      setErrorMessage("Une erreur est survenue.");
    }
  }

  return (
    <form action={handleLogin}>
      <p>* Champ obligatoire</p>

      <label htmlFor="email">Adresse e-mail *</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="exemple@adresse.fr"
        required
      />

      <label htmlFor="password">Mot de passe *</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {errorMessage && <p role="alert">{errorMessage}</p>}

      <button type="submit">Se connecter</button>
    </form>
  );
}
