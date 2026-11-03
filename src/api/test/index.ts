import axios, { AxiosInstance } from "axios";
import { pool } from "../src/data/db-client.ts";

const apiBaseUrl = `http://localhost:${process.env.PORT}/api/`;

// Axios requester -> objet axios pour envoyer mes requetes de test
export const requester: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  validateStatus: () => true, // résout les Promise de réponse des requetes
});

// --------------------------------
// définition d'un arbre de test : seul le nom est obligatoire, le reste a une valeur par défaut
interface ITestTree {
  name: string;
  description?: string | null;
  price?: number;
  photoUrl?: string | null;
  plantingLocation?: string | null;
  category?: string;
  // seulement les 3 valeurs possible de la table availability
  availability?: "disponible" | "en rupture de stock" | "retiré";
}

// --------------------------------
// crée un arbre complet dans la BDD à partir d'un ITestTree et retourne son id
// les champs non précisés prennent leur valeur par défaut
// --------------------------------
export async function createTree(tree: ITestTree): Promise<number> {
  const {
    name,
    description = null,
    price = 10,
    photoUrl = null,
    plantingLocation = null,
    category = "Feuillage caduc",
    availability = "disponible",
  } = tree;

  // la catégorie et la disponibilité sont créées si elles n'existent pas encore :
  // - ON CONFLICT (name) : si ce nom existe déjà (colonne UNIQUE), l'INSERT échouerait…
  // - DO UPDATE SET name = $1 : … on « met à jour » la ligne existante avec la même valeur (rien ne change)
  // - RETURNING id : renvoie l'id de la ligne créée OU existante (sans le DO UPDATE, rien ne serait renvoyé)
  const categoryResult = await pool.query(
    "INSERT INTO category (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id",
    [category],
  );
  const availabilityResult = await pool.query(
    "INSERT INTO availability (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id",
    [availability],
  );

  const treeResult = await pool.query(
    `INSERT INTO tree (name, description, price, photo_url, planting_location, category_id, availability_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      name,
      description,
      price,
      photoUrl,
      plantingLocation,
      categoryResult.rows[0].id,
      availabilityResult.rows[0].id,
    ],
  );

  return treeResult.rows[0].id;
}

// --------------------------------
// retourne l'id d'une catégorie déjà créée par createTree
// --------------------------------
export async function getCategoryId(name: string): Promise<number> {
  const result = await pool.query("SELECT id FROM category WHERE name = $1", [
    name,
  ]);
  return result.rows[0].id;
}
