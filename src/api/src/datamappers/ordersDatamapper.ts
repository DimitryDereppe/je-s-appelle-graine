import { pool } from "../data/db-client.ts";
import type {
  IAccountProfile,
  ICartItem,
  IOrder,
  IOrderSummary,
  OrderStatus,
  PaymentMethod,
} from "../@types/index.d.ts";

export const ordersDatamapper = {
  // --------------------------------
  // crée la commande à partir du panier, dans UNE transaction :
  // 1. la commande (purchase) avec l'identité de l'acheteur et son adresse de facturation figées
  // 2. une ligne (purchase_line) par ligne du panier, avec nom, prix et lieu figés
  // 3. le panier vidé
  // si une étape échoue, ROLLBACK annule tout : rien n'est enregistré
  // retourne l'id de la commande créée
  // --------------------------------
  async createOrderFromCart(
    account: IAccountProfile,
    cart: ICartItem[],
    paymentMethod: PaymentMethod,
    totalAmount: number,
    billingAddress: string,
  ): Promise<number> {
    // pool.query peut envoyer chaque requête sur une connexion différente ;
    // BEGIN ne vaut que pour SA connexion : on en emprunte UNE au pool pour toute la transaction
    const client = await pool.connect();

    try {
      // à partir d'ici, rien n'est définitif tant qu'on n'a pas fait COMMIT
      await client.query("BEGIN");

      // 1. la commande : identité de l'acheteur copiée depuis son compte,
      // adresse de facturation saisie par le client au moment de commander
      // (si le client change d'adresse plus tard, la commande garde celle du jour)
      const purchaseResult = await client.query(
        `INSERT INTO purchase (total_amount, payment_method, buyer_firstname, buyer_lastname,
                               buyer_email, buyer_organization, buyer_address, account_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          totalAmount,
          paymentMethod,
          account.firstname,
          account.lastname,
          account.email,
          account.organizationName,
          billingAddress,
          account.id,
        ],
      );
      const purchaseId: number = purchaseResult.rows[0].id;

      // 2. une ligne de commande par ligne du panier
      // nom, prix et lieu sont copiés : si l'admin change le prix demain,
      // la commande garde le prix payé aujourd'hui
      for (const line of cart) {
        await client.query(
          `INSERT INTO purchase_line (purchase_id, tree_id, tree_name, unit_price, planting_location, quantity)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            purchaseId,
            line.treeId,
            line.name,
            line.price,
            line.plantingLocation,
            line.quantity,
          ],
        );
      }

      // 3. le panier est vidé
      await client.query("DELETE FROM cart_item WHERE account_id = $1", [
        account.id,
      ]);

      // tout s'est bien passé : on rend les 3 étapes définitives, ensemble
      await client.query("COMMIT");
      return purchaseId;
    } catch (error) {
      // une étape a échoué : on annule TOUT ce qui a été fait depuis BEGIN
      await client.query("ROLLBACK");
      // on relance l'erreur : le contrôleur s'arrête et globalErrorHandler répond 500
      throw error;
    } finally {
      // succès ou erreur, on rend la connexion au pool
      // (sinon elle reste prise, et au bout de 10 commandes le pool est vide : l'API se bloque)
      client.release();
    }
  },

  // --------------------------------
  // lit une commande et ses lignes, seulement si elle appartient à ce compte
  // retourne null si la commande n'existe pas OU appartient à un autre client
  // (même réponse dans les deux cas : on ne dit pas à un client qu'une commande existe chez un autre)
  // --------------------------------
  async findOrderByIdAndAccountId(
    orderId: number,
    accountId: number,
  ): Promise<IOrder | null> {
    const orderResult = await pool.query(
      `SELECT id,
              purchase_date AS "purchaseDate",
              -- date limite de paiement : date de commande + 10 jours, en texte "AAAA-MM-JJ"
              -- (TO_CHAR évite que Node la transforme en date avec heure et fuseau)
              TO_CHAR(purchase_date + INTERVAL '10 days', 'YYYY-MM-DD') AS "dueDate",
              status,
              payment_method AS "paymentMethod",
              -- NUMERIC arrive en texte dans Node : CAST le change en nombre
              CAST(total_amount AS FLOAT) AS "totalAmount",
              -- adresse de facturation : elle servira si on édite des factures plus tard
              -- (l'email de confirmation ne vaut pas facture : pas de mentions légales)
              buyer_address AS "billingAddress"
       FROM purchase
       WHERE id = $1 AND account_id = $2`,
      [orderId, accountId],
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const linesResult = await pool.query(
      `SELECT tree_name AS "treeName",
              CAST(unit_price AS FLOAT) AS "unitPrice",
              quantity,
              planting_location AS "plantingLocation"
       FROM purchase_line
       WHERE purchase_id = $1
       ORDER BY id`,
      [orderId],
    );

    // la commande, avec ses lignes dans une propriété "lines" (format du contrat)
    return { ...orderResult.rows[0], lines: linesResult.rows };
  },

  // --------------------------------
  // L'historique des commandes d'un client, la plus récente en premier
  // --------------------------------
  async findAllForAccount(accountId: number): Promise<IOrderSummary[]> {
    const result = await pool.query(
      `SELECT id, purchase_date AS "purchaseDate", status,
              CAST(total_amount AS FLOAT) AS "totalAmount"
       FROM purchase
       WHERE account_id = $1
       ORDER BY purchase_date DESC, id DESC`,
      [accountId],
    );
    return result.rows;
  },

  // --------------------------------
  // Change le statut et enregistre la date du changement dans la bonne colonne
  // --------------------------------
  async updateStatus(id: number, status: OrderStatus): Promise<void> {
    await pool.query(
      `UPDATE purchase
       -- CAST : $2 sert deux fois (colonne VARCHAR et comparaison), PostgreSQL doit connaître son type
       SET status = CAST($2 AS VARCHAR),
           -- CASE WHEN … THEN … ELSE … END = le if / else du SQL
           -- si le nouveau statut est 'payée' → date du jour, sinon la colonne garde sa valeur
           paid_at = CASE WHEN $2 = 'payée' THEN now() ELSE paid_at END,
           -- même principe pour les deux autres dates
           planted_at = CASE WHEN $2 = 'plantée' THEN now() ELSE planted_at END,
           cancelled_at = CASE WHEN $2 = 'annulée' THEN now() ELSE cancelled_at END
       WHERE id = $1`,
      [id, status],
    );
  },
};
