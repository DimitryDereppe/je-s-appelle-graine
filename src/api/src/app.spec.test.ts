import { describe, it } from "node:test";
import assert from "node:assert";
import * as libTests from "../test/index.ts";

// Test d'intégration : routes générales de l'application (app.ts), sans contrôleur
describe("app", () => {
  // Test de la route qui vérifie que l'API tourne
  describe("[GET] /api/health", () => {
    // Doit répondre 200 avec le message de l'API
    it("should return 200 and a message", async () => {
      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/health");
      const body = httpResponse.data; // le JSON renvoyé ({ message })

      // Assert : La route répond et renvoie le message défini dans index.router.ts
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.message, "je s'appelle Graine");
    });
  });

  // Test d'une route qui n'existe pas (notFoundMiddleware dans errorMiddleware.ts)
  describe("[GET] route inconnue", () => {
    // Doit répondre 404 avec le message d'erreur de notFoundMiddleware
    it("should return 404 and error: Ressource introuvable", async () => {
      // Act : Appelle une route qui n'est déclarée dans aucun router
      const httpResponse = await libTests.requester.get("/unknown-route");
      const body = httpResponse.data; // le JSON renvoyé ({ error, status })

      // Assert : La route répond 404 et renvoie le format d'erreur de globalErrorHandler
      assert.strictEqual(httpResponse.status, 404);
      assert.strictEqual(body.error, "Ressource introuvable");
      assert.strictEqual(body.status, 404);
    });
  });
});
