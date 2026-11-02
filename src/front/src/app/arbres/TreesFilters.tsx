"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface TreesFiltersProps {
  categories: { id: number; name: string }[];
  selectedCategory: number;
}

export function TreesFilters({
  categories,
  selectedCategory,
}: TreesFiltersProps) {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  function handleCategoryChange(categoryId: number) {
    setIsFilterOpen(false);
    router.push(categoryId === 0 ? "/trees" : `/trees?category=${categoryId}`);
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
