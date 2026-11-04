import Link from "next/link";
import Image from "next/image";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <p className={styles.tagline}>OUPS, CETTE PAGE N&apos;EXISTE PAS</p>

        <h1 className={styles.title}>
          <span className={styles.underline}>Erreur</span> 404
        </h1>

        <p className={styles.subtitle}>
          La page que vous cherchez n&apos;existe pas dans notre forêt.
        </p>

        <Link href="/arbres">
          <button className={styles.ctaButton} type="button">
            Retour à nos arbres <span className={styles.arrow}>→</span>
          </button>
        </Link>

        <Link href="/">
          <button className={styles.secondaryButton} type="button">
            Revenir à l&apos;accueil
          </button>
        </Link>

        <div className={styles.heroImage}>
          <Image
            src="/assets/acceuil.png"
            alt="Pin maritime"
            className={styles.heroImg}
            fill
            sizes="(min-width: 600px) 45vw, 100vw"
          />
        </div>
      </section>
    </main>
  );
}
