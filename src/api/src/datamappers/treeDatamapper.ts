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
            WHERE availability.name = 'available'
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
  async findAllCatalog(): Promise<ICatalogueTree[]> {
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
            WHERE availability.name <> 'withdrawn'
            -- du plus petit id au plus grand (ordre d'ajout au catalogue)
            ORDER BY tree.id;
        `;
    const result = await pool.query(sqlQuery);
    return result.rows;
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
