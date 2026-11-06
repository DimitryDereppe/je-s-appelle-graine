import { pool } from "../data/db-client.ts";
import type {
  IAccount,
  IAccountLogin,
  IAccountProfile,
  INewAccount,
  IUpdateProfile,
} from "../@types/index.d.ts";
export const accountDatamapper = {
  async findByEmail(email: string): Promise<IAccountLogin | undefined> {
    const sqlQuery = `
            SELECT account.id, account.firstname, account.lastname, 
                   account.email, account.account_type AS "accountType",
                   account.organization_name AS "organizationName", account.password,
                   account.is_active AS "isActive", role.name AS "role"
            FROM account

            -- à chaque utilisateur, on colle son role
            JOIN role ON account.role_id = role.id

            -- une seule ligne : celle dont l'email vaut $1
            WHERE account.email = $1
        `;
    const result = await pool.query(sqlQuery, [email]);
    // aucune ligne trouvée : rows est vide, rows[0] vaut undefined
    return result.rows[0];
  },

  async createAccount(account: INewAccount): Promise<IAccount> {
    const sqlQuery = `
            INSERT INTO account
              (firstname, lastname, email, password,
               account_type, organization_name, role_id)
            VALUES
              ($1, $2, $3, $4, $5, $6,
               -- l'id du rôle 'customer', retrouvé par son nom
               (SELECT id FROM role WHERE name = 'customer'))

            -- renvoie la ligne créée, sans le mot de passe
            RETURNING id, firstname, lastname, email,
                      account_type AS "accountType",
                      organization_name AS "organizationName",
                      'customer' AS "role"
        `;
    const result = await pool.query(sqlQuery, [
      account.firstname,
      account.lastname,
      account.email,
      account.password,
      account.accountType,
      account.organizationName,
    ]);
    // une seule ligne insérée : rows[0]
    return result.rows[0];
  },

  // le compte connecté selon son id, sans mot de passe (GET /api/users/me)
  async findById(id: number): Promise<IAccountProfile | undefined> {
    const sqlQuery = `
            SELECT account.id, account.firstname, account.lastname, account.email,
                   account.address,
                   account.account_type AS "accountType",
                   account.organization_name AS "organizationName",
                   account.is_active AS "isActive",
                   role.name AS "role"
            FROM account
            -- à chaque compte, on colle son rôle (pour lire son nom)
            JOIN role ON account.role_id = role.id
            -- une seule ligne : celle dont l'id vaut $1
            WHERE account.id = $1
        `;
    const result = await pool.query(sqlQuery, [id]);
    // aucune ligne trouvée : rows est vide, rows[0] vaut undefined
    return result.rows[0];
  },

  // modifie le compte et renvoie la ligne à jour, sans le mot de passe
  async updateProfile(
    id: number,
    account: IUpdateProfile,
  ): Promise<IAccountProfile> {
    const sqlQuery = `
            UPDATE account
            SET firstname = $1, lastname = $2, email = $3, address = $4,
                account_type = $5, organization_name = $6
            WHERE id = $7
            RETURNING id, firstname, lastname, email, address,
                      account_type AS "accountType",
                      organization_name AS "organizationName",
                      is_active AS "isActive",
                      -- RETURNING ne permet pas de JOIN : donc on fait une sous-requête pour le nom du rôle
                      (SELECT name FROM role WHERE role.id = account.role_id) AS "role"
        `;
    const result = await pool.query(sqlQuery, [
      account.firstname,
      account.lastname,
      account.email,
      account.address,
      account.accountType,
      account.organizationName,
      id,
    ]);
    // une seule ligne modifiée : rows[0]
    return result.rows[0];
  },

  // le mot de passe haché d'un compte, pour le vérifier avant de le changer
  async findPasswordById(id: number): Promise<string | undefined> {
    // requête courte : pas besoin d'une variable sqlQuery
    const result = await pool.query(
      "SELECT password FROM account WHERE id = $1",
      [id],
    );
    // ?. : si aucune ligne n'est trouvée, renvoie undefined au lieu de planter
    return result.rows[0]?.password;
  },

  // remplace le mot de passe haché du compte ; rien à renvoyer (réponse 204)
  async updatePassword(id: number, password: string): Promise<void> {
    // requête courte : pas besoin d'une variable sqlQuery
    await pool.query("UPDATE account SET password = $2 WHERE id = $1", [
      id,
      password,
    ]);
  },

  // nombre d'admins actifs : on ne supprime pas le dernier
  async countActiveAdmins(): Promise<number> {
    // CAST : COUNT renvoie un bigint, que pg transmet en texte ("1") ; on veut un nombre
    const sqlQuery = `
            SELECT CAST(COUNT(*) AS INTEGER) AS count
            FROM account
            JOIN role ON account.role_id = role.id
            WHERE role.name = 'admin' AND account.is_active = true
        `;
    const result = await pool.query(sqlQuery);
    return result.rows[0].count;
  },

  // supprime le compte et son panier (ON DELETE CASCADE) ;
  // ses commandes restent, sans propriétaire (ON DELETE SET NULL)
  async deleteById(id: number): Promise<void> {
    await pool.query("DELETE FROM account WHERE id = $1", [id]);
  },
};
