import axios, { AxiosInstance, AxiosResponse } from "axios";
import argon2 from "argon2";
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
// définition d'un compte de test : seul l'email est obligatoire, le reste a une valeur par défaut
interface ITestAccount {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  isActive: boolean;
}

export const ALICE: ITestAccount = {
  firstname: "Alice",
  lastname: "TEST",
  email: "alice@test.fr",
  password: "MotDePasse123!",
  role: "customer",
  isActive: true,
};

// --------------------------------
// crée un compte dans la BDD à partir d'un ITestAccount et retourne son id
// le mot de passe est haché en Argon2 : login le compare avec argon2.verify
// --------------------------------
export async function createAccount(account: ITestAccount): Promise<number> {
  // le rôle est créé s'il n'existe pas encore (même principe que la catégorie dans createTree)
  const roleResult = await pool.query(
    "INSERT INTO role (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id",
    [account.role],
  );

  // mot de passe haché comme à l'inscription : login le compare avec argon2.verify
  const hashedPassword = await argon2.hash(account.password);

  const accountResult = await pool.query(
    `INSERT INTO account (email, password, firstname, lastname, is_active, role_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      account.email,
      hashedPassword,
      account.firstname,
      account.lastname,
      account.isActive,
      roleResult.rows[0].id,
    ],
  );

  return accountResult.rows[0].id;
}

// --------------------------------
// Exemple de cookies présents dans une réponse HTTP (dans l'entête de la réponse, tout est sur une seule ligne de texte) :
// set-cookie:
//     accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4OTQ0NzA1OCwiZXhwIjoxNzg5NDUwNjU4fQ.4LFbtgj6USp-xa6xAqGgX4FZsDKMxA_FdazNvhCwImc;
//                 Max-Age=3600; Path=/; Expires=Tue, 15 Sep 2026 05:37:38 GMT; HttpOnly; Secure; SameSite=None,
//     refreshToken=VoCM%2B8oGBjkrpNSXduyUyINytUDT6gwUTywyYZNAjzfkY5r2feuFQ%2By4MWJWoKyxFJpd0e6YxKowrpey%2BU34OvgTxdmOZDRIOYEdFdTwDxLWH2tLWHXm%2F3KC%2FJSrue5TAidakZCWKnaTcYO4KgHTYPzjCrOoBU%2Bq0P2pEHTOI7rRnnYHYFIY0xDmtHND8dkGKTFLbaZ6rRxlzgPTUMSHkdOCI3NkNR2AsUuXr%2FyMTsm6LVYf6SUoTRvpLYznqFD6KLRpdF3meI8G20mu%2BWvUZ3G5IfWbxCs7y6xl4X2uW75nKngb%2BVxx2NXabqo6BHj3mBFGuhBz52BgbpmI5Z1R7Q%3D%3D;
//                  Max-Age=604800; Path=/api/auth/refresh; Expires=Tue, 22 Sep 2026 04:37:38 GMT; HttpOnly; Secure; SameSite=None
// --------------------------------
export function findCookieFromResponse(
  res: AxiosResponse,
  tokenName: string,
): string {
  // récupère tous les cookies de la réponse sous forme de tableau ou un tableau vide
  // chaque case du tableau contient un cookie : un string "<nom>=<valeur>; <options>"
  const cookies: Array<string> = res.headers["set-cookie"] ?? [];

  // retourne tout le cookie : "<nom>=<valeur>; <options>" ou un string vide
  return cookies.find((cookie) => cookie.startsWith(`${tokenName}=`)) ?? "";
}

// --------------------------------
// extraire le token du contenu d'un cookie
// --------------------------------
export function extractTokenFromCookie(
  cookie: string,
  tokenName: string,
): string {
  const regex = new RegExp(`^${tokenName}=([^;]+)(?:;|$)`); // regexp pour extraire le token du cookie
  const encodedToken = cookie.match(regex)?.[1] ?? ""; // extraction du token, string vide si pas trouvé

  // les caractères spéciaux (+, /, =) peuvent être encodés dans le cookie (%2B, %2F, %3D)
  // il faut les décoder avant de retourner le résultat
  return decodeURIComponent(encodedToken);
}

// --------------------------------
// récupère le token d'un cookie d'une réponse Axios
// --------------------------------
export function getTokenFromResponse(
  res: AxiosResponse,
  tokenName: string,
): string {
  const cookie: string = findCookieFromResponse(res, tokenName);

  const token: string = extractTokenFromCookie(cookie, tokenName);

  return token;
}

// --------------------------------
// se connecte par POST /api/auth et retourne "accessToken=<jeton>", à mettre dans l'en-tête Cookie
// ex : requester.get("/users/me", { headers: { Cookie: cookie } })
// --------------------------------
export async function loginAs(account: ITestAccount): Promise<string> {
  const response = await requester.post("/auth", {
    email: account.email,
    password: account.password,
  });
  // on ne garde que "accessToken=<jeton>", sans les options (Path, HttpOnly…)
  return findCookieFromResponse(response, "accessToken").split(";")[0];
}
