import Link from "next/link";
import styles from "./page.module.css";
import type { ICatalogueTree } from "../../@types";
import { TreesFilters } from "./TreesFilters";
// import { AddToCartButton } from "./AddToCartButton";
import { api } from "../utils/apiCall";
import TreeCard from "@/components/treeCard/TreeCard";

const categories = [
  { id: 0, name: "Tous nos arbres" },
  { id: 1, name: "Résineux" },
  { id: 2, name: "Feuillage caduc" },
  { id: 3, name: "Feuillage persistant" },
];

interface TreesPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function TreesPage({ searchParams }: TreesPageProps) {
  const { category } = await searchParams;
  const selectedCategory = categories.some((c) => String(c.id) === category)
    ? Number(category)
    : 0;

  let trees: ICatalogueTree[] = [];
  let error: string | null = null;

  try {
    const response: ICatalogueTree[] = await api<
      ICatalogueTree,
      ICatalogueTree[]
    >("trees/");
    if (!response) {
      throw new Error("Impossible de charger les arbres pour le moment.");
    }

    trees = response;
  } catch (fetchError) {
    error =
      fetchError instanceof Error
        ? fetchError.message
        : "Impossible de charger les arbres pour le moment.";
  }

  return (
    <main className={styles.catalogue}>
      <div className={styles.pageHeader}>
        <p className={styles.desktopFilterTitle}>Filtrer</p>
        <div className={styles.contentHeading}>
          <nav className={styles.breadcrumb} aria-label="Fil d’Ariane">
            <ol>
              <li>
                <Link href="/">Accueil</Link>
              </li>
              <li aria-current="page">Nos arbres</li>
            </ol>
          </nav>

          <div className={styles.titleRow}>
            <h1 className={styles.title}>Nos arbres</h1>
            {!error && (
              <p className={styles.treeCount}>
                {trees.length} {trees.length > 1 ? "arbres" : "arbre"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.catalogueLayout}>
        <TreesFilters
          categories={categories}
          selectedCategory={selectedCategory}
        />

        <section className={styles.results} aria-label="Liste des arbres">
          {error && (
            <p className={styles.errorMessage} role="alert">
              {error}
            </p>
          )}

          {!error && trees.length === 0 && (
            <p>Aucun arbre n’est disponible dans cette catégorie.</p>
          )}

          {!error && trees.length > 0 && (
            <ul className={styles.treeGrid}>
              {trees.map((tree) => (
                <TreeCard key={tree.id} tree={tree} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
