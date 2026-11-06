import { pool } from "../data/db-client.ts";
import type {
  IAccount,
  IAccountLogin,
  IAccountProfile,
  INewAccount,
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

  //selectionne tous les compte dont le role est customer
  async findAllCustomers(): Promise<IAccountProfile[]> {
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
            WHERE role.name =  'customer'
            ORDER BY account.id DESC
            `;

    const result = await pool.query(sqlQuery);
    return result.rows;
  },

  async updateIsActive(
    id: number,
    isActive: boolean,
  ): Promise<IAccountProfile> {
    const sqlQuery = `
  UPDATE account 
  SET is_active = $2 
  WHERE id = $1
  AND role_id = (SELECT id FROM role WHERE name = 'customer')
    RETURNING id, firstname, lastname, email,
                      address,
                      account_type AS "accountType",
                      organization_name AS "organizationName",
                      is_active AS "isActive",
                      'customer' AS "role"`;

    const result = await pool.query(sqlQuery, [id, isActive]);
    return result.rows[0];
  },

  async deleteById(id: number): Promise<boolean> {
    const sqlQuery = ` DELETE FROM account
                    WHERE id = $1
                    AND role_id = (SELECT id FROM role WHERE name = 'customer')`;

    const result = await pool.query(sqlQuery, [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
