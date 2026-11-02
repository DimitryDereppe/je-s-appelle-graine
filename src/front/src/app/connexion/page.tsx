import Link from "next/link";
import { LoginForm } from "./LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <main>
      <section>
        <h1>Connexion</h1>
        <p>Connectez-vous pour continuer votre achat.</p>

        <LoginForm next={next} />

        <p>Vous n’avez pas encore de compte ?</p>
        <Link href="/inscription">Créer un compte</Link>
      </section>
    </main>
  );
}
