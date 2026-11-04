import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import type { IFeaturedTree } from "../../@types";
import { TreesFilters } from "./TreesFilters";
import { AddToCartButton } from "./AddToCartButton";
import { api } from "../utils/apiCall";

const categories = [
  { id: 0, name: "Tous nos arbres" },
  { id: 1, name: "Résineux" },
  { id: 2, name: "Feuillage caduc" },
  { id: 3, name: "Feuillage persistant" },
];

interface TreesPageProps {
  searchParams: Promise<{ categorie?: string; recherche?: string }>;
}

export default async function TreesPage({ searchParams }: TreesPageProps) {
  const { categorie, recherche } = await searchParams;
  const selectedCategory = categories.some((c) => String(c.id) === categorie)
    ? Number(categorie)
    : 0;
  // Le texte cherché, sans les espaces au début et à la fin ("" si rien)
  const searchText = typeof recherche === "string" ? recherche.trim() : "";

  let trees: IFeaturedTree[] = [];
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
    const response: IFeaturedTree[] = await api<IFeaturedTree, IFeaturedTree[]>(
      endpoint,
    );
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
          searchText={searchText}
        />

        <section className={styles.results} aria-label="Liste des arbres">
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
              <Link href="/arbres">Voir tous nos arbres</Link>
            </div>
          )}

          {!error && trees.length > 0 && (
            <ul className={styles.treeGrid}>
              {trees.map((tree) => (
                <li className={styles.treeCard} key={tree.id}>
                  <div className={styles.treeImage}>
                    <Link
                      href={`/arbres/${tree.id}`}
                      className={styles.treeImageLink}
                      aria-label={`Voir la fiche de ${tree.name}`}
                    >
                      {tree.photoUrl && (
                        <Image
                          src={tree.photoUrl}
                          alt={tree.name}
                          fill
                          sizes="(max-width: 699px) 100vw, (max-width: 999px) 50vw, 30vw"
                        />
                      )}
                    </Link>
                  </div>

                  <div className={styles.treeInfo}>
                    <h2 className={styles.treeName}>
                      <Link
                        href={`/arbres/${tree.id}`}
                        className={styles.treeNameLink}
                      >
                        {tree.name}
                      </Link>
                    </h2>

                    <p className={styles.treeCategory}>{tree.categoryName}</p>

                    <p className={styles.treeLocation}>
                      <Image
                        src="/assets/localisation.svg"
                        alt=""
                        width={22}
                        height={22}
                      />{" "}
                      <span
                        aria-hidden="true"
                        className={styles.locationIcon}
                      />
                      {tree.plantingLocation}
                    </p>

                    <div className={styles.priceAndCart}>
                      <p className={styles.treePrice}>{tree.price}€ TTC</p>

                      <AddToCartButton treeId={tree.id} treeName={tree.name} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
