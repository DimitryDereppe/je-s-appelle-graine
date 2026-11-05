"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import type { ICategory } from "../../@types";

interface TreesFiltersProps {
  categories: ICategory[];
  selectedCategory: number;
  searchText: string; // la recherche en cours, pour ne pas la perdre
}

export function TreesFilters({
  categories,
  selectedCategory,
  searchText,
}: TreesFiltersProps) {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  function handleCategoryChange(categoryId: number) {
    setIsFilterOpen(false);

    // On reconstruit l'URL avec les DEUX filtres
    const params = new URLSearchParams();

    if (categoryId !== 0) {
      params.set("categorie", String(categoryId));
    }

    // On recopie la recherche en cours, sinon elle serait perdue
    if (searchText !== "") {
      params.set("recherche", searchText);
    }

    const query = params.toString();
    router.push(query ? `/arbres?${query}` : "/arbres");
  }

  return (
    <>
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
                onChange={() => handleCategoryChange(category.id)}
              />
              <span>{category.name}</span>
            </label>
          ))}
        </fieldset>
      </aside>
    </>
  );
}
