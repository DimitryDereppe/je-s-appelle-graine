import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import type { ICatalogueTree } from "../../../@types";
import { api } from "../../utils/apiCall";
import { AddToCartButton } from "./AddToCartButton";

interface TreeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TreeDetailPage({ params }: TreeDetailPageProps) {
  const { slug } = await params;

  let tree: ICatalogueTree | null = null;
  let error: string | null = null;

  try {
    const response = await api<ICatalogueTree, ICatalogueTree>(
      `trees/?slug=${slug}`
    );
    if (!response) {
      throw new Error("Arbre introuvable.");
    }
    tree = response;
  } catch (fetchError) {
    error =
      fetchError instanceof Error
        ? fetchError.message
        : "Impossible de charger cet arbre pour le moment.";
  }

  if (error || !tree) {
    return (
      <main className={styles.page}>
        <p className={styles.error}>{error ?? "Arbre introuvable."}</p>
        <Link href="/trees" className={styles.backLink}>
          ← Retour à Nos arbres
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
        <ol>
          <li>
            <Link href="/">Accueil</Link>
          </li>
          <li>
            <Link href="/trees">Nos arbres</Link>
          </li>
          <li aria-current="page">{tree.name}</li>
        </ol>
      </nav>

      <Link href="/trees" className={styles.backLink}>
        ← Retour à Nos arbres
      </Link>

      <article className={styles.treeDetail}>
        <div className={styles.imageColumn}>
          <Image
            src={tree.image || "/images/default-tree.jpg"}
            alt={`Feuillage de ${tree.name}`}
            width={600}
            height={600}
            className={styles.treeImage}
            priority
          />
        </div>

        <div className={styles.infoColumn}>
          <span className={styles.categoryBadge}>
            {tree.category?.toUpperCase()}
          </span>

          <h1 className={styles.title}>{tree.name}</h1>

          <p className={styles.price}>
            {tree.price.toFixed(2).replace(".", ",")} € TTC
          </p>

          <p className={styles.description}>{tree.description}</p>

          {tree.origin && (
            <p className={styles.origin}>{tree.origin}</p>
          )}

          <AddToCartButton treeId={tree.id} price={tree.price} />
        </div>
      </article>
    </main>
  );
}   