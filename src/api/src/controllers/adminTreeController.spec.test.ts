import { describe, it } from "node:test";
import assert from "node:assert";
import * as libTests from "../../test/index.ts";
import { pool } from "../data/db-client.ts";

describe("adminTreeController", () => {
  // Compte admin dédié aux tests F7.
  const ADMIN_TEST_ACCOUNT = {
    firstname: "Admin",
    lastname: "Test F7",
    email: "admin-f7@test.fr",
    password: "MotDePasse123!",
    role: "admin" as const,
    isActive: true,
  };

  // Prépare un compte admin et des champs valides pour créer un arbre.
  async function prepareAdminAndTreeInput() {
    // Crée la catégorie et la disponibilité dans la base de test.
    await libTests.createTree({ name: "Arbre de préparation" });
    const categoryId = await libTests.getCategoryId("Feuillage caduc");

    const availabilityResult = await pool.query(
      "SELECT id FROM availability WHERE name = $1",
      ["disponible"],
    );
    const availabilityId = availabilityResult.rows[0].id;

    // Crée l'admin et récupère son cookie de connexion.
    await libTests.createAccount(ADMIN_TEST_ACCOUNT);
    const cookie = await libTests.loginAs(ADMIN_TEST_ACCOUNT);
    const headers = { headers: { Cookie: cookie } };

    // Prépare les champs valides que les tests pourront utiliser.
    const validTreeInput = {
      name: "Érable de test F7",
      description: "Description de départ",
      price: 12.5,
      photoUrl: "/images/trees/erable-test.webp",
      plantingLocation: "Bretagne",
      categoryId,
      availabilityId,
    };

    return { headers, validTreeInput };
  }

  // Test 1 : la liste admin contient aussi les arbres retirés.
  describe("[GET] /api/admin/trees", () => {
    it("test 1 - should include withdrawn trees in the admin list", async () => {
      // Prépare un arbre retiré dans la base de test.
      const treeId = await libTests.createTree({
        name: "Chêne retiré",
        availability: "retiré",
      });

      // Crée le compte admin et récupère son cookie.
      await libTests.createAccount(ADMIN_TEST_ACCOUNT);
      const cookie = await libTests.loginAs(ADMIN_TEST_ACCOUNT);

      // Appelle la liste admin en envoyant le cookie.
      const response = await libTests.requester.get("/admin/trees", {
        headers: { Cookie: cookie },
      });

      // Vérifie que la route répond correctement.
      assert.strictEqual(response.status, 200);

      // Vérifie que l'arbre retiré apparaît dans la liste.
      const withdrawnTreeIsListed = response.data.some(
        (tree: { id: number }) => tree.id === treeId,
      );
      assert.ok(withdrawnTreeIsListed);
    });
  });

  // Test 2 : créer un arbre puis modifier son prix ne change pas ses autres champs.
  describe("[POST et PATCH] /api/admin/trees", () => {
    it("test 2 - should keep the other fields unchanged when updating only the price", async () => {
      // Prépare l'admin et les champs valides de l'arbre.
      const { headers, validTreeInput } = await prepareAdminAndTreeInput();

      // Crée l'arbre testé avec la route POST.
      const createResponse = await libTests.requester.post(
        "/admin/trees",
        validTreeInput,
        headers,
      );
      assert.strictEqual(createResponse.status, 201);

      // Récupère l'identifiant de l'arbre créé.
      const treeId = createResponse.data.id;

      // Modifie uniquement le prix de cet arbre avec PATCH.
      const updateResponse = await libTests.requester.patch(
        `/admin/trees/${treeId}`,
        { price: 15 },
        headers,
      );

      // Vérifie que la modification du prix a réussi.
      assert.strictEqual(updateResponse.status, 200);
      assert.strictEqual(updateResponse.data.price, 15);

      // Vérifie que les autres champs sont restés identiques.
      assert.strictEqual(updateResponse.data.name, validTreeInput.name);
      assert.strictEqual(
        updateResponse.data.description,
        validTreeInput.description,
      );
      assert.strictEqual(updateResponse.data.photoUrl, validTreeInput.photoUrl);
      assert.strictEqual(
        updateResponse.data.plantingLocation,
        validTreeInput.plantingLocation,
      );
      assert.strictEqual(
        updateResponse.data.categoryId,
        validTreeInput.categoryId,
      );
      assert.strictEqual(
        updateResponse.data.availabilityId,
        validTreeInput.availabilityId,
      );
    });
  });

  // Tests 3 et 4 : les routes admin refusent les personnes non autorisées.
  describe("[GET] /api/admin/trees : accès", () => {
    // Compte client dédié au test 4.
    const CUSTOMER_TEST_ACCOUNT = {
      firstname: "Client",
      lastname: "Test F7",
      email: "client-f7@test.fr",
      password: "MotDePasse123!",
      role: "customer" as const,
      isActive: true,
    };

    // Test 3 : sans connexion, la route répond 401.
    it("test 3 - should respond 401 if the requester is not connected", async () => {
      // Appelle la route sans envoyer de cookie.
      const response = await libTests.requester.get("/admin/trees");

      // Vérifie que la connexion est requise.
      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.data.error, "Vous devez être connecté.");
    });

    // Test 4 : avec un compte client, la route répond 403.
    it("test 4 - should respond 403 if the requester is a customer", async () => {
      // Crée le compte client et récupère son cookie de connexion.
      await libTests.createAccount(CUSTOMER_TEST_ACCOUNT);
      const cookie = await libTests.loginAs(CUSTOMER_TEST_ACCOUNT);

      // Appelle la route avec le cookie du client.
      const response = await libTests.requester.get("/admin/trees", {
        headers: { Cookie: cookie },
      });

      // Vérifie que le client connecté n'a pas les droits admin.
      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.data.error,
        "Accès réservé à l'administrateur.",
      );
    });
  });

  // Test 5 : un identifiant valide mais inconnu répond 404.
  describe("[GET] /api/admin/trees/:id", () => {
    it("test 5 - should respond 404 if the tree does not exist", async () => {
      // Crée l'admin et récupère son cookie.
      await libTests.createAccount(ADMIN_TEST_ACCOUNT);
      const cookie = await libTests.loginAs(ADMIN_TEST_ACCOUNT);

      // Demande un arbre qui n'existe pas.
      const response = await libTests.requester.get("/admin/trees/999999", {
        headers: { Cookie: cookie },
      });

      // Vérifie que l'arbre est introuvable.
      assert.strictEqual(response.status, 404);
    });
  });

  // Test 6 : un arbre valide est créé et renvoyé avec le statut 201.
  describe("[POST] /api/admin/trees", () => {
    it("test 6 - should create a tree and return it", async () => {
      // Prépare l'admin et les champs valides de l'arbre.
      const { headers, validTreeInput } = await prepareAdminAndTreeInput();

      // Crée l'arbre.
      const response = await libTests.requester.post(
        "/admin/trees",
        validTreeInput,
        headers,
      );

      // Vérifie que l'arbre a été créé et qu'il est renvoyé.
      assert.strictEqual(response.status, 201);
      assert.ok(response.data.id);
      assert.strictEqual(response.data.name, validTreeInput.name);
      assert.strictEqual(response.data.price, validTreeInput.price);
    });
  });

  // Tests 7 à 11 : un body invalide répond 400.
  describe("[POST] /api/admin/trees : champs invalides", () => {
    // Test 7 : un nom vide répond 400.
    it("test 7 - should respond 400 if the name is empty", async () => {
      const { headers, validTreeInput } = await prepareAdminAndTreeInput();

      const response = await libTests.requester.post(
        "/admin/trees",
        { ...validTreeInput, name: "   " },
        headers,
      );

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "Le nom est obligatoire.");
    });

    // Test 8 : un prix négatif répond 400.
    it("test 8 - should respond 400 if the price is negative", async () => {
      const { headers, validTreeInput } = await prepareAdminAndTreeInput();

      const response = await libTests.requester.post(
        "/admin/trees",
        { ...validTreeInput, price: -1 },
        headers,
      );

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "Le prix doit être positif.");
    });

    // Test 9 : une photo provenant d'un autre site répond 400.
    it("test 9 - should respond 400 if the photo URL is not a local tree path", async () => {
      const { headers, validTreeInput } = await prepareAdminAndTreeInput();

      const response = await libTests.requester.post(
        "/admin/trees",
        {
          ...validTreeInput,
          photoUrl: "https://example.com/arbre.webp",
        },
        headers,
      );

      assert.strictEqual(response.status, 400);
      assert.strictEqual(
        response.data.error,
        "Le chemin de la photo doit commencer par /images/trees/.",
      );
    });

    // Test 10 : une catégorie inconnue répond 400.
    it("test 10 - should respond 400 if the category does not exist", async () => {
      const { headers, validTreeInput } = await prepareAdminAndTreeInput();

      const response = await libTests.requester.post(
        "/admin/trees",
        { ...validTreeInput, categoryId: 999999999 },
        headers,
      );

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "Catégorie invalide.");
    });

    // Test 11 : une disponibilité inconnue répond 400.
    it("test 11 - should respond 400 if the availability does not exist", async () => {
      const { headers, validTreeInput } = await prepareAdminAndTreeInput();

      const response = await libTests.requester.post(
        "/admin/trees",
        { ...validTreeInput, availabilityId: 999999999 },
        headers,
      );

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "Disponibilité invalide.");
    });
  });

  // Tests 12 et 13 : la suppression dépend de l'historique de commande.
  describe("[DELETE] /api/admin/trees/:id", () => {
    // Test 12 : un arbre jamais commandé est supprimé avec le statut 204.
    it("test 12 - should delete a tree that has never been ordered", async () => {
      // Crée un arbre qui n'est associé à aucune commande.
      const treeId = await libTests.createTree({
        name: "Chêne jamais commandé",
      });

      // Crée l'admin et récupère son cookie.
      await libTests.createAccount(ADMIN_TEST_ACCOUNT);
      const cookie = await libTests.loginAs(ADMIN_TEST_ACCOUNT);

      // Demande la suppression de l'arbre.
      const response = await libTests.requester.delete(
        `/admin/trees/${treeId}`,
        { headers: { Cookie: cookie } },
      );

      // Vérifie que la suppression a réussi sans contenu en réponse.
      assert.strictEqual(response.status, 204);
    });

    // Test 13 : un arbre déjà commandé n'est pas supprimé et répond 409.
    it("test 13 - should respond 409 if the tree has already been ordered", async () => {
      // Crée l'arbre qui sera ajouté à une commande.
      const treeId = await libTests.createTree({
        name: "Chêne commandé",
      });

      // Crée une commande de test.
      const purchaseResult = await pool.query(
        `INSERT INTO purchase (
          total_amount,
          payment_method,
          buyer_firstname,
          buyer_lastname,
          buyer_email
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [
          10,
          "virement",
          ADMIN_TEST_ACCOUNT.firstname,
          ADMIN_TEST_ACCOUNT.lastname,
          ADMIN_TEST_ACCOUNT.email,
        ],
      );
      const purchaseId = purchaseResult.rows[0].id;

      // Ajoute l'arbre à cette commande.
      await pool.query(
        `INSERT INTO purchase_line (
          purchase_id,
          tree_id,
          tree_name,
          unit_price,
          planting_location,
          quantity
        )
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [purchaseId, treeId, "Chêne commandé", 10, null, 1],
      );

      // Crée l'admin et récupère son cookie.
      await libTests.createAccount(ADMIN_TEST_ACCOUNT);
      const cookie = await libTests.loginAs(ADMIN_TEST_ACCOUNT);

      // Demande la suppression de l'arbre déjà commandé.
      const response = await libTests.requester.delete(
        `/admin/trees/${treeId}`,
        { headers: { Cookie: cookie } },
      );

      // Vérifie que l'API refuse la suppression avec le statut 409.
      assert.strictEqual(response.status, 409);
      assert.strictEqual(
        response.data.error,
        "Cet arbre a déjà été commandé : passez-le à « retiré ».",
      );
    });
  });

  // Test 14 : les disponibilités sont présentes et leurs ids sont triés.
  describe("[GET] /api/admin/availabilities", () => {
    it("test 14 - should return availabilities ordered by id", async () => {
      // Crée des arbres pour garantir que les trois disponibilités existent.
      await libTests.createTree({
        name: "Arbre disponible",
        availability: "disponible",
      });
      await libTests.createTree({
        name: "Arbre en rupture",
        availability: "en rupture de stock",
      });
      await libTests.createTree({
        name: "Arbre retiré",
        availability: "retiré",
      });

      // Crée l'admin et récupère son cookie.
      await libTests.createAccount(ADMIN_TEST_ACCOUNT);
      const cookie = await libTests.loginAs(ADMIN_TEST_ACCOUNT);

      // Récupère toutes les disponibilités.
      const response = await libTests.requester.get("/admin/availabilities", {
        headers: { Cookie: cookie },
      });

      // Vérifie que la route répond correctement.
      assert.strictEqual(response.status, 200);

      // Vérifie que les trois disponibilités attendues sont renvoyées.
      const availabilityNames = response.data.map(
        (availability: { name: string }) => availability.name,
      );
      assert.deepStrictEqual(
        [...availabilityNames].sort(),
        ["disponible", "en rupture de stock", "retiré"].sort(),
      );

      // Vérifie que les disponibilités sont triées par id croissant.
      const availabilityIds = response.data.map(
        (availability: { id: number }) => availability.id,
      );
      const sortedIds = [...availabilityIds].sort((a, b) => a - b);
      assert.deepStrictEqual(availabilityIds, sortedIds);
    });
  });
});
