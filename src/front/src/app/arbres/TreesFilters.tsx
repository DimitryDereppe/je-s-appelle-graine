"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import type { ICategory } from "../../@types";

interface TreesFiltersProps {
  categories: ICategory[];
  selectedCategory: number;
  locations: string[];
  selectedLocation: string; // "" = tous les lieux
  searchText: string; // la recherche en cours, pour ne pas la perdre
}

export function TreesFilters({
  categories,
  selectedCategory,
  locations,
  selectedLocation,
  searchText,
}: TreesFiltersProps) {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Reconstruit l'URL avec les 3 filtres : celui qui change prend sa nouvelle
  // valeur, les autres gardent la valeur actuelle (sinon ils seraient perdus)
  function updateFilters(changes: { category?: number; location?: string }) {
    setIsFilterOpen(false);

    // ?? et pas || : 0 (« Tous nos arbres ») et "" (« Tous les lieux ») sont de vrais choix
    const category = changes.category ?? selectedCategory;
    const location = changes.location ?? selectedLocation;

    const params = new URLSearchParams();

    if (category !== 0) {
      params.set("categorie", String(category));
    }

    // On recopie la recherche en cours, sinon elle serait perdue
    if (searchText !== "") {
      params.set("recherche", searchText);
    }

    if (location !== "") {
      params.set("lieu", location);
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
          isFilterOpen ? "Masquer les filtres" : "Afficher les filtres"
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
                onChange={() => updateFilters({ category: category.id })}
              />
              <span>{category.name}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className={styles.categoryFilters}>
          <legend>Lieux de plantation</legend>

          {/* "" : la valeur qui veut dire « pas de filtre » */}
          {["", ...locations].map((location) => (
            <label className={styles.categoryOption} key={location || "tous"}>
              <input
                type="radio"
                name="location"
                value={location}
                checked={selectedLocation === location}
                onChange={() => updateFilters({ location })}
              />
              <span>{location || "Tous les lieux"}</span>
            </label>
          ))}
        </fieldset>
      </aside>
    </>
  );
}
