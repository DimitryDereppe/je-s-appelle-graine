import { pool } from "../data/db-client.ts";
import type {
  ITree,
  IFeaturedTree,
  ICatalogueTree,
} from "../@types/index.d.ts";

export const treeDatamapper = {
  // accueil : les 3 derniers arbres disponibles, le plus récent en premier
  async findFeatured(): Promise<IFeaturedTree[]> {
    // Requête SQL écrite entre backticks (template literal) pour pouvoir
    // l'écrire sur plusieurs lignes et la garder lisible.
    const sqlQuery = `
            -- Seulement les colonnes utiles à la carte d'accueil, préfixées par
            -- "tree." (availability a aussi des colonnes id et name : sans préfixe,
            -- PostgreSQL ne saurait pas laquelle prendre).
            -- CAST(... AS FLOAT) : le prix arrive en nombre (9.9) et plus en texte ("9.90")
            -- AS "photoUrl" : guillemets obligatoires, sinon PostgreSQL renvoie "photourl"
            SELECT tree.id, tree.name, CAST(tree.price AS FLOAT) AS price,
                   tree.photo_url AS "photoUrl",
                   tree.planting_location AS "plantingLocation",
                   category.name AS "categoryName"
            FROM tree
            -- On y associe leur catégorie (clé étrangère tree.category_id → category.id)
            JOIN category ON tree.category_id = category.id
            -- On y associe leur statut de disponibilité
            -- (clé étrangère tree.availability_id → availability.id)
            JOIN availability ON tree.availability_id = availability.id
            -- On ne garde que les arbres en vente
            WHERE availability.name = 'disponible'
            -- Du plus récent au plus ancien (id le plus grand en premier)
            ORDER BY tree.id DESC
            -- On n'en garde que 3
            LIMIT 3
        `;
    // pool.query envoie la requête à PostgreSQL ; "await" attend la réponse
    const result = await pool.query(sqlQuery);
    // result.rows contient les lignes renvoyées, sous forme de tableau d'objets
    return result.rows;
  },

  // catalogue : tous les arbres sauf "les retirés"
  async findAllCatalog(
    categoryId?: number,
    name?: string,
    location?: string,
  ): Promise<ICatalogueTree[]> {
    // Colonnes listées une par une pour pouvoir convertir le prix :
    // PostgreSQL stocke price en NUMERIC, que pg renvoie en texte ("9.90") ;
    // CAST(... AS FLOAT) le transforme en nombre (9.9), comme annoncé dans ICatalogueTree.
    // Colonnes préfixées par "tree." : availability a aussi des colonnes id et name,
    // sans préfixe PostgreSQL ne saurait pas laquelle prendre (erreur "ambiguous").
    const sqlQuery = `
      SELECT tree.id, tree.name, CAST(tree.price AS FLOAT) AS price,
             tree.photo_url AS "photoUrl", tree.planting_location AS "plantingLocation",
             category.name AS "categoryName", availability.name AS "availabilityName"
      FROM tree
      -- à chaque arbre, on colle sa catégorie et sa disponibilité (pour lire leur nom)
      JOIN category ON tree.category_id = category.id
      JOIN availability ON tree.availability_id = availability.id
      -- <> veut dire « différent de » : on écarte les arbres retirés
      WHERE availability.name <> 'retiré'
      -- filtre facultatif : si $1 vaut NULL, la condition est toujours vraie
      -- CAST : sans lui, PostgreSQL ne peut pas deviner le type d'un paramètre NULL
      AND (CAST($1 AS INT) IS NULL OR tree.category_id = $1)
      -- même principe pour le nom : ILIKE ignore les majuscules,
      -- unaccent (des deux côtés) ignore les accents
      AND (
        CAST($2 AS TEXT) IS NULL
        OR unaccent(tree.name) ILIKE unaccent('%' || $2 || '%')
      )
      -- même principe pour le lieu : comparaison exacte, la valeur vient de la liste du filtre
      AND (CAST($3 AS TEXT) IS NULL OR tree.planting_location = $3)
      ORDER BY tree.id;
    `;

    // % _ et \ ont un sens spécial pour ILIKE : on les échappe pour les chercher tels quels
    const escapedName = name ? name.replace(/[\\%_]/g, "\\$&") : null;
    const result = await pool.query(sqlQuery, [
      categoryId ?? null,
      escapedName,
      location ?? null,
    ]);
    return result.rows;
  },

  // filtre du catalogue : chaque lieu de plantation une seule fois, par ordre alphabétique
  async findLocations(): Promise<string[]> {
    const sqlQuery = `
      SELECT DISTINCT tree.planting_location AS "location"
      FROM tree
      JOIN availability ON tree.availability_id = availability.id
      -- mêmes arbres que le catalogue : un lieu qui n'a que des arbres retirés
      -- donnerait une liste vide une fois choisi
      WHERE availability.name <> 'retiré'
      -- la colonne accepte NULL (01-schema.sql) : un lieu vide n'a rien à faire dans la liste
      AND tree.planting_location IS NOT NULL
      ORDER BY "location";
    `;
    const result = await pool.query(sqlQuery);
    // [{ location: "Forêt…" }, …] → ["Forêt…", …] : le front n'a besoin que des textes
    return result.rows.map((row: { location: string }) => row.location);
  },

  // fiche : un arbre selon son id, ou undefined s'il n'existe pas
  async findById(id: number): Promise<ITree | undefined> {
    const sqlQuery = `
            SELECT tree.id, tree.name, tree.description, CAST(tree.price AS FLOAT) AS price,
                   tree.photo_url AS "photoUrl", tree.planting_location AS "plantingLocation",
                   category.name AS "categoryName", availability.name AS "availabilityName"
            FROM tree
            -- à chaque arbre, on colle sa catégorie et sa disponibilité (pour lire leur nom)
            JOIN category ON tree.category_id = category.id
            -- availability.name sert au contrôleur : un arbre retiré donne 404
            JOIN availability ON tree.availability_id = availability.id
            -- une seule ligne : celle dont l'id vaut $1
            WHERE tree.id = $1
        `;
    const result = await pool.query(sqlQuery, [id]);
    // aucune ligne trouvée : rows est vide, rows[0] vaut undefined
    return result.rows[0];
  },
};
