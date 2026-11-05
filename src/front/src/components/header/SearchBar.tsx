"use client";

import { usePathname, useSearchParams } from "next/navigation";
import styles from "./header.module.css";

export default function SearchBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // On lit l'URL : /arbres?recherche=chene&categorie=1
  const recherche = searchParams.get("recherche") ?? "";
  const categorie = searchParams.get("categorie");

  // On garde la catégorie seulement si on est déjà sur le catalogue
  const keepCategory = pathname === "/arbres" && categorie !== null;

  return (
    <form action="/arbres" method="get" role="search" className={styles.search}>
      <label htmlFor="recherche" className={styles.visuallyHidden}>
        Rechercher un arbre
      </label>
      <input
        key={recherche}
        className={styles.searchInput}
        id="recherche"
        name="recherche"
        type="search"
        placeholder="Rechercher un arbre"
        maxLength={100}
        defaultValue={recherche}
      />
      {keepCategory && (
        <input type="hidden" name="categorie" value={categorie} />
      )}
      <button type="submit" className={styles.searchButton}>
        Rechercher
      </button>
    </form>
  );
}
