import { describe, it } from "node:test";
import assert from "node:assert";
import * as libTests from "../../test/index.ts";

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

  // Test 1 : la liste admin contient aussi les arbres retirés.
  describe("[GET] /api/admin/trees", () => {
    it("should include withdrawn trees in the admin list", async () => {
      // Prépare un arbre retiré dans la base de test.
      const treeId = await libTests.createTree({
        name: "Chêne retiré",
        availability: "retiré",
      });

      // Crée le compte admin et récupère son cookie de connexion.
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

  // Test 2 : après une modification du prix, les autres champs restent inchangés.
  describe("[POST et PATCH] /api/admin/trees", () => {
    it("should keep the other fields unchanged when updating only the price", async () => {
      // Prépare une catégorie et une disponibilité dans la base de test.
      await libTests.createTree({ name: "Arbre de préparation" });
      const categoryId = await libTests.getCategoryId("Feuillage caduc");

      // Crée le compte admin et récupère son cookie de connexion.
      await libTests.createAccount(ADMIN_TEST_ACCOUNT);
      const cookie = await libTests.loginAs(ADMIN_TEST_ACCOUNT);
      const headers = { headers: { Cookie: cookie } };

      // Récupère l'id de la disponibilité « disponible ».
      const availabilityResponse = await libTests.requester.get(
        "/admin/availabilities",
        headers,
      );
      const available = availabilityResponse.data.find(
        (item: { id: number; name: string }) => item.name === "disponible",
      );
      assert.ok(available, "La disponibilité « disponible » doit exister.");

      // Prépare les données de l'arbre à créer.
      const treeToCreate = {
        name: "Érable de test F7",
        description: "Description de départ",
        price: 12.5,
        photoUrl: "/images/trees/erable-test.webp",
        plantingLocation: "Bretagne",
        categoryId,
        availabilityId: available.id,
      };

      // Crée l'arbre avec la route POST.
      const createResponse = await libTests.requester.post(
        "/admin/trees",
        treeToCreate,
        headers,
      );
      assert.strictEqual(createResponse.status, 201);

      // Modifie uniquement le prix avec la route PATCH.
      const treeId = createResponse.data.id;
      const updateResponse = await libTests.requester.patch(
        `/admin/trees/${treeId}`,
        { price: 15 },
        headers,
      );

      // Vérifie que la modification a réussi et que le prix a changé.
      assert.strictEqual(updateResponse.status, 200);
      assert.strictEqual(updateResponse.data.price, 15);

      // Vérifie que les autres champs n'ont pas changé.
      assert.strictEqual(updateResponse.data.name, treeToCreate.name);
      assert.strictEqual(
        updateResponse.data.description,
        treeToCreate.description,
      );
      assert.strictEqual(updateResponse.data.photoUrl, treeToCreate.photoUrl);
      assert.strictEqual(
        updateResponse.data.plantingLocation,
        treeToCreate.plantingLocation,
      );
      assert.strictEqual(updateResponse.data.categoryId, categoryId);
      assert.strictEqual(updateResponse.data.availabilityId, available.id);
    });
  });
});
