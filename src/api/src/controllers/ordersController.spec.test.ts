import { describe, it } from "node:test";
import assert from "node:assert";
import * as libTests from "../../test/index.ts";
import { pool } from "../data/db-client.ts";

// --------------------------------
// prépare un client connecté avec un panier : 3 chênes à 16,90 € et 1 hêtre à 12,50 €
// retourne ce dont les tests ont besoin
// par défaut le client est ALICE ; on peut passer un autre compte (ex. SHERLOCK.account)
// --------------------------------
async function createCustomerWithCart(account = libTests.ALICE) {
  const aliceId = await libTests.createAccount(account);
  const oakId = await libTests.createTree({
    name: "Chêne pédonculé",
    price: 16.9,
    plantingLocation: "Forêt de Brocéliande — Paimpont (35)",
  });
  const beechId = await libTests.createTree({ name: "Hêtre", price: 12.5 });
  await libTests.addCartItem(aliceId, oakId, 3);
  await libTests.addCartItem(aliceId, beechId, 1);
  const cookie = await libTests.loginAs(account);
  return { aliceId, oakId, cookie };
}

// compte les lignes d'une table : pour vérifier que « rien n'est enregistré »
async function countRows(table: "purchase" | "purchase_line" | "cart_item") {
  const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
  return Number(result.rows[0].count);
}

const billingAddress = "12 rue des Chênes, 35380 Paimpont";
const validBody = {
  paymentMethod: "virement",
  paymentCommitment: true,
  billingAddress,
};

// Test d'intégration : requête HTTP et BDD de test
describe("ordersController", () => {
  // ==================
  // POST /orders (passer commande)
  // ==================
  describe("[POST] /api/orders", () => {
    it("should respond 201 with the order, its lines, total and due date", async () => {
      // Arrange
      const { cookie } = await createCustomerWithCart();

      // Act
      const response = await libTests.requester.post("/orders", validBody, {
        headers: { Cookie: cookie },
      });

      // Assert : champs du contrat #103
      assert.strictEqual(response.status, 201);
      assert.deepStrictEqual(Object.keys(response.data).sort(), [
        "billingAddress",
        "dueDate",
        "id",
        "lines",
        "paymentInstructions",
        "paymentMethod",
        "purchaseDate",
        "status",
        "totalAmount",
      ]);
      assert.strictEqual(response.data.status, "en attente");
      assert.strictEqual(response.data.paymentMethod, "virement");
      assert.strictEqual(response.data.billingAddress, billingAddress);
      // total recalculé par l'API : 3 × 16,90 + 1 × 12,50 = 63,20 (arrondi au centime)
      assert.strictEqual(response.data.totalAmount, 63.2);
      // date limite = date de commande + 10 jours
      const expectedDueDate = new Date(response.data.purchaseDate);
      expectedDueDate.setUTCDate(expectedDueDate.getUTCDate() + 10);
      assert.strictEqual(
        response.data.dueDate,
        expectedDueDate.toISOString().slice(0, 10),
      );
      // lignes figées : nom, prix payé, quantité, lieu de plantation
      assert.deepStrictEqual(response.data.lines[0], {
        treeName: "Chêne pédonculé",
        unitPrice: 16.9,
        quantity: 3,
        plantingLocation: "Forêt de Brocéliande — Paimpont (35)",
      });
      assert.strictEqual(response.data.lines.length, 2);
    });

    it("should give the IBAN for a bank transfer", async () => {
      // Arrange
      const { cookie } = await createCustomerWithCart();

      // Act
      const response = await libTests.requester.post("/orders", validBody, {
        headers: { Cookie: cookie },
      });

      // Assert : instructions de virement (valeurs de config.ts)
      assert.deepStrictEqual(
        Object.keys(response.data.paymentInstructions).sort(),
        ["bic", "holder", "iban"],
      );
    });

    it("should give the payee and address for a cheque", async () => {
      // Arrange
      const { cookie } = await createCustomerWithCart();

      // Act
      const response = await libTests.requester.post(
        "/orders",
        { ...validBody, paymentMethod: "chèque" },
        { headers: { Cookie: cookie } },
      );

      // Assert : instructions pour un chèque
      assert.strictEqual(response.status, 201);
      assert.deepStrictEqual(
        Object.keys(response.data.paymentInstructions).sort(),
        ["address", "payableTo"],
      );
    });

    it("should save the buyer identity and empty the cart", async () => {
      // Arrange
      const { aliceId, cookie } = await createCustomerWithCart();

      // Act
      const response = await libTests.requester.post("/orders", validBody, {
        headers: { Cookie: cookie },
      });

      // Assert : identité figée dans la commande, panier vidé
      const purchase = await pool.query(
        "SELECT buyer_email, buyer_address, account_id FROM purchase WHERE id = $1",
        [response.data.id],
      );
      assert.strictEqual(purchase.rows[0].buyer_email, libTests.ALICE.email);
      assert.strictEqual(purchase.rows[0].buyer_address, billingAddress);
      assert.strictEqual(purchase.rows[0].account_id, aliceId);
      assert.strictEqual(await countRows("purchase_line"), 2);
      assert.strictEqual(await countRows("cart_item"), 0);
    });

    it("should keep the price paid even if the tree price changes later", async () => {
      // Arrange : commande passée, puis l'admin change le prix du chêne
      const { oakId, cookie } = await createCustomerWithCart();
      const order = await libTests.requester.post("/orders", validBody, {
        headers: { Cookie: cookie },
      });
      await pool.query("UPDATE tree SET price = 99 WHERE id = $1", [oakId]);

      // Act
      const response = await libTests.requester.get(
        `/orders/${order.data.id}`,
        { headers: { Cookie: cookie } },
      );

      // Assert : le prix de la ligne reste celui du jour de la commande
      assert.strictEqual(response.data.lines[0].unitPrice, 16.9);
      assert.strictEqual(response.data.totalAmount, 63.2);
    });

    it("should respond 400 if the payment method is invalid", async () => {
      // Arrange
      const { cookie } = await createCustomerWithCart();

      // Act
      const response = await libTests.requester.post(
        "/orders",
        { ...validBody, paymentMethod: "carte" },
        { headers: { Cookie: cookie } },
      );

      // Assert
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "Mode de paiement invalide.");
    });

    it("should respond 400 if the payment commitment is not checked", async () => {
      // Arrange
      const { cookie } = await createCustomerWithCart();

      // Act : case non cochée
      const response = await libTests.requester.post(
        "/orders",
        { ...validBody, paymentCommitment: false },
        { headers: { Cookie: cookie } },
      );

      // Assert
      assert.strictEqual(response.status, 400);
      assert.strictEqual(
        response.data.error,
        "Vous devez vous engager à payer sous 10 jours.",
      );
    });

    it("should respond 400 if the billing address is missing or blank", async () => {
      // Arrange
      const { cookie } = await createCustomerWithCart();
      const bodyWithoutAddress = {
        paymentMethod: "virement",
        paymentCommitment: true,
      };

      // Act : adresse absente, puis adresse faite seulement d'espaces
      const missing = await libTests.requester.post(
        "/orders",
        bodyWithoutAddress,
        { headers: { Cookie: cookie } },
      );
      const blank = await libTests.requester.post(
        "/orders",
        { ...validBody, billingAddress: "   " },
        { headers: { Cookie: cookie } },
      );

      // Assert
      assert.strictEqual(missing.status, 400);
      assert.strictEqual(
        missing.data.error,
        "L'adresse de facturation est obligatoire.",
      );
      assert.strictEqual(blank.status, 400);
      assert.strictEqual(
        blank.data.error,
        "L'adresse de facturation est obligatoire.",
      );
    });

    it("should respond 400 if the cart is empty", async () => {
      // Arrange : ALICE n'a rien dans son panier
      await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);

      // Act
      const response = await libTests.requester.post("/orders", validBody, {
        headers: { Cookie: cookie },
      });

      // Assert
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "Votre panier est vide.");
      assert.strictEqual(await countRows("purchase"), 0);
    });

    it("should respond 409 and save nothing if a tree is no longer available", async () => {
      // Arrange : un arbre retiré du catalogue est resté dans le panier
      const { aliceId, cookie } = await createCustomerWithCart();
      const withdrawnId = await libTests.createTree({
        name: "Orme",
        availability: "retiré",
      });
      await libTests.addCartItem(aliceId, withdrawnId, 1);

      // Act
      const response = await libTests.requester.post("/orders", validBody, {
        headers: { Cookie: cookie },
      });

      // Assert : 409, aucune commande, panier intact (3 lignes)
      assert.strictEqual(response.status, 409);
      assert.strictEqual(
        response.data.error,
        "Un arbre de votre panier n'est plus disponible.",
      );
      assert.strictEqual(await countRows("purchase"), 0);
      assert.strictEqual(await countRows("cart_item"), 3);
    });

    it("should save nothing if a step fails in the middle of the transaction", async () => {
      // Arrange : on force l'échec de l'étape 2 (lignes de commande) avec un trigger
      // qui lève une erreur à chaque INSERT dans purchase_line.
      // L'étape 1 (INSERT purchase) a déjà réussi à ce moment-là : seul le ROLLBACK peut l'annuler.
      const { cookie } = await createCustomerWithCart();
      await pool.query(`
        CREATE FUNCTION fail_purchase_line() RETURNS trigger AS $$
        BEGIN RAISE EXCEPTION 'échec simulé'; END;
        $$ LANGUAGE plpgsql`);
      await pool.query(`
        CREATE TRIGGER fail_purchase_line BEFORE INSERT ON purchase_line
        FOR EACH ROW EXECUTE FUNCTION fail_purchase_line()`);

      try {
        // Act
        const response = await libTests.requester.post("/orders", validBody, {
          headers: { Cookie: cookie },
        });

        // Assert : 500, et la base est exactement comme avant la commande
        assert.strictEqual(response.status, 500);
        assert.strictEqual(await countRows("purchase"), 0);
        assert.strictEqual(await countRows("purchase_line"), 0);
        assert.strictEqual(await countRows("cart_item"), 2);
      } finally {
        // le trigger n'est pas effacé entre deux tests (seules les données le sont) :
        // on le supprime, réussite ou échec, pour ne pas casser les tests suivants
        await pool.query("DROP TRIGGER fail_purchase_line ON purchase_line");
        await pool.query("DROP FUNCTION fail_purchase_line");
      }
    });

    it("should respond 401 if not connected", async () => {
      // Act : sans cookie
      const response = await libTests.requester.post("/orders", validBody);

      // Assert
      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.data.error, "Vous devez être connecté.");
    });
  });

  // ==================
  // GET /orders/:id (page de confirmation)
  // ==================
  describe("[GET] /api/orders/:id", () => {
    it("should respond 200 with the same order as POST /api/orders", async () => {
      // Arrange : ALICE passe commande
      const { cookie } = await createCustomerWithCart();
      const order = await libTests.requester.post("/orders", validBody, {
        headers: { Cookie: cookie },
      });

      // Act
      const response = await libTests.requester.get(
        `/orders/${order.data.id}`,
        { headers: { Cookie: cookie } },
      );

      // Assert : même contenu que la réponse du POST (la page reste correcte si on la recharge)
      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, order.data);
    });

    it("should return the billing address given when ordering", async () => {
      // Arrange : ALICE commande avec une adresse de facturation
      // (différente de celle de son compte : c'est bien l'adresse saisie qui est gardée)
      const { cookie } = await createCustomerWithCart();
      const otherAddress = "221B Baker Street, London NW1 6XE";
      const order = await libTests.requester.post(
        "/orders",
        { ...validBody, billingAddress: otherAddress },
        { headers: { Cookie: cookie } },
      );

      // Act : relecture de la commande, comme sur la page de confirmation
      const response = await libTests.requester.get(
        `/orders/${order.data.id}`,
        { headers: { Cookie: cookie } },
      );

      // Assert : l'adresse de facturation est celle saisie, prête pour la facture
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.billingAddress, otherAddress);
    });

    // un client par pays : chacun commande avec son adresse de facturation
    // (lettres accentuées, ß, code postal britannique : la chaîne doit revenir intacte)
    const europeanCustomers = [
      libTests.SHERLOCK, // Royaume-Uni
      libTests.POIROT, // Belgique
      libTests.EINSTEIN, // Allemagne
      libTests.QUICHOTTE, // Espagne
    ];
    for (const customer of europeanCustomers) {
      const { account, billingAddress: customerAddress } = customer;

      it(`should return the billing address of ${account.firstname} ${account.lastname}`, async () => {
        // Arrange : le client commande avec son adresse de facturation
        const { cookie } = await createCustomerWithCart(account);
        const order = await libTests.requester.post(
          "/orders",
          { ...validBody, billingAddress: customerAddress },
          { headers: { Cookie: cookie } },
        );

        // Act : relecture de la commande, comme sur la page de confirmation
        const response = await libTests.requester.get(
          `/orders/${order.data.id}`,
          { headers: { Cookie: cookie } },
        );

        // Assert : l'adresse est celle saisie, sans modification
        assert.strictEqual(order.status, 201);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.billingAddress, customerAddress);
      });
    }

    it("should remove the spaces around the billing address", async () => {
      // Arrange
      const { cookie } = await createCustomerWithCart(
        libTests.SHERLOCK.account,
      );

      // Act : adresse entourée d'espaces (copier-coller maladroit)
      const response = await libTests.requester.post(
        "/orders",
        {
          ...validBody,
          billingAddress: `   ${libTests.SHERLOCK.billingAddress}   `,
        },
        { headers: { Cookie: cookie } },
      );

      // Assert : trim (schéma Zod) a retiré les espaces avant l'enregistrement
      assert.strictEqual(response.status, 201);
      assert.strictEqual(
        response.data.billingAddress,
        libTests.SHERLOCK.billingAddress,
      );
    });

    it("should respond 400 if the billing address is longer than 255 characters", async () => {
      // Arrange
      const { cookie } = await createCustomerWithCart();

      // Act : 256 caractères, un de trop pour la colonne buyer_address
      const response = await libTests.requester.post(
        "/orders",
        { ...validBody, billingAddress: "a".repeat(256) },
        { headers: { Cookie: cookie } },
      );

      // Assert
      assert.strictEqual(response.status, 400);
      assert.strictEqual(
        response.data.error,
        "L'adresse de facturation est trop longue.",
      );
    });

    it("should respond 404 for the order of another customer", async () => {
      // Arrange : ALICE passe commande, un autre client se connecte
      const { cookie } = await createCustomerWithCart();
      const order = await libTests.requester.post("/orders", validBody, {
        headers: { Cookie: cookie },
      });
      const other = { ...libTests.ALICE, email: "autre@test.fr" };
      await libTests.createAccount(other);
      const otherCookie = await libTests.loginAs(other);

      // Act : l'autre client demande la commande d'ALICE
      const response = await libTests.requester.get(
        `/orders/${order.data.id}`,
        { headers: { Cookie: otherCookie } },
      );

      // Assert : 404, comme une commande inconnue (on ne révèle pas qu'elle existe)
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data.error, "Commande introuvable.");
    });

    it("should respond 404 for an unknown order", async () => {
      // Arrange
      await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);

      // Act
      const response = await libTests.requester.get("/orders/999", {
        headers: { Cookie: cookie },
      });

      // Assert
      assert.strictEqual(response.status, 404);
    });

    it("should respond 400 if the id is not a positive integer", async () => {
      // Arrange
      await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);

      // Act
      const response = await libTests.requester.get("/orders/abc", {
        headers: { Cookie: cookie },
      });

      // Assert : refusé par validateId
      assert.strictEqual(response.status, 400);
    });

    it("should respond 401 if not connected", async () => {
      // Act
      const response = await libTests.requester.get("/orders/1");

      // Assert
      assert.strictEqual(response.status, 401);
    });
  });
});
