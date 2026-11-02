export function LoginForm() {
  return (
    <form>
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
