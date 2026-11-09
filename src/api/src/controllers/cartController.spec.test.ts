import { describe, it } from "node:test";
import assert from "node:assert";
import * as libTests from "../../test/index.ts";
import { pool } from "../data/db-client.ts";

describe("cartController", () => {
  // ─── GET /api/cart ──────────────────────────────────────────────────────────

  describe("[GET] /api/cart", () => {
    it("should respond 200 with an empty array if the cart is empty", async () => {
      await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);

      const response = await libTests.requester.get("/cart", {
        headers: { Cookie: cookie },
      });

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, []);
    });

    it("should respond 200 with the cart lines and the tree details", async () => {
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const treeId = await libTests.createTree({
        name: "Pin maritime",
        price: 9.9,
        plantingLocation: "Landiras (33)",
      });
      await libTests.addCartItem(aliceId, treeId, 2);
      const cookie = await libTests.loginAs(libTests.ALICE);

      const response = await libTests.requester.get("/cart", {
        headers: { Cookie: cookie },
      });

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
      assert.strictEqual(line.price, 9.9);
      assert.strictEqual(line.plantingLocation, "Landiras (33)");
      assert.strictEqual(line.availabilityName, "disponible");
    });

    it("should respond only with the cart of the connected account", async () => {
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

      const response = await libTests.requester.get("/cart", {
        headers: { Cookie: cookie },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.length, 1);
      assert.strictEqual(response.data[0].treeId, aliceTreeId);
      assert.strictEqual(response.data[0].accountId, aliceId);
    });

    it("should respond 401 if not connected", async () => {
      const response = await libTests.requester.get("/cart");

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.data.error, "Vous devez être connecté.");
    });

    it("should respond 401 if the token is invalid", async () => {
      const response = await libTests.requester.get("/cart", {
        headers: { Cookie: "accessToken=faux-jeton" },
      });

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.data.error, "Vous devez être connecté.");
    });

    it("should respond 403 if the account was deactivated after login", async () => {
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);
      await pool.query("UPDATE account SET is_active = FALSE WHERE id = $1", [
        aliceId,
      ]);

      const response = await libTests.requester.get("/cart", {
        headers: { Cookie: cookie },
      });

      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.data.error,
        "Ce compte est désactivé, veuillez contacter l'administrateur.",
      );
    });
  });

  // ─── POST /api/cart/items ───────────────────────────────────────────────────

  describe("[POST] /api/cart/items", () => {
    it("should respond 201 and add a new line to the cart", async () => {
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const treeId = await libTests.createTree({
        name: "Chêne",
        price: 16.9,
        plantingLocation: "Bordeaux (33)",
      });
      const cookie = await libTests.loginAs(libTests.ALICE);

      const response = await libTests.requester.post(
        "/cart/items",
        {
          treeId,
          quantity: 2,
        },
        { headers: { Cookie: cookie } },
      );

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.data.accountId, aliceId);
      assert.strictEqual(response.data.treeId, treeId);
      assert.strictEqual(response.data.quantity, 2);
    });

    it("should add quantities if the tree is already in the cart", async () => {
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const treeId = await libTests.createTree({ name: "Chêne" });
      await libTests.addCartItem(aliceId, treeId, 2);
      const cookie = await libTests.loginAs(libTests.ALICE);

      const response = await libTests.requester.post(
        "/cart/items",
        {
          treeId,
          quantity: 3,
        },
        { headers: { Cookie: cookie } },
      );

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.data.quantity, 5); // 2 + 3
    });

    it("should respond 400 if quantity is 0", async () => {
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const treeId = await libTests.createTree({ name: "Chêne" });
      const cookie = await libTests.loginAs(libTests.ALICE);
      console.log(aliceId);

      const response = await libTests.requester.post(
        "/cart/items",
        {
          treeId,
          quantity: 0,
        },
        { headers: { Cookie: cookie } },
      );
      console.log(aliceId);
      assert.strictEqual(response.status, 400);
    });

    it("should respond 400 if treeId is missing", async () => {
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);
      console.log(aliceId);

      const response = await libTests.requester.post(
        "/cart/items",
        {
          quantity: 1,
        },
        { headers: { Cookie: cookie } },
      );

      assert.strictEqual(response.status, 400);
    });

    it("should respond 401 if not connected", async () => {
      const response = await libTests.requester.post("/cart/items", {
        treeId: 1,
        quantity: 1,
      });

      assert.strictEqual(response.status, 401);
    });
  });

  // ─── PATCH /api/cart/items/:treeId ──────────────────────────────────────────

  describe("[PATCH] /api/cart/items/:treeId", () => {
    it("should respond 200 and update the quantity", async () => {
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const treeId = await libTests.createTree({ name: "Hêtre" });
      await libTests.addCartItem(aliceId, treeId, 1);
      const cookie = await libTests.loginAs(libTests.ALICE);

      const response = await libTests.requester.patch(
        `/cart/items/${treeId}`,
        {
          quantity: 4,
        },
        { headers: { Cookie: cookie } },
      );

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.treeId, treeId);
      assert.strictEqual(response.data.quantity, 4);
    });

    it("should respond 404 if the tree is not in the cart", async () => {
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const treeId = await libTests.createTree({ name: "Hêtre" });
      const cookie = await libTests.loginAs(libTests.ALICE);
      console.log(aliceId);

      const response = await libTests.requester.patch(
        `/cart/items/${treeId}`,
        {
          quantity: 2,
        },
        { headers: { Cookie: cookie } },
      );

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data.error, "Ligne du panier introuvable");
    });

    it("should respond 400 if quantity is 0", async () => {
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const treeId = await libTests.createTree({ name: "Hêtre" });
      await libTests.addCartItem(aliceId, treeId, 1);
      const cookie = await libTests.loginAs(libTests.ALICE);

      const response = await libTests.requester.patch(
        `/cart/items/${treeId}`,
        {
          quantity: 0,
        },
        { headers: { Cookie: cookie } },
      );

      assert.strictEqual(response.status, 400);
    });

    it("should respond 401 if not connected", async () => {
      const treeId = await libTests.createTree({ name: "Hêtre" });

      const response = await libTests.requester.patch(`/cart/items/${treeId}`, {
        quantity: 2,
      });

      assert.strictEqual(response.status, 401);
    });
  });

  // ─── DELETE /api/cart/items/:treeId ─────────────────────────────────────────

  describe("[DELETE] /api/cart/items/:treeId", () => {
    it("should respond 204 and remove the line from the cart", async () => {
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const treeId = await libTests.createTree({ name: "Chêne" });
      await libTests.addCartItem(aliceId, treeId, 3);
      const cookie = await libTests.loginAs(libTests.ALICE);

      const response = await libTests.requester.delete(
        `/cart/items/${treeId}`,
        {
          headers: { Cookie: cookie },
        },
      );

      assert.strictEqual(response.status, 204);

      const getResponse = await libTests.requester.get("/cart", {
        headers: { Cookie: cookie },
      });
      assert.strictEqual(getResponse.data.length, 0);
    });

    it("should respond 401 if not connected", async () => {
      const treeId = await libTests.createTree({ name: "Chêne" });

      const response = await libTests.requester.delete(`/cart/items/${treeId}`);

      assert.strictEqual(response.status, 401);
    });
  });

  // ─── DELETE /api/cart/items (clear) ─────────────────────────────────────────

  describe("[DELETE] /api/cart/items", () => {
    it("should respond 204 and empty the entire cart", async () => {
      const aliceId = await libTests.createAccount(libTests.ALICE);
      const tree1 = await libTests.createTree({ name: "Chêne" });
      const tree2 = await libTests.createTree({ name: "Hêtre" });
      await libTests.addCartItem(aliceId, tree1, 1);
      await libTests.addCartItem(aliceId, tree2, 2);
      const cookie = await libTests.loginAs(libTests.ALICE);

      const response = await libTests.requester.delete("/cart/items", {
        headers: { Cookie: cookie },
      });

      assert.strictEqual(response.status, 204);

      const getResponse = await libTests.requester.get("/cart", {
        headers: { Cookie: cookie },
      });
      assert.deepStrictEqual(getResponse.data, []);
    });

    it("should respond 401 if not connected", async () => {
      const response = await libTests.requester.delete("/cart/items");

      assert.strictEqual(response.status, 401);
    });
  });
});
