import Image from "next/image";
import styles from "./page.module.css";
import type { ICatalogueTree } from "../@types";
import Commitments from "@/components/commitments/Commitments";
import { api } from "./utils/apiCall";
import Link from "next/link";
import TreeCard from "@/components/treeCard/TreeCard";
import { Suspense } from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Je s’appelle Graine",
  description:
    "Aidez-nous à réparer nos forêts. Les arbres que vous achetez sont plantés dans le lieu que vous avez choisi",
};

async function FeaturedTrees() {
  let trees: ICatalogueTree[] = [];
  let hasError = false;

  try {
    trees = await api<ICatalogueTree[]>("trees/featured/");
  } catch (error) {
    console.error("Échec du chargement des arbres :", error);
    hasError = true;
  }

  if (hasError) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>
          Impossible de charger les arbres pour le moment.
          <br />
          Chercher votre bonheur dans notre{" "}
          <Link href="/arbres" passHref>
            <button type="button" className={styles.buttonError}>
              catalogue
            </button>
          </Link>{" "}
          !
        </p>
      </div>
    );
  }

  if (trees.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyMessage}>
          Aucun arbre n&apos;est disponible pour le moment.
          <br />
          Chercher votre bonheur dans notre{" "}
          <Link href="/arbres" passHref>
            <button className={styles.ctaButton} type="button">
              catalogue <span className={styles.arrow}>→</span>
            </button>
          </Link>{" "}
          !
        </p>
      </div>
    );
  }

  return (
    <div className={styles.cardsGrid}>
      {trees.map((tree) => (
        <TreeCard key={tree.id} tree={tree} />
      ))}
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className={styles.cardsGrid} aria-busy="true">
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.treeCardSkeleton}>
          <div className={styles.skeletonImage} />
          <p>Chargement en cours</p>
          <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
        </div>
      ))}
    </div>
  );
}

export default async function Home() {
  return (
    <main className={styles.main}>
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
          <Link href="/arbres" passHref>
            <button className={styles.ctaButton} type="button">
              Voir nos arbres <span className={styles.arrow}>→</span>
            </button>
          </Link>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/assets/acceuil.png"
            alt="Pin maritime"
            className={styles.heroImg}
            fill
            sizes="(min-width: 600px) 45vw, 100vw"
            // image principale de l'accueil : chargée tout de suite, pas en différé (LCP)
            preload
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
        <Suspense fallback={<CardsSkeleton />}>
          <FeaturedTrees />
        </Suspense>
      </section>
      <div className={styles.commitmentsMobile}>
        <Commitments />
      </div>
    </main>
  );
}
