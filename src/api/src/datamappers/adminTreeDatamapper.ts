import { pool } from "../data/db-client.ts";
import type {
  IAdminTree,
  IAvailability,
  ITreeInput,
} from "../@types/index.d.ts";

export const adminTreeDatamapper = {
  // Récupère tous les arbres, y compris ceux dont la disponibilité est « retiré ».
  // Les noms de catégorie et de disponibilité viennent des tables associées.
  async findAll(): Promise<IAdminTree[]> {
    const sqlQuery = `
      SELECT
        tree.id,
        tree.name,
        tree.description,
        CAST(tree.price AS FLOAT) AS price,
        tree.photo_url AS "photoUrl",
        tree.planting_location AS "plantingLocation",
        tree.category_id AS "categoryId",
        tree.availability_id AS "availabilityId",
        category.name AS "categoryName",
        availability.name AS "availabilityName"
      FROM tree
      JOIN category ON tree.category_id = category.id
      JOIN availability ON tree.availability_id = availability.id
      ORDER BY tree.name;
    `;

    const result = await pool.query(sqlQuery);
    return result.rows as IAdminTree[];
  },

  // Récupère un arbre par son identifiant, avec ses identifiants de catégorie
  // et de disponibilité. Renvoie undefined si l'arbre n'existe pas.
  async findById(id: number): Promise<IAdminTree | undefined> {
    const sqlQuery = `
      SELECT
        tree.id,
        tree.name,
        tree.description,
        CAST(tree.price AS FLOAT) AS price,
        tree.photo_url AS "photoUrl",
        tree.planting_location AS "plantingLocation",
        tree.category_id AS "categoryId",
        tree.availability_id AS "availabilityId",
        category.name AS "categoryName",
        availability.name AS "availabilityName"
      FROM tree
      JOIN category ON tree.category_id = category.id
      JOIN availability ON tree.availability_id = availability.id
      WHERE tree.id = $1;
    `;

    const result = await pool.query(sqlQuery, [id]);
    return result.rows[0];
  },
  // Insère un arbre et renvoie l'identifiant attribué par PostgreSQL.
  async create(tree: ITreeInput): Promise<number> {
    const sqlQuery = `
    INSERT INTO tree (
      name,
      description,
      price,
      photo_url,
      planting_location,
      category_id,
      availability_id)

-- Les $1 à $7 seront remplacés par les valeurs du tableau envoyé à pool.query, dans le même ordre.

      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id;
    `;
    // Chaque valeur correspond au placeholder de même numéro dans la requête.
    const values = [
      tree.name,
      tree.description,
      tree.price,
      tree.photoUrl,
      tree.plantingLocation,
      tree.categoryId,
      tree.availabilityId,
    ];

    // Exécute la requête en associant chaque valeur aux placeholders $1 à $7.
    const result = await pool.query(sqlQuery, values);
    // PostgreSQL renvoie l'id créé grâce à RETURNING id.
    return result.rows[0].id as number;
  },

  async update(id: number, tree: ITreeInput): Promise<number | undefined> {
    // Met à jour les sept champs de l'arbre et renvoie son id.
    // Renvoie undefined si aucun arbre ne correspond à l'id.
    const sqlQuery = `
        UPDATE tree
        -- Remplace les champs de l'arbre avec les valeurs $1 à $7.
    SET
      name = $1,
      description = $2,
      price = $3,
      photo_url = $4,
      planting_location = $5,
      category_id = $6,
      availability_id = $7
    
   -- Modifie uniquement l'arbre dont l'id correspond à la valeur $8.
           WHERE id = $8
          RETURNING id;
        `;
    // Les sept premières valeurs remplissent les champs ; la dernière cible l'id.
    const values = [
      tree.name,
      tree.description,
      tree.price,
      tree.photoUrl,
      tree.plantingLocation,
      tree.categoryId,
      tree.availabilityId,
      id,
    ];
    const result = await pool.query(sqlQuery, values);

    const updatedTree = result.rows[0];

    if (!updatedTree) {
      return undefined;
    }

    // Sinon, on renvoie l'id de l'arbre modifié.
    return updatedTree.id as number;
  },
  // Supprime un arbre par son Id

  async deleteById(id: number): Promise<number | undefined> {
    const sqlQuery = `
            DELETE FROM tree
            WHERE id = $1
            RETURNING id;
`;
    // Envoie la requête à la base avec l'id de l'arbre à supprimer.
    const result = await pool.query(sqlQuery, [id]);

    // Si la base n'a supprimé aucun arbre, cet id n'existe pas.
    const deletedTree = result.rows[0];

    if (!deletedTree) {
      return undefined;
    }
    // Sinon, renvoie l'id de l'arbre supprimé.
    return deletedTree.id as number;
  },
  // Vérifie si l'arbre a déjà été commandé.
  async hasOrders(id: number): Promise<boolean> {
    const sqlQuery = `
      SELECT EXISTS (
      SELECT 1 
      FROM purchase_line
      WHERE tree_id =$1)
      AS "hasOrders";
      `;
    // Exécute la requête en lui transmettant l'id de l'arbre à vérifier.
    const result = await pool.query(sqlQuery, [id]);
    return result.rows[0].hasOrders as boolean;
  },

  // Vérifie si la catégorie existe dans la base.

  async categoryExists(id: number): Promise<boolean> {
    const sqlQuery = `
      SELECT EXISTS (
      SELECT 1 
      FROM category
      WHERE id =$1)
      AS "categoryExists";
      `;
    // Exécute la requête en lui transmettant l'id de la catégorie à vérifier.
    const result = await pool.query(sqlQuery, [id]);
    return result.rows[0].categoryExists as boolean;
  },
  // Vérifie si la disponibilité existe dans la base.
  async availabilityExists(id: number): Promise<boolean> {
    const sqlQuery = `
    SELECT EXISTS (
      SELECT 1
      FROM availability
      WHERE id = $1
    ) AS "availabilityExists";
  `;

    // Envoie l'id de la disponibilité à vérifier.
    const result = await pool.query(sqlQuery, [id]);

    // Renvoie true si la disponibilité existe, sinon false.
    return result.rows[0].availabilityExists as boolean;
  },

  async findAllAvailabilities(): Promise<IAvailability[]> {
    const sqlQuery = `
        SELECT
        id,
        name
        FROM availability
        ORDER BY id
      `;
    const result = await pool.query(sqlQuery);
    return result.rows as IAvailability[];
  },
};
