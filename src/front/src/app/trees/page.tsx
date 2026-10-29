"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Tree = {
  id: number;
  name: string;
  price: string;
  photo_url: string;
  planting_location: string;
  category_id: number;
  availability_id: number;
};

const categories = [
  { id: 0, name: "Tous nos arbres" },
  { id: 1, name: "Résineux" },
  { id: 2, name: "Feuillage caduc" },
  { id: 3, name: "Feuillage persistant" },
];

/* Associe les forêts présentes dans les données aux régions à afficher. */
const forestRegions: Record<string, string> = {
  "Forêt de Brocéliande": "Bretagne",
  "Monts d'Arrée": "Bretagne",
  "Forêt des Landes de Gascogne": "Nouvelle-Aquitaine",
  "Massif des Corbières": "Occitanie",
  "Massif des Maures": "Provence-Alpes-Côte d’Azur",
  "Massif du Jura": "Bourgogne-Franche-Comté",
};

function getCategoryName(categoryId: number): string {
  return (
    categories.find((category) => category.id === categoryId)?.name ?? "Arbre"
  );
}

function getLocationLabel(location: string): string {
  const forestName = location.split(" — ")[0].trim();
  const region = forestRegions[forestName];

  return region ? `${forestName}, ${region}` : forestName;
}

function formatPrice(price: string): string {
  const amount = Number(price);

  if (Number.isNaN(amount)) {
    return `${price}€ TTC`;
  }

  return `${amount.toFixed(2).replace(".", ",")}€ TTC`;
}

export default function TreesPage() {
  const router = useRouter();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState("");
  const [addingTreeId, setAddingTreeId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTrees() {
      setIsLoading(true);
      setError(null);

      try {
        const query =
          selectedCategory === 0 ? "" : `?category=${selectedCategory}`;

        const response = await fetch(`/api/trees${query}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Impossible de charger les arbres pour le moment.");
        }

        const result: Tree[] = await response.json();
        setTrees(result);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name !== "AbortError") {
          setError(fetchError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchTrees();

    return () => controller.abort();
  }, [selectedCategory]);

  async function handleAddToCart(treeId: number) {
    setAddingTreeId(treeId);
    setCartMessage("");

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tree_id: treeId, quantity: 1 }),
      });

      if (response.status === 401 || response.status === 403) {
        router.push("/connexion?next=/trees");
        return;
      }

      if (!response.ok) {
        throw new Error("L’ajout au panier n’a pas fonctionné.");
      }

      setCartMessage("L’arbre a été ajouté au panier.");
    } catch (addError) {
      setCartMessage(
        addError instanceof Error
          ? addError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setAddingTreeId(null);
    }
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
            {!isLoading && !error && (
              <p className={styles.treeCount}>
                {trees.length} {trees.length > 1 ? "arbres" : "arbre"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.catalogueLayout}>
        <button
          className={styles.filterToggle}
          type="button"
          aria-label={
            isFilterOpen
              ? "Masquer les filtres par catégorie"
              : "Afficher les filtres par catégorie"
          }
          aria-expanded={isFilterOpen}
          aria-controls="tree-filters"
          onClick={() => setIsFilterOpen((open) => !open)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path d="M4 5h16l-6.5 7.2V19l-3-1.5v-5.3L4 5Z" />
          </svg>
        </button>

        <aside
          id="tree-filters"
          className={`${styles.filters} ${isFilterOpen ? styles.filtersOpen : ""}`}
          aria-label="Filtres du catalogue"
        >
          <fieldset className={styles.categoryFilters}>
            <legend>Catégories</legend>

            {categories.map((category) => (
              <label className={styles.categoryOption} key={category.id}>
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={selectedCategory === category.id}
                  onChange={() => {
                    setSelectedCategory(category.id);
                    setIsFilterOpen(false);
                  }}
                />
                <span>{category.name}</span>
              </label>
            ))}
          </fieldset>
        </aside>

        <section className={styles.results} aria-label="Liste des arbres">
          {isLoading && <p role="status">Chargement des arbres…</p>}

          {error && (
            <p className={styles.errorMessage} role="alert">
              {error}
            </p>
          )}

          {!isLoading && !error && trees.length === 0 && (
            <p>Aucun arbre n’est disponible dans cette catégorie.</p>
          )}

          {!isLoading && !error && trees.length > 0 && (
            <ul className={styles.treeGrid}>
              {trees.map((tree) => (
                <li className={styles.treeCard} key={tree.id}>
                  <div className={styles.treeImage}>
                    <Image
                      src={tree.photo_url}
                      alt={tree.name}
                      fill
                      sizes="(max-width: 699px) 100vw, (max-width: 1099px) 50vw, 30vw"
                    />
                  </div>

                  <div className={styles.treeInfo}>
                    <h2 className={styles.treeName}>{tree.name}</h2>
                    <p className={styles.treeCategory}>
                      {getCategoryName(tree.category_id)}
                    </p>
                    <p className={styles.treeLocation}>
                      {/* TODO : remplacer ce repère par le pictogramme de localisation. */}
                      <span
                        aria-hidden="true"
                        className={styles.locationIcon}
                      />
                      {getLocationLabel(tree.planting_location)}
                    </p>

                    <div className={styles.priceAndCart}>
                      <p className={styles.treePrice}>
                        {formatPrice(tree.price)}
                      </p>

                      <button
                        className={styles.addToCart}
                        type="button"
                        aria-label={`Ajouter ${tree.name} au panier`}
                        disabled={addingTreeId === tree.id}
                        onClick={() => handleAddToCart(tree.id)}
                      >
                        {/* Remplacer le chemin par celui du pictogramme utilisé dans le Header. */}
                        <Image
                          src="/images/cart.svg"
                          alt=""
                          width={22}
                          height={22}
                        />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className={styles.cartMessage} role="status" aria-live="polite">
            {cartMessage}
          </p>
        </section>
      </div>
    </main>
  );
}
