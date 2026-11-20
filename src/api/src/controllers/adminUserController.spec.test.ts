import { describe, it } from "node:test";
import assert from "node:assert";
import * as libTests from "../../test/index.ts";
import { pool } from "../data/db-client.ts";

// Test d'intégration : requête HTTP et BDD de test (vidée avant chaque test)
describe("adminUserController", () => {
  // --------------------------------
  // comptes de test
  // ... recopie les champs d'ALICE ; les lignes suivantes remplacent ceux qu'on change
  // as const : TypeScript garde le type "admin", et pas n'importe quel texte
  // --------------------------------
  const ADMIN = {
    ...libTests.ALICE,
    firstname: "Ada",
    lastname: "Admin",
    email: "admin@test.fr",
    role: "admin" as const,
  };
  const OTHER_ADMIN = {
    ...ADMIN,
    firstname: "Otto",
    lastname: "Autre",
    email: "admin2@test.fr",
  };
  const BOB = {
    ...libTests.ALICE,
    firstname: "Bob",
    lastname: "Zola",
    email: "bob@test.fr",
  };

  // crée ADMIN, le connecte et renvoie son cookie (utilisé dans presque tous les tests)
  async function loginAsAdmin(): Promise<string> {
    await libTests.createAccount(ADMIN);
    return libTests.loginAs(ADMIN);
  }

  // ==================
  // Droits (communs aux 4 routes, vérifiés sur la liste)
  // ==================
  describe("Access rights", () => {
    it("should respond 401 if not connected", async () => {
      // Act : sans cookie
      const response = await libTests.requester.get("/admin/users");

      // Assert
      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.data.error, "Vous devez être connecté.");
    });

    it("should respond 403 for a customer", async () => {
      // Arrange : ALICE (cliente) se connecte
      await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);

      // Act
      const response = await libTests.requester.get("/admin/users", {
        headers: { Cookie: cookie },
      });

      // Assert
      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.data.error,
        "Accès réservé à l'administrateur.",
      );
    });
  });

  // ==================
  // GET /admin/users (la liste)
  // ==================
  describe("[GET] /api/admin/users", () => {
    it("should respond 200 with all accounts, admins included, sorted by lastname", async () => {
      // Arrange : 1 admin et 2 clients
      // noms choisis pour vérifier le tri : Admin < TEST < Zola
      const cookie = await loginAsAdmin();
      await libTests.createAccount(BOB);
      await libTests.createAccount(libTests.ALICE);

      // Act
      const response = await libTests.requester.get("/admin/users", {
        headers: { Cookie: cookie },
      });

      // Assert : 3 comptes, triés par nom de famille
      assert.strictEqual(response.status, 200);
      // map : on ne garde que le nom de chaque compte, pour comparer l'ordre
      const lastnames = response.data.map(
        (account: { lastname: string }) => account.lastname,
      );
      assert.deepStrictEqual(lastnames, ["Admin", "TEST", "Zola"]);
    });

    it("should never send a password", async () => {
      // Arrange
      const cookie = await loginAsAdmin();
      await libTests.createAccount(libTests.ALICE);

      // Act
      const response = await libTests.requester.get("/admin/users", {
        headers: { Cookie: cookie },
      });

      // Assert : aucun compte de la liste n'a de champ password
      assert.strictEqual(response.status, 200);
      for (const account of response.data) {
        assert.strictEqual(account.password, undefined);
      }
    });

    it("should send the role and the state of each account", async () => {
      // Arrange : un client désactivé
      const cookie = await loginAsAdmin();
      await libTests.createAccount({ ...BOB, isActive: false });

      // Act
      const response = await libTests.requester.get("/admin/users", {
        headers: { Cookie: cookie },
      });

      // Assert : find cherche le compte de BOB dans la liste
      const bob = response.data.find(
        (account: { email: string }) => account.email === BOB.email,
      );
      assert.strictEqual(bob.role, "customer");
      assert.strictEqual(bob.isActive, false);
    });
  });

  // ==================
  // GET /admin/users/:id (un compte)
  // ==================
  describe("[GET] /api/admin/users/:id", () => {
    it("should respond 200 with the account and no password", async () => {
      // Arrange
      const cookie = await loginAsAdmin();
      const aliceId = await libTests.createAccount(libTests.ALICE);

      // Act
      const response = await libTests.requester.get(`/admin/users/${aliceId}`, {
        headers: { Cookie: cookie },
      });

      // Assert
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.id, aliceId);
      assert.strictEqual(response.data.email, libTests.ALICE.email);
      assert.strictEqual(response.data.isActive, true);
      assert.strictEqual(response.data.password, undefined);
    });

    it("should respond 404 if the account does not exist", async () => {
      // Arrange
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.get("/admin/users/99999", {
        headers: { Cookie: cookie },
      });

      // Assert
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data.error, "Compte introuvable.");
    });

    it("should respond 400 if the id is not a number", async () => {
      // Arrange
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.get("/admin/users/abc", {
        headers: { Cookie: cookie },
      });

      // Assert : refusé par validateId
      assert.strictEqual(response.status, 400);
    });
  });

  // ==================
  // PATCH /admin/users/:id (activer / désactiver)
  // ==================
  describe("[PATCH] /api/admin/users/:id", () => {
    it("should respond 200 and deactivate the account", async () => {
      // Arrange
      const cookie = await loginAsAdmin();
      const aliceId = await libTests.createAccount(libTests.ALICE);

      // Act
      const response = await libTests.requester.patch(
        `/admin/users/${aliceId}`,
        { isActive: false },
        { headers: { Cookie: cookie } },
      );

      // Assert : la réponse ET la BDD
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.isActive, false);
      assert.strictEqual(response.data.role, "customer");
      assert.strictEqual(response.data.password, undefined);
      const result = await pool.query(
        "SELECT is_active FROM account WHERE id = $1",
        [aliceId],
      );
      assert.strictEqual(result.rows[0].is_active, false);
    });

    it("should prevent a deactivated account from logging in (403)", async () => {
      // Arrange : l'admin désactive ALICE
      const cookie = await loginAsAdmin();
      const aliceId = await libTests.createAccount(libTests.ALICE);
      await libTests.requester.patch(
        `/admin/users/${aliceId}`,
        { isActive: false },
        { headers: { Cookie: cookie } },
      );

      // Act : ALICE essaie de se connecter
      const response = await libTests.requester.post("/auth", {
        email: libTests.ALICE.email,
        password: libTests.ALICE.password,
      });

      // Assert
      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.data.error,
        "Ce compte est désactivé, veuillez contacter l'administrateur.",
      );
    });

    it("should let a reactivated account log in again (200)", async () => {
      // Arrange : ALICE est désactivée, puis l'admin la réactive
      const cookie = await loginAsAdmin();
      const aliceId = await libTests.createAccount({
        ...libTests.ALICE,
        isActive: false,
      });
      const patchResponse = await libTests.requester.patch(
        `/admin/users/${aliceId}`,
        { isActive: true },
        { headers: { Cookie: cookie } },
      );

      // Act : ALICE se connecte
      const response = await libTests.requester.post("/auth", {
        email: libTests.ALICE.email,
        password: libTests.ALICE.password,
      });

      // Assert
      assert.strictEqual(patchResponse.status, 200);
      assert.strictEqual(patchResponse.data.isActive, true);
      assert.strictEqual(response.status, 200);
    });

    it("should respond 200 and return the real role when deactivating another admin", async () => {
      // Arrange : 2 admins actifs, on peut en désactiver un
      const cookie = await loginAsAdmin();
      const otherAdminId = await libTests.createAccount(OTHER_ADMIN);

      // Act
      const response = await libTests.requester.patch(
        `/admin/users/${otherAdminId}`,
        { isActive: false },
        { headers: { Cookie: cookie } },
      );

      // Assert : le vrai rôle, et pas "customer" écrit en dur
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.role, "admin");
      assert.strictEqual(response.data.isActive, false);
    });

    it("should respond 400 if isActive is missing", async () => {
      // Arrange
      const cookie = await loginAsAdmin();
      const aliceId = await libTests.createAccount(libTests.ALICE);

      // Act : body vide
      const response = await libTests.requester.patch(
        `/admin/users/${aliceId}`,
        {},
        { headers: { Cookie: cookie } },
      );

      // Assert
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "État du compte invalide.");
    });

    it("should respond 400 if isActive is not a boolean", async () => {
      // Arrange
      const cookie = await loginAsAdmin();
      const aliceId = await libTests.createAccount(libTests.ALICE);

      // Act : "false" entre guillemets est un texte, pas un booléen
      const response = await libTests.requester.patch(
        `/admin/users/${aliceId}`,
        { isActive: "false" },
        { headers: { Cookie: cookie } },
      );

      // Assert : et le compte n'a pas changé
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "État du compte invalide.");
      const result = await pool.query(
        "SELECT is_active FROM account WHERE id = $1",
        [aliceId],
      );
      assert.strictEqual(result.rows[0].is_active, true);
    });

    it("should respond 404 if the account does not exist", async () => {
      // Arrange
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.patch(
        "/admin/users/99999",
        { isActive: false },
        { headers: { Cookie: cookie } },
      );

      // Assert
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data.error, "Compte introuvable.");
    });

    it("should respond 409 when deactivating the last active admin", async () => {
      // Arrange : un seul admin, qui essaie de se désactiver lui-même
      const adminId = await libTests.createAccount(ADMIN);
      const cookie = await libTests.loginAs(ADMIN);

      // Act
      const response = await libTests.requester.patch(
        `/admin/users/${adminId}`,
        { isActive: false },
        { headers: { Cookie: cookie } },
      );

      // Assert : refusé, et il est toujours actif en BDD
      assert.strictEqual(response.status, 409);
      assert.strictEqual(
        response.data.error,
        "Impossible de désactiver le dernier administrateur.",
      );
      const result = await pool.query(
        "SELECT is_active FROM account WHERE id = $1",
        [adminId],
      );
      assert.strictEqual(result.rows[0].is_active, true);
    });

    it("should respond 409 if the other admin is already deactivated", async () => {
      // Arrange : un admin désactivé ne compte pas parmi les admins actifs
      const adminId = await libTests.createAccount(ADMIN);
      await libTests.createAccount({ ...OTHER_ADMIN, isActive: false });
      const cookie = await libTests.loginAs(ADMIN);

      // Act
      const response = await libTests.requester.patch(
        `/admin/users/${adminId}`,
        { isActive: false },
        { headers: { Cookie: cookie } },
      );

      // Assert
      assert.strictEqual(response.status, 409);
    });
  });

  // ==================
  // DELETE /admin/users/:id (supprimer)
  // ==================
  describe("[DELETE] /api/admin/users/:id", () => {
    it("should respond 204 and delete the account", async () => {
      // Arrange
      const cookie = await loginAsAdmin();
      const aliceId = await libTests.createAccount(libTests.ALICE);

      // Act
      const response = await libTests.requester.delete(
        `/admin/users/${aliceId}`,
        { headers: { Cookie: cookie } },
      );

      // Assert : le compte n'est plus en BDD
      assert.strictEqual(response.status, 204);
      const result = await pool.query("SELECT id FROM account WHERE id = $1", [
        aliceId,
      ]);
      assert.strictEqual(result.rows.length, 0);
    });

    it("should keep the orders, with the buyer's identity and no owner", async () => {
      // Arrange : une commande d'ALICE, avec l'identité copiée à l'achat
      const cookie = await loginAsAdmin();
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const orderResult = await pool.query(
        `INSERT INTO purchase (total_amount, payment_method, buyer_firstname,
                               buyer_lastname, buyer_email, account_id)
         VALUES (16.9, 'virement', $1, $2, $3, $4)
         RETURNING id`,
        [
          libTests.ALICE.firstname,
          libTests.ALICE.lastname,
          libTests.ALICE.email,
          aliceId,
        ],
      );

      // Act
      const response = await libTests.requester.delete(
        `/admin/users/${aliceId}`,
        { headers: { Cookie: cookie } },
      );

      // Assert : ON DELETE SET NULL, la commande reste sans propriétaire
      assert.strictEqual(response.status, 204);
      const result = await pool.query(
        "SELECT account_id, buyer_email FROM purchase WHERE id = $1",
        [orderResult.rows[0].id],
      );
      assert.strictEqual(result.rows.length, 1);
      assert.strictEqual(result.rows[0].account_id, null);
      assert.strictEqual(result.rows[0].buyer_email, libTests.ALICE.email);
    });

    it("should respond 404 if the account does not exist", async () => {
      // Arrange
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.delete("/admin/users/99999", {
        headers: { Cookie: cookie },
      });

      // Assert
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data.error, "Compte introuvable.");
    });

    it("should respond 400 if the id is not a number", async () => {
      // Arrange
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.delete("/admin/users/abc", {
        headers: { Cookie: cookie },
      });

      // Assert : refusé par validateId
      assert.strictEqual(response.status, 400);
    });

    it("should respond 409 when deleting the last active admin", async () => {
      // Arrange : un seul admin, qui essaie de se supprimer lui-même
      const adminId = await libTests.createAccount(ADMIN);
      const cookie = await libTests.loginAs(ADMIN);

      // Act
      const response = await libTests.requester.delete(
        `/admin/users/${adminId}`,
        { headers: { Cookie: cookie } },
      );

      // Assert : refusé, et le compte est toujours en BDD
      assert.strictEqual(response.status, 409);
      assert.strictEqual(
        response.data.error,
        "Impossible de supprimer le dernier administrateur.",
      );
      const result = await pool.query("SELECT id FROM account WHERE id = $1", [
        adminId,
      ]);
      assert.strictEqual(result.rows.length, 1);
    });

    it("should respond 204 when deleting an admin if another active admin remains", async () => {
      // Arrange : 2 admins actifs
      const cookie = await loginAsAdmin();
      const otherAdminId = await libTests.createAccount(OTHER_ADMIN);

      // Act
      const response = await libTests.requester.delete(
        `/admin/users/${otherAdminId}`,
        { headers: { Cookie: cookie } },
      );

      // Assert
      assert.strictEqual(response.status, 204);
    });
  });
});
