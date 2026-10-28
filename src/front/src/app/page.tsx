import Image from "next/image";
import styles from "./Home.module.css";
import { Tree, Feature } from "./typeHome";

const trees: Tree[] = [
  {
    id: 1,
    name: "Chêne pédonculé",
    scientific: "Quercus robur",
    price: "12 €",
  },
  {
    id: 2,
    name: "Pin sylvestre",
    scientific: "Pinus sylvestris",
    price: "9 €",
  },
  {
    id: 3,
    name: "Chêne champêtre",
    scientific: "Quercus pubescens",
    price: "11 €",
  },
];

const features: Feature[] = [
  { id: 1, title: "Des arbres sélectionnés" },
  { id: 2, title: "Une plantation demain" },
  { id: 3, title: "Un suivi transparent" },
];

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Section Welcome */}
      <section className={styles.welcome}>
        <div className={styles.welcomeContent}>
          <p className={styles.welcomeTagline}>
            PLANTER AUJOURD&apos;HUI, PRESERVER DEMAIN
          </p>
          <h1 className={styles.welcomeTitle}>
            Un arbre aujourd&apos;hui,
            <br />
            une forêt demain.
          </h1>
          <p className={styles.welcomeSubtitle}>
            Choisissez les arbres qui contribuent aux projets de reforestation.
          </p>
          <button className={styles.ctaButton} type="button">
            Voir nos arbres <span className={styles.arrow}>→</span>
          </button>
        </div>

        <div className={styles.heroImage}>
          <Image
            src="/images/pin-maritime.webp"
            alt="Arbre"
            className={styles.heroImg}
            fill
            sizes="(min-width: 600px) 45vw, 100vw"
          />
        </div>
      </section>

      {/* Section Homepage */}
      <section className={styles.homepage}>
        <h2 className={styles.sectionTitle}>Les arbres du moment</h2>
        <div className={styles.cardsGrid}>
          {trees.map((tree) => (
            <article key={tree.id} className={styles.card}>
              <div className={styles.cardImage}>
                <Image
                  src="/images/pin-maritime.webp"
                  alt={tree.name}
                  className={styles.cardImg}
                  fill
                />
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{tree.name}</h3>
                <p className={styles.cardScientific}>{tree.scientific}</p>
                <p className={styles.cardLocation}>
                  <span className={styles.locationIcon}>📍</span> Localisation
                </p>
                <div className={styles.cardFooter}>
                  <p className={styles.cardPrice}>{tree.price}</p>
                  <button
                    className={styles.basketButton}
                    type="button"
                    aria-label={`Ajouter ${tree.name} au panier`}
                  >
                    🛒
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Badges – en bas de page */}
      <div className={styles.badges}>
        {features.map((f) => (
          <div key={f.id} className={styles.badge}>
            <p className={styles.badgeText}>{f.title}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
