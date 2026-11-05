import Image from "next/image";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <p className={styles.tagline}>OUPS, CETTE PAGE N&apos;EXISTE PAS</p>

        <div className={styles.heroImage}>
          <Image
            src="/assets/404.png"
            alt="zone déboisée"
            className={styles.heroImg}
            fill
          />
        </div>
      </section>
    </main>
  );
}
