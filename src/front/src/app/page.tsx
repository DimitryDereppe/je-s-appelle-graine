import Image from "next/image";
import styles from "./page.module.css";
import type { IFeaturedTree } from "../@types";
import Commitments from "@/components/commitments/Commitments";
import { getAllTrees } from "./utils/apiCall";
import TreeCard from "@/components/treeCard/TreeCard";

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
            <TreeCard key={tree.id} tree={tree} />
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
