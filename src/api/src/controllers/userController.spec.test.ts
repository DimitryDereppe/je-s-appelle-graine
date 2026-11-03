import { describe, it } from "node:test";
import assert from "node:assert";
import * as libTests from "../../test/index.ts";
import { pool } from "../data/db-client.ts";

// Test d'intégration : requête HTTP et BDD de test
describe("userController", () => {
  // ==================
  // POST /users (pour l'inscription)
  // ==================
  describe("[POST] /api/users", () => {
    // un nouveau compte valide, différent d'ALICE
    const newUser = {
      firstname: "Hugo",
      lastname: "TEST",
      email: "hugo@test.fr",
      password: "MotDePasse123!",
    };

    it("should respond 201 with a 'particulier' customer account and no password", async () => {
      // Arrange : le rôle "customer" doit exister en BDD
      // (l'INSERT de l'inscription le retrouve par son nom ; les tables sont vidées avant chaque test)
      await pool.query("INSERT INTO role (name) VALUES ('customer')");

      // Act : inscription sans accountType ni organizationName
      const response = await libTests.requester.post("/users", newUser);

      // Assert :
      // test code réponse 201 Created
      assert.strictEqual(response.status, 201);
      // valeurs par défaut : compte particulier, rôle client
      assert.strictEqual(response.data.email, newUser.email);
      assert.strictEqual(response.data.accountType, "particulier");
      assert.strictEqual(response.data.role, "customer");
      // le mot de passe (même haché) n'est jamais renvoyé
      assert.strictEqual(response.data.password, undefined);
    });

    it("should respond 400 if password has less than 12 characters", async () => {
      // Act : mot de passe de 11 caractères
      const response = await libTests.requester.post("/users", {
        ...newUser,
        password: "Court12345!",
      });

      // Assert : 400 avec le message du schéma Zod
      assert.strictEqual(response.status, 400);
      assert.strictEqual(
        response.data.error,
        "Le mot de passe doit contenir au moins 12 caractères.",
      );
    });

    it("should respond 409 if email is already used", async () => {
      // Arrange : ALICE existe déjà en BDD
      await libTests.createAccount(libTests.ALICE);

      // Act : nouvelle inscription avec l'email d'ALICE
      const response = await libTests.requester.post("/users", {
        ...newUser,
        email: libTests.ALICE.email,
      });

      // Assert : 409 Conflict
      assert.strictEqual(response.status, 409);
      assert.strictEqual(response.data.error, "Cet email est déjà utilisé.");
    });

    it("should respond 415 if body is not JSON", async () => {
      // Act : mêmes données, envoyées comme un formulaire HTML (protection CSRF)
      const response = await libTests.requester.post(
        "/users",
        new URLSearchParams(newUser).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );

      // Assert : 415 Unsupported Media Type (validateContentType)
      assert.strictEqual(response.status, 415);
    });
  });
});
