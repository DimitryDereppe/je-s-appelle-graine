import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import styles from "./page.module.css";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous pour commander vos arbres et suivre vos commandes.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  // Adresse de la page inscription, en gardant "next" s'il existe,
  // pour que RegisterForm puisse le renvoyer ensuite vers la connexion.
  const registerUrl = next
    ? `/inscription?next=${encodeURIComponent(next)}`
    : "/inscription";

  return (
    <main className={styles.main}>
      <section className={styles.layout}>
        <div className={styles.content}>
          <p className={styles.tagline}>Votre espace</p>
          <h1 className={styles.title}>Connexion</h1>
          <p className={styles.subtitle}>
            Connectez-vous pour continuer votre achat.
          </p>

          <LoginForm next={next} />

          <p className={styles.signup}>
            Vous n’avez pas encore de compte ?
            <Link className={styles.signupLink} href={registerUrl}>
              Créer un compte
            </Link>
          </p>
        </div>

        <div className={styles.imageWrapper}>
          <Image
            src="/assets/acceuil.png"
            alt="Mains plantant une jeune pousse"
            className={styles.image}
            fill
            sizes="(min-width: 900px) 50vw, 100vw"
          />
        </div>
      </section>
    </main>
  );
}
