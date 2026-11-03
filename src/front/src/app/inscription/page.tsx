"use client";

import Image from "next/image";
import RegisterForm from "./RegisterForm";
import styles from "./page.module.css";

export default function RegisterPage() {
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
            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
