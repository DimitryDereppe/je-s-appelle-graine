import Image from "next/image";
import styles from "./Home.module.css";
import type { IFeaturedTree } from "./typeHome";
import Commitments from "@/components/commitments/Commitments";
import { getAllTrees } from "./utils/apiCall";

export const dynamic = "force-dynamic";

export default async function Home() {
  const treesAll: IFeaturedTree[] = await getAllTrees();
  const trees = treesAll.slice(0, 3);

  return (
    <main className={styles.main}>
      {/* Section de présentation */}
      <section className={styles.welcome}>
        <div className={styles.welcomeContent}>
          <p className={styles.welcomeTagline}>
            PLANTER AUJOURD&apos;HUI, PRÉSERVER DEMAIN
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
            src="/assets/acceuil.png"
            alt="Pin maritime"
            className={styles.heroImg}
            fill
            sizes="(min-width: 600px) 45vw, 100vw"
          />
        </div>
      </section>
      <div className={styles.commitmentsDesktop}>
        <Commitments />
      </div>
      <section className={styles.homepage}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.underline}>Les</span> arbres du moment
        </h2>
        <div className={styles.cardsGrid}>
          {trees.map((tree) => (
            <article key={tree.id} className={styles.card}>
              <div className={styles.cardImage}>
                {tree.photoUrl && (
                  <Image
                    src={tree.photoUrl}
                    alt={tree.name}
                    className={styles.cardImg}
                    fill
                    sizes="(min-width: 600px) 30vw, 90vw"
                  />
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>
                    {tree.name} -{" "}
                    <span className={styles.cardScientific}>
                      {tree.availabilityName}
                    </span>
                  </h3>
                  <p className={styles.cardScientific}>{tree.categoryName}</p>
                  <p className={styles.cardLocation}>
                    <span className={styles.locationIcon}>
                      <Image
                        src="/assets/localisation.svg"
                        alt=""
                        className={styles.badgeIcon}
                        width={18}
                        height={18}
                      />
                    </span>

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
                        src="/assets/panier.svg"
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
      {/* Bandeau affiché juste avant le footer sur écran mobile */}
      <div className={styles.commitmentsMobile}>
        <Commitments />
      </div>
    </main>
  );
}
