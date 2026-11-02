import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main>
      <section>
        <h1>Connexion</h1>
        <p>Connectez-vous pour continuer votre achat.</p>

        <LoginForm />

        <p>Vous n’avez pas encore de compte ?</p>
        <Link href="/inscription">Créer un compte</Link>
      </section>
    </main>
  );
}
