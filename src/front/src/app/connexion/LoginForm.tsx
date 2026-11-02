"use client";

function handleLogin(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    return;
  }
  // Provisoire : l'appel à POST /api/auth arrive à l'étape 4.
  // Le mot de passe n'est jamais écrit dans les logs.
  console.log("Connexion demandée pour :", email);
}

export function LoginForm() {
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

      <button type="submit">Se connecter</button>
    </form>
  );
}
