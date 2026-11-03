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

    // Ne doit retourner que les arbres disponibles
    it("should return only available trees", async () => {
      // Arrange : 2 arbres disponibles, 1 en rupture de stock, 1 retiré
      await libTests.createTree({ name: "Érable" });
      await libTests.createTree({ name: "Hêtre" });
      await libTests.createTree({
        name: "Tilleul",
        availability: "en rupture de stock",
      });
      await libTests.createTree({
        name: "Chêne",
        availability: "retiré",
      });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees/featured");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et ne renvoie que les arbres disponibles
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.length, 2);
    });

    // Doit trier les arbres par id décroissant (le plus récent en premier)
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

    // Doit répondre 200 avec un tableau vide quand il n'y a aucun arbre
    it("should return 200 with empty array when no trees", async () => {
      // Arrange : aucun arbre en BDD

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees/featured");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et renvoie un tableau vide
      assert.strictEqual(httpResponse.status, 200);
      assert.deepStrictEqual(body, []);
    });

    // Doit répondre 200 avec un tableau vide quand aucun arbre n'est disponible
    it("should return 200 with empty array when no available trees", async () => {
      // Arrange : 2 arbres en rupture de stock, 1 retiré
      await libTests.createTree({
        name: "Tilleul",
        availability: "en rupture de stock",
      });
      await libTests.createTree({
        name: "Chêne",
        availability: "retiré",
      });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees/featured");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et renvoie un tableau vide
      assert.strictEqual(httpResponse.status, 200);
      assert.deepStrictEqual(body, []);
    });

    // Doit renvoyer les 3 arbres disponibles les plus récents quand il y en a plus de 3
    it("should return the most recent available trees when more than 3 available trees exist", async () => {
      // Arrange : 4 arbres disponibles en BDD, un de plus que la limite
      const tree1Id = await libTests.createTree({ name: "Érable" });
      const tree2Id = await libTests.createTree({ name: "Hêtre" });
      const tree3Id = await libTests.createTree({ name: "Tilleul" });
      const tree4Id = await libTests.createTree({ name: "Chêne" });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees/featured");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et ne renvoie que les 3 arbres les plus récents
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.length, 3);
      assert.strictEqual(body[0].id, tree4Id);
      assert.strictEqual(body[1].id, tree3Id);
      assert.strictEqual(body[2].id, tree2Id);

      // Assert : le plus ancien (Érable) n'est plus dans la réponse
      // map : un tableau qui ne contient que les id des arbres renvoyés
      // includes : true si tree1Id est dans ce tableau → on attend false (le « ! »)
      const ids = body.map((tree: { id: number }) => tree.id);
      assert.ok(!ids.includes(tree1Id));
    });
  });

  // Test de la route trees
  describe("[GET] /api/trees", () => {
    // Doit renvoyer tous les arbres sauf les retirés
    it("should return all trees except withdrawn trees", async () => {
      // Arrange : 2 arbres disponibles, 1 en rupture de stock, 1 retiré
      await libTests.createTree({ name: "Érable" });
      await libTests.createTree({ name: "Hêtre" });
      await libTests.createTree({
        name: "Tilleul",
        availability: "en rupture de stock",
      });
      await libTests.createTree({
        name: "Chêne",
        availability: "retiré",
      });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et ne renvoie que les arbres disponibles et en rupture de stock
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.length, 3);
    });

    // Doit trier les arbres par id croissant (ordre d'ajout au catalogue)
    it("should return trees ordered by id ASC", async () => {
      // Arrange : 3 arbres disponibles avec des IDs différents
      const tree1Id = await libTests.createTree({ name: "Érable" });
      const tree2Id = await libTests.createTree({ name: "Hêtre" });
      const tree3Id = await libTests.createTree({ name: "Tilleul" });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et les arbres sont triés par ID croissant
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.length, 3);
      assert.strictEqual(body[0].id, tree1Id);
      assert.strictEqual(body[1].id, tree2Id);
      assert.strictEqual(body[2].id, tree3Id);
    });

    // Doit répondre 200 avec un tableau vide quand il n'y a aucun arbre
    it("should return 200 with empty array when no trees", async () => {
      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et renvoie un tableau vide
      assert.strictEqual(httpResponse.status, 200);
      assert.deepStrictEqual(body, []);
    });
  });

  // Test de la recherche par nom
  describe("[GET] /api/trees?search=:search", () => {
    // Doit trouver un nom partiel, sans tenir compte des accents ni des majuscules
    it("should find a partial name, ignoring accents and case", async () => {
      // Arrange : 1 arbre qui correspond, 1 qui ne correspond pas
      await libTests.createTree({ name: "Chêne pédonculé" });
      await libTests.createTree({ name: "Tilleul" });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees?search=CHENE");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : seul le chêne est renvoyé
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.length, 1);
      assert.strictEqual(body[0].name, "Chêne pédonculé");
    });

    // Doit combiner la recherche et le filtre par catégorie
    it("should combine search and category", async () => {
      // Arrange : 2 « pin » résineux, 1 « pin » dans une autre catégorie (Feuillage caduc par défaut)
      await libTests.createTree({ name: "Pin maritime", category: "Résineux" });
      await libTests.createTree({ name: "Sapin", category: "Résineux" });
      await libTests.createTree({ name: "Pin à feuilles" });
      const categoryId = await libTests.getCategoryId("Résineux");

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get(
        `/trees?search=pin&category=${categoryId}`,
      );
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : seuls les 2 résineux sont renvoyés, triés par id
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.length, 2);
      assert.strictEqual(body[0].name, "Pin maritime");
      assert.strictEqual(body[1].name, "Sapin");
    });

    // Doit écarter les arbres retirés, mais garder ceux en rupture de stock
    it("should exclude withdrawn trees", async () => {
      // Arrange : 1 érable retiré, 1 érable en rupture de stock
      await libTests.createTree({
        name: "Érable plane",
        availability: "retiré",
      });
      await libTests.createTree({
        name: "Érable champêtre",
        availability: "en rupture de stock",
      });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees?search=erable");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : seul l'érable en rupture de stock est renvoyé
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.length, 1);
      assert.strictEqual(body[0].name, "Érable champêtre");
    });

    // Doit répondre 200 avec un tableau vide quand aucun nom ne correspond
    it("should return 200 with empty array when no match", async () => {
      // Arrange : 1 arbre qui ne correspond pas à la recherche
      await libTests.createTree({ name: "Tilleul" });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get("/trees?search=baobab");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : La route répond et renvoie un tableau vide
      assert.strictEqual(httpResponse.status, 200);
      assert.deepStrictEqual(body, []);
    });

    // Doit chercher % comme un simple caractère, pas comme un joker
    it("should treat % as plain text", async () => {
      // Arrange : 1 arbre sans % dans son nom
      await libTests.createTree({ name: "Tilleul" });

      // Act : %25 est le caractère % encodé dans l'URL
      const httpResponse = await libTests.requester.get("/trees?search=%25");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : sans échappement, % trouverait tous les arbres
      assert.strictEqual(httpResponse.status, 200);
      assert.deepStrictEqual(body, []);
    });

    // Doit renvoyer tout le catalogue quand la recherche est vide
    it("should return all trees when search is empty", async () => {
      // Arrange : 2 arbres disponibles
      await libTests.createTree({ name: "Érable" });
      await libTests.createTree({ name: "Hêtre" });

      // Act : Appelle la route avec une recherche vide
      const httpResponse = await libTests.requester.get("/trees?search=");
      const body = httpResponse.data; // le JSON renvoyé (tableau d'arbres)

      // Assert : une recherche vide ne filtre pas
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.length, 2);
    });

    // Doit répondre 400 si search est présent plusieurs fois dans l'URL
    it("should return 400 and error: repeated search", async () => {
      // Act : ?search=a&search=b donne un tableau, pas un texte
      const httpResponse = await libTests.requester.get(
        "/trees?search=a&search=b",
      );
      const body = httpResponse.data; // le JSON renvoyé (l'erreur)

      // Assert : La route répond 400 et renvoie le message de validateSearchQuery (commonMiddleware.ts)
      assert.strictEqual(httpResponse.status, 400);
      assert.strictEqual(
        body.error,
        "Recherche invalide : un seul texte de 100 caractères maximum",
      );
    });
  });

  // Test de la route de la fiche arbre
  describe("[GET] /api/trees/:id", () => {
    // Doit répondre 200 et renvoyer l'arbre (avec sa description) s'il est disponible
    it("should return 200 and description if tree is available", async () => {
      // Arrange : 1 arbre disponible, avec une description (null par défaut dans createTree)
      const treeId = await libTests.createTree({
        name: "Érable",
        description: "Un arbre aux belles couleurs d'automne",
      });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get(`/trees/${treeId}`);
      const body = httpResponse.data; // le JSON renvoyé (l'arbre)

      // Assert : La route répond et renvoie l'arbre avec son id et sa description
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(body.id, treeId);
      assert.strictEqual(body.name, "Érable");
      assert.strictEqual(
        body.description,
        "Un arbre aux belles couleurs d'automne",
      );
    });

    // Doit répondre 404 si l'arbre est retiré du catalogue
    it("should return 404 if tree is withdrawn", async () => {
      // Arrange : 1 arbre retiré
      const treeId = await libTests.createTree({
        name: "Chêne",
        availability: "retiré",
      });

      // Act : Appelle la route comme le ferait le front
      const httpResponse = await libTests.requester.get(`/trees/${treeId}`);

      // Assert : La route répond 404
      assert.strictEqual(httpResponse.status, 404);
    });

    // Doit répondre 404 si aucun arbre n'a cet id
    it("should return 404 if id does not exist", async () => {
      // Act : Appelle la route avec un id valide mais absent de la BDD (vide ici)
      const httpResponse = await libTests.requester.get(`/trees/999`);

      // Assert : La route répond 404
      assert.strictEqual(httpResponse.status, 404);
    });

    // Doit répondre 400 avec un message d'erreur si l'id n'est pas valide
    it("should return 400 and error: invalid id", async () => {
      // Act : Appelle la route comme le ferait le front avec un id non numérique
      const httpResponse = await libTests.requester.get(`/trees/abc`);
      const body = httpResponse.data; // le JSON renvoyé (l'erreur)

      // Assert : La route répond 400 et renvoie le message de validateId (commonMiddleware.ts)
      assert.strictEqual(httpResponse.status, 400);
      assert.strictEqual(body.error, "Identifiant invalide");
    });
  });
});
