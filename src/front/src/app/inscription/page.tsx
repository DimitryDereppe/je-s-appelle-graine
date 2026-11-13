import type { Metadata } from "next";
// Pas de "use client" ici : la page reste un composant serveur pour pouvoir
// lire "searchParams" (comme connexion/page.tsx). Le formulaire, lui,
// est déjà un composant client (RegisterForm.tsx).
import Image from "next/image";
import RegisterForm from "./RegisterForm";
import styles from "./page.module.css";

interface RegisterPageProps {
  // Paramètres de l'URL (?next=...), fournis par Next.js sous forme de promesse
  searchParams: Promise<{ next?: string }>;
}

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Créez votre compte pour commander des arbres et suivre leur plantation.",
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  // Page où revenir après la connexion, si on vient d'une page protégée
  const { next } = await searchParams;

  return (
    <main className={styles.main}>
      <section className={styles.layout}>
        {/* Présentation à gauche sur ordinateur */}
        <div className={styles.promo}>
          <p className={styles.tagline}>JE S’APPELLE GRAINE · REFORESTATION</p>

          <h2 className={styles.promoTitle}>
            Un arbre aujourd’hui,
            <br />
            une forêt demain.
          </h2>
          <p className={styles.promoSubtitle}>
            Créez votre compte pour ajouter des arbres&nbsp; au panier et
            confirmer votre commande.
          </p>
          <div className={styles.imageWrapper}>
            <Image
              src="/assets/acceuil.png"
              alt="Des mains plantent une jeune pousse"
              className={styles.image}
              fill
              sizes="(min-width: 900px) 50vw, 100vw"
            />
          </div>
        </div>

        {/* Titre, texte et formulaire à droite */}
        <div className={styles.formPanel}>
          <div className={styles.formContent}>
            {/* On transmet "next" au formulaire pour qu'il le garde jusqu'à la connexion */}
            <RegisterForm next={next} />
          </div>
        </div>
      </section>
    </main>
  );
}
