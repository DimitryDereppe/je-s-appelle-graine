import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import type { ICatalogueTree, ICategory, IFeaturedTree } from "../../@types";
import { TreesFilters } from "./TreesFilters";
// import { AddToCartButton } from "./AddToCartButton";
import { api } from "../utils/apiCall";
import TreeCard from "@/components/treeCard/TreeCard";

// Titre de l'onglet et description pour les moteurs de recherche
export const metadata: Metadata = {
  title: "Nos arbres | Je s’appelle Graine",
  description:
    "Découvrez les arbres de Je s’appelle Graine : filtrez par catégorie ou recherchez par nom.",
};

// Le bouton radio qui affiche tout le catalogue (ce n'est pas une catégorie de l'API)
const ALL_TREES: ICategory = { id: 0, name: "Tous nos arbres" };

interface TreesPageProps {
  searchParams: Promise<{ categorie?: string; recherche?: string }>;
}

export default async function TreesPage({ searchParams }: TreesPageProps) {
  const { categorie, recherche } = await searchParams;

  let categories: ICategory[] = [ALL_TREES];

  try {
    const response = await api<IFeaturedTree, ICategory[]>("categories");
    categories = [ALL_TREES, ...response];
  } catch {
    // Si pas de catégories, le catalogue reste utilisable : on garde « Tous nos arbres »
  }

  // Une catégorie inconnue dans l'adresse affiche tout le catalogue
  const selectedCategory = categories.some((c) => String(c.id) === categorie)
    ? Number(categorie)
    : 0;
  // Le texte cherché, sans les espaces au début et à la fin ("" si rien)
  const searchText = typeof recherche === "string" ? recherche.trim() : "";

  let trees: ICatalogueTree[] = [];
  let error: string | null = null;

  // On prépare les paramètres à envoyer à l'API (vide pour l'instant)
  const params = new URLSearchParams();

  // Si une vraie catégorie est choisie (pas "Tous"), on l'ajoute : category=1
  if (selectedCategory !== 0) {
    params.set("category", String(selectedCategory));
  }

  // Si l'utilisateur a tapé quelque chose, on l'ajoute : search=chene
  if (searchText !== "") {
    params.set("search", searchText);
  }

  // On transforme les paramètres en texte : ""category=1&search=pin"" ou "" si aucun filtre
  const query = params.toString();

  // Si query n'est pas vide → "trees?category=1", sinon → "trees"
  const endpoint = query ? `trees?${query}` : "trees";

  try {
    const response: ICatalogueTree[] = await api<
      ICatalogueTree,
      ICatalogueTree[]
    >(endpoint);

    trees = response;
  } catch (fetchError) {
    // Le détail technique reste dans les logs : le visiteur voit un message simple
    console.error(fetchError);
    error = "Impossible de charger les arbres pour le moment.";
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
          searchText={searchText}
        />

        <section className={styles.results} aria-labelledby="trees-title">
          {/* Masqué à l'écran : garde l'ordre des titres (h1, h2, puis h3 des cartes) */}
          <h2 id="trees-title" className={styles.visuallyHidden}>
            Liste des arbres
          </h2>

          {error && (
            <p className={styles.errorMessage} role="alert">
              {error}
            </p>
          )}

          {!error && trees.length === 0 && (
            <div role="status">
              <p>
                {searchText !== ""
                  ? `Aucun arbre ne correspond à « ${searchText} ».`
                  : "Aucun arbre n’est disponible dans cette catégorie."}
              </p>
              <Link href="/arbres">Voir tout le catalogue</Link>
            </div>
          )}

          {!error && trees.length > 0 && (
            <ul className={styles.treeGrid}>
              {trees.map((tree) => (
                <li key={tree.id} className={styles.treeItem}>
                  <TreeCard tree={tree} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
