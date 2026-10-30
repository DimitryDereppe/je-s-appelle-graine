import { describe, it } from "node:test";
import assert from "node:assert";
import * as libTests from "../../test/index.ts";

// Test d'intégration : requête HTTP et BDD de test
describe("treeController", () => {
  // Test de la route de l'accueil
  describe("[GET] /api/trees/featured", () => {
    // Ne doit retourner que 3 arbres
    it("should return 3 trees", async () => {
      // Arrange : 4 arbres disponibles en BDD, un de plus que la limite
      await libTests.createTree({ name: "Érable" });
      await libTests.createTree({ name: "Hêtre" });
      await libTests.createTree({ name: "Tilleul" });
      await libTests.createTree({ name: "Chêne" });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees/featured");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et LIMIT 3 n'en garde que 3
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.length, 3);
    });

    it("should return only available trees", async () => {
      // Arrange : 2 arbres disponibles, 1 en rupture de stock, 1 retiré
      await libTests.createTree({ name: "Érable" });
      await libTests.createTree({ name: "Hêtre" });
      await libTests.createTree({
        name: "Tilleul",
        availability: "out_of_stock",
      });
      await libTests.createTree({
        name: "Chêne",
        availability: "withdrawn",
      });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees/featured");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et ne renvoie que les arbres disponibles
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.length, 2);
    });

    it("should return tree.id by order DESC", async () => {
      // Arrange : 3 arbres disponibles avec des IDs différents
      const tree1Id = await libTests.createTree({ name: "Érable" });
      const tree2Id = await libTests.createTree({ name: "Hêtre" });
      const tree3Id = await libTests.createTree({ name: "Tilleul" });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees/featured");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et les arbres sont triés par ID décroissant
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.length, 3);
      assert.strictEqual(body[0].id, tree3Id);
      assert.strictEqual(body[1].id, tree2Id);
      assert.strictEqual(body[2].id, tree1Id);
    });

    it("should return 200 with empty array when no trees", async () => {
      // Arrange : aucun arbre en BDD

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees/featured");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et renvoie un tableau vide
      assert.strictEqual(httpResponse.status, 200);
      assert.deepStrictEqual(body, []);
    });

    it("should return 200 with empty array when no available trees", async () => {
      // Arrange : 2 arbres en rupture de stock, 1 retiré
      await libTests.createTree({
        name: "Tilleul",
        availability: "out_of_stock",
      });
      await libTests.createTree({
        name: "Chêne",
        availability: "withdrawn",
      });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees/featured");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et renvoie un tableau vide
      assert.strictEqual(httpResponse.status, 200);
      assert.deepStrictEqual(body, []);
    });
    // TODO : autres tests (réponse 200 [] lorsque aucun arbre / ...)
  });
});
