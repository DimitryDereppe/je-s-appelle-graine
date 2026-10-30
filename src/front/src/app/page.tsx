import Image from "next/image";
import styles from "./Home.module.css";
import { Tree, Feature } from "./typeHome";

const features: Feature[] = [
  {
    id: 1,
    title: "Des arbres sélectionnés",
    icon: "/assets/arbres-selectionnes.png",
  },
  {
    id: 2,
    title: "Une plantation demain",
    icon: "/assets/projets-plantation.png",
  },
  {
    id: 3,
    title: "Un suivi transparent",
    icon: "/assets/suivi-transparent.png",
  },
];

export default async function Home() {
  const res = await fetch(`${process.env.API_URL}/api/trees`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Erreur HTTP ${res.status}`);
  }
  const treesAll: Tree[] = await res.json();
  const trees = [];
  for (let i = 0; i < 3; i++) {
    trees.push(treesAll[i]);
  }

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
            <span className={styles.underline}>une</span> forêt demain.
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
            src="/images/trees/pin-maritime.webp"
            alt="Arbre"
            className={styles.heroImg}
            fill
            sizes="(min-width: 600px) 45vw, 100vw"
          />
        </div>
      </section>

      {/* Section Homepage */}
      <section className={styles.homepage}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.underline}>Les</span> arbres du moment
        </h2>{" "}
        <div className={styles.cardsGrid}>
          {trees.map((tree) => (
            <article key={tree.id} className={styles.card}>
              <div className={styles.cardImage}>
                <Image
                  src={tree.photoUrl}
                  alt={tree.name}
                  className={styles.cardImg}
                  fill
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{tree.name}</h3>
                  <p className={styles.cardScientific}>{tree.scientific}</p>
                  <p className={styles.cardLocation}>
                    <span className={styles.locationIcon}>
                      <Image
                        src={"/assets/localisation.svg"}
                        alt=""
                        className={styles.badgeIcon}
                        width={18}
                        height={18}
                      />
                    </span>{" "}
                    <span className={styles.cardScientific}>
                      {tree.plantingLocation}
                    </span>
                  </p>
                </div>
                <div className={styles.cardActions}>
                  <div className={styles.cardFooter}>
                    <p className={styles.cardPrice}>{tree.price} TTC</p>
                    <button
                      className={styles.basketButton}
                      type="button"
                      aria-label={`Ajouter ${tree.name} au panier`}
                    >
                      <Image
                        src={"/assets/panier.svg"}
                        alt=""
                        className={styles.badgeIcon}
                        width={24}
                        height={24}
                      />
                    </button>
                  </div>
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
            <Image
              src={f.icon}
              alt=""
              className={styles.badgeIcon}
              width={24}
              height={24}
            />
            <p className={styles.badgeText}>{f.title}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
