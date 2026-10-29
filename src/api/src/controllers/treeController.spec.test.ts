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

    //TODO: autres tests (arbres seulement disponible / réponse 200 [] lorsque aucun arbre / ...)
  });
});
