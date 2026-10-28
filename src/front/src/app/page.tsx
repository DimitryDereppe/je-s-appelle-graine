import styles from "./Home.module.css";
import { Tree, Feature, Achievement } from "./typeHome";
import Image from "next/image";

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

const achievements: Achievement[] = [
  { id: 1, title: "Plantation collective", subtitle: "Restaurer les forêts" },
  { id: 2, title: "Suivi de plantation", subtitle: "Suivi de vos plantations" },
  {
    id: 3,
    title: "Projet de reforestation",
    subtitle: "Zone de reforestation",
  },
];

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Section Welcome */}
      <section className={styles.welcome}>
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

        {/* Photo hero */}
        <div className={styles.heroImage}>
          <Image
            src="/images/pin-maritime.webp"
            alt="Arbre"
            className={styles.heroImg}
            width={500}
            height={500}
          />
        </div>
      </section>

      {/* Section Homepage */}
      <section className={styles.homepage}>
        <h2 className={styles.sectionTitle}>Nos arbres les plus recherchés</h2>
        <div className={styles.cardsGrid}>
          {trees.map((tree) => (
            <article key={tree.id} className={styles.card}>
              <div className={styles.cardImage}>
                <Image
                  src="/images/pin-maritime.webp"
                  alt={tree.name}
                  className={styles.cardImg}
                  width={500}
                  height={500}
                />
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{tree.name}</h3>
                <p className={styles.cardScientific}>{tree.scientific}</p>
                <p className={styles.cardPrice}>{tree.price}</p>
                <button
                  className={styles.basketButton}
                  type="button"
                  disabled
                  aria-label={`Ajouter ${tree.name} au panier`}
                >
                  🛒 Ajouter au panier
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Nos réalisations */}
        <h2 className={styles.sectionTitle}>Nos réalisations</h2>
        <div className={styles.achievementsGrid}>
          {achievements.map((a) => (
            <article key={a.id} className={styles.achievementCard}>
              <div className={styles.achievementImage}>
                <Image
                  src="/images/pin-maritime.webp"
                  alt={a.title}
                  className={styles.achievementImg}
                  width={500}
                  height={500}
                />
              </div>
              <div className={styles.achievementBody}>
                <h3 className={styles.achievementTitle}>{a.title}</h3>
                <p className={styles.achievementSubtitle}>{a.subtitle}</p>
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
