import { describe, it } from "node:test";
import assert from "node:assert";
import * as libTests from "../../test/index.ts";
import argon2 from "argon2";
import { pool } from "../data/db-client.ts";

// Test d'intégration : requête HTTP et BDD de test
describe("userController", () => {
  // ==================
  // POST /users (pour l'inscription)
  // ==================
  describe("[POST] /api/users", () => {
    // un nouveau compte valide
    const newUser = {
      firstname: "Hugo",
      lastname: "TEST",
      email: "hugo@test.fr",
      password: "MotDePasse123!",
    };

    it("should respond 201 with a 'particulier' customer account and no password", async () => {
      // Arrange : le rôle "customer" doit exister en BDD
      // l'inscription cherche l'id de ce rôle par son nom (sous-requête SELECT id FROM role WHERE name = 'customer') ;
      // la base de test est vidée avant chaque test : sans ce rôle, role_id vaudrait NULL
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

    it("should respond 201 with exactly the fields of the contract", async () => {
      // Arrange : le rôle "customer" doit exister (voir le test 201)
      await pool.query("INSERT INTO role (name) VALUES ('customer')");

      // Act
      const response = await libTests.requester.post("/users", newUser);

      // Assert : la liste complète des clés (triées), ni plus ni moins
      // un champ en trop (password, role_id...) ou manquant ferait échouer le test
      assert.strictEqual(response.status, 201);
      assert.deepStrictEqual(Object.keys(response.data).sort(), [
        "accountType",
        "email",
        "firstname",
        "id",
        "lastname",
        "organizationName",
        "role",
      ]);
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

    it("should respond 201 if password has exactly 12 characters", async () => {
      // Arrange : le rôle "customer" doit exister (voir le test 201)
      await pool.query("INSERT INTO role (name) VALUES ('customer')");

      // Act : "JeSApe!Groot" fait 12 caractères pile, la limite du schéma (.min(12))
      const response = await libTests.requester.post("/users", {
        firstname: "Groot",
        lastname: "GalaxyGuardian",
        email: "groot@galaxy.com",
        password: "JeSApe!Groot",
      });

      // Assert : la limite est incluse, le compte est créé
      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.data.email, "groot@galaxy.com");
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

    it("should respond 400 if firstname is empty", async () => {
      // Act : prénom vide
      const response = await libTests.requester.post("/users", {
        ...newUser,
        firstname: "",
      });

      // Assert : 400 avec le message du schéma Zod
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "Prénom obligatoire.");
    });

    it("should respond 400 if lastname is empty", async () => {
      // Act : Bruce oublie son nom de famille
      const response = await libTests.requester.post("/users", {
        firstname: "Bruce",
        lastname: "",
        email: "bruce@wayne.com",
        password: "1AmTheBatman!",
      });

      // Assert : 400 avec le message du schéma Zod
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "Nom obligatoire.");
    });

    it("should respond 400 if email is invalid", async () => {
      // Act : email sans @
      const response = await libTests.requester.post("/users", {
        ...newUser,
        email: "hugo.test.fr",
      });

      // Assert : 400 avec le message du schéma Zod
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "Email invalide.");
    });

    it("should store the password hashed with argon2", async () => {
      // Arrange : le rôle "customer" doit exister (voir le test 201)
      await pool.query("INSERT INTO role (name) VALUES ('customer')");

      // Act
      await libTests.requester.post("/users", newUser);

      // Assert : en BDD, un hash argon2 et jamais le mot de passe en clair
      const result = await pool.query(
        "SELECT password FROM account WHERE email = $1",
        [newUser.email],
      );
      const storedPassword: string = result.rows[0].password;
      assert.notStrictEqual(storedPassword, newUser.password);
      assert.ok(storedPassword.startsWith("$argon2"), "Hash argon2 attendu");
      assert.ok(await argon2.verify(storedPassword, newUser.password));
    });

    it("should save no organization name for a 'particulier'", async () => {
      // Arrange : le rôle "customer" doit exister (voir le test 201)
      await pool.query("INSERT INTO role (name) VALUES ('customer')");

      // Act : un particulier qui envoie quand même un nom de structure
      const response = await libTests.requester.post("/users", {
        ...newUser,
        accountType: "particulier",
        organizationName: "Ma Société",
      });

      // Assert : compte créé, structure ignorée (null)
      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.data.organizationName, null);
    });

    it("should keep the organization name for an 'association'", async () => {
      // Arrange : le rôle "customer" doit exister (voir le test 201)
      await pool.query("INSERT INTO role (name) VALUES ('customer')");

      // Act
      const response = await libTests.requester.post("/users", {
        ...newUser,
        accountType: "association",
        organizationName: "Les Amis de la Forêt",
      });

      // Assert : la structure est bien enregistrée
      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.data.accountType, "association");
      assert.strictEqual(
        response.data.organizationName,
        "Les Amis de la Forêt",
      );
    });
  });

  // ==================
  // GET /users/me (qui est connecté)
  // ==================
  describe("[GET] /api/users/me", () => {
    it("should respond 200 with the account and its address", async () => {
      // Arrange : ALICE existe en BDD et se connecte
      await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);

      // Act
      const response = await libTests.requester.get("/users/me", {
        headers: { Cookie: cookie },
      });

      // Assert : contrat #83, les champs de POST /api/auth plus address, accountType, organizationName
      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(Object.keys(response.data).sort(), [
        "accountType",
        "address",
        "email",
        "firstname",
        "id",
        "lastname",
        "organizationName",
        "role",
      ]);
      assert.strictEqual(response.data.email, libTests.ALICE.email);
      assert.strictEqual(response.data.role, "customer");
      // ALICE est créée sans adresse ni structure : valeurs par défaut de la table account
      assert.strictEqual(response.data.address, null);
      assert.strictEqual(response.data.accountType, "particulier");
      assert.strictEqual(response.data.organizationName, null);
    });

    it("should respond 401 if not connected", async () => {
      // Act : sans cookie
      const response = await libTests.requester.get("/users/me");

      // Assert : 401 avec le message du contrat
      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.data.error, "Vous devez être connecté.");
    });

    it("should respond 401 if the token is invalid", async () => {
      // Act : un cookie qui ne contient pas un vrai JWT signé par l'API
      const response = await libTests.requester.get("/users/me", {
        headers: { Cookie: "accessToken=faux-jeton" },
      });

      // Assert : même réponse que sans cookie (contrat #83)
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
      const response = await libTests.requester.get("/users/me", {
        headers: { Cookie: cookie },
      });

      // Assert : 403 avec le même message qu'à la connexion
      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.data.error,
        "Ce compte est désactivé, veuillez contacter l'administrateur.",
      );
    });
  });

  // ==================
  // /api/admin/... (droits)
  // ==================
  describe("/api/admin", () => {
    // un compte administrateur de test
    const ADMIN = {
      ...libTests.ALICE,
      email: "admin@test.fr",
      role: "admin" as const,
    };

    it("should respond 401 if not connected", async () => {
      // Act : visiteur sans cookie
      const response = await libTests.requester.get("/admin/trees");

      // Assert
      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.data.error, "Vous devez être connecté.");
    });

    it("should respond 403 for a customer", async () => {
      // Arrange : ALICE (client) se connecte
      await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);

      // Act
      const response = await libTests.requester.get("/admin/trees", {
        headers: { Cookie: cookie },
      });

      // Assert : connecté mais pas le droit → 403 avec le message du contrat
      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.data.error,
        "Accès réservé à l'administrateur.",
      );
    });

    it("should let an admin through the middlewares", async () => {
      // Arrange : un administrateur se connecte
      await libTests.createAccount(ADMIN);
      const cookie = await libTests.loginAs(ADMIN);

      // Act
      const response = await libTests.requester.get("/admin/trees", {
        headers: { Cookie: cookie },
      });

      // Assert : ni 401 ni 403. Aucune route admin n'existe encore (F7) :
      // la requête passe les middlewares et arrive au 404 « Ressource introuvable »
      assert.strictEqual(response.status, 404);
    });
  });
});
