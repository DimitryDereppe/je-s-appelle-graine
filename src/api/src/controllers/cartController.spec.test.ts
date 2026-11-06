import { describe, it } from "node:test";
import assert from "node:assert";
import * as libTests from "../../test/index.ts";
import { pool } from "../data/db-client.ts";

// Test d'intégration : requête HTTP et BDD de test
describe("cartController", () => {
  // ==================
  // GET /cart (panier du compte connecté)
  // ==================
  describe("[GET] /api/cart", () => {
    it("should respond 200 with an empty array if the cart is empty", async () => {
      // Arrange : ALICE existe en BDD, se connecte, et n'a rien dans son panier
      await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);

      // Act
      const response = await libTests.requester.get("/cart", {
        headers: { Cookie: cookie },
      });

      // Assert : panier vide = 200 avec un tableau vide (pas un 404)
      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, []);
    });

    it("should respond 200 with the cart lines and the tree details", async () => {
      // Arrange : un arbre dans le panier d'ALICE, en 2 exemplaires
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const treeId = await libTests.createTree({
        name: "Pin maritime",
        price: 9.9,
        plantingLocation: "Landiras (33)",
      });
      await libTests.addCartItem(aliceId, treeId, 2);
      const cookie = await libTests.loginAs(libTests.ALICE);

      // Act
      const response = await libTests.requester.get("/cart", {
        headers: { Cookie: cookie },
      });

      // Assert : une seule ligne, avec exactement les champs renvoyés par cartDatamapper
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.length, 1);
      const line = response.data[0];
      assert.deepStrictEqual(Object.keys(line).sort(), [
        "accountId",
        "availabilityName",
        "id",
        "name",
        "photoUrl",
        "plantingLocation",
        "price",
        "quantity",
        "treeId",
      ]);
      assert.strictEqual(line.treeId, treeId);
      assert.strictEqual(line.quantity, 2);
      assert.strictEqual(line.name, "Pin maritime");
      // NUMERIC arrive en texte depuis PostgreSQL : le CAST du datamapper le change en nombre
      assert.strictEqual(line.price, 9.9);
      assert.strictEqual(line.plantingLocation, "Landiras (33)");
      assert.strictEqual(line.availabilityName, "disponible");
    });

    it("should respond only with the cart of the connected account", async () => {
      // Arrange : ALICE et un 2e client ont chacun un arbre différent dans leur panier
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const otherId = await libTests.createAccount({
        ...libTests.ALICE,
        firstname: "Autre",
        email: "autre@test.fr",
      });
      const aliceTreeId = await libTests.createTree({ name: "Chêne" });
      const otherTreeId = await libTests.createTree({ name: "Hêtre" });
      await libTests.addCartItem(aliceId, aliceTreeId, 1);
      await libTests.addCartItem(otherId, otherTreeId, 3);
      const cookie = await libTests.loginAs(libTests.ALICE);

      // Act
      const response = await libTests.requester.get("/cart", {
        headers: { Cookie: cookie },
      });

      // Assert : seulement la ligne d'ALICE (id lu dans le jeton, pas dans la requête)
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.length, 1);
      assert.strictEqual(response.data[0].treeId, aliceTreeId);
      assert.strictEqual(response.data[0].accountId, aliceId);
    });

    it("should respond 401 if not connected", async () => {
      // Act : sans cookie
      const response = await libTests.requester.get("/cart");

      // Assert : 401 avec le message du contrat
      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.data.error, "Vous devez être connecté.");
    });

    it("should respond 401 if the token is invalid", async () => {
      // Act : un cookie qui ne contient pas un vrai JWT signé par l'API
      const response = await libTests.requester.get("/cart", {
        headers: { Cookie: "accessToken=faux-jeton" },
      });

      // Assert : même réponse que sans cookie
      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.data.error, "Vous devez être connecté.");
    });

    it("should respond 403 if the account was deactivated after login", async () => {
      // Arrange : ALICE se connecte (compte actif), puis l'admin désactive son compte
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);
      await pool.query("UPDATE account SET is_active = FALSE WHERE id = $1", [
        aliceId,
      ]);

      // Act : le jeton est toujours valide (24 h)
      const response = await libTests.requester.get("/cart", {
        headers: { Cookie: cookie },
      });

      // Assert : 403, getAuthenticatedUser vérifie is_active à chaque requête
      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.data.error,
        "Ce compte est désactivé, veuillez contacter l'administrateur.",
      );
    });
  });
});
