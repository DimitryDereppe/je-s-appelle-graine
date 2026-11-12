import { describe, it, mock } from "node:test";
import assert from "node:assert";
import * as libTests from "../../test/index.ts";
import { pool } from "../data/db-client.ts";

// Test d'intégration : requête HTTP et BDD de test (vidée avant chaque test)
// Routes admin des commandes
describe("adminOrderController", () => {
  // --------------------------------
  // comptes et données de test
  // --------------------------------
  const ADMIN = {
    ...libTests.ALICE, // ... recopie les champs d'ALICE ;
    firstname: "Ada",
    lastname: "Admin",
    email: "admin@test.fr",
    role: "admin" as const, // as const : TypeScript garde le type "admin"
  };
  const billingAddress = "12 rue des Chênes, 35380 Paimpont";

  //** crée ADMIN, le connecte et renvoie son cookie
  async function loginAsAdmin(): Promise<string> {
    await libTests.createAccount(ADMIN);
    return libTests.loginAs(ADMIN);
  }

  //** ALICE passe une commande de 2 chênes à 16,90 € (total : 33,80 €) et renvoie son id
  async function createOrder(): Promise<number> {
    // ALICE n'est créée qu'une fois par test, même pour plusieurs commandes :
    // l'email est unique en BDD, une 2e création serait refusée
    // on cherche d'abord ALICE : rows vaut [{ id }] si elle existe, [] sinon
    const existing = await pool.query(
      "SELECT id FROM account WHERE email = $1",
      [libTests.ALICE.email],
    );

    const aliceId =
      // rows[0]?.id : son id, ou undefined si rows[0] est vide
      // ?? : si c'est undefined, on la crée (la partie droite)
      existing.rows[0]?.id ?? (await libTests.createAccount(libTests.ALICE));
    const oakId = await libTests.createTree({
      name: "Chêne pédonculé",
      price: 16.9,
      plantingLocation: "Forêt de Brocéliande — Paimpont (35)",
    });
    await libTests.addCartItem(aliceId, oakId, 2);
    const cookie = await libTests.loginAs(libTests.ALICE);

    // mock.method : remplace console.log par une fonction vide (() => {}) pendant la commande
    // pour que l'email de confirmation ne s'affiche pas au milieu des résultats des tests
    const consoleLog = mock.method(console, "log", () => {});

    // création de la commande
    try {
      const response = await libTests.requester.post(
        "/orders",
        { paymentMethod: "virement", paymentCommitment: true, billingAddress },
        { headers: { Cookie: cookie } },
      );
      return response.data.id;
    } finally {
      // finally : s'exécute toujours même si la requête échoue
      // restore remet le vrai console.log pour les tests suivants
      consoleLog.mock.restore();
    }
  }

  //** change le statut en BDD
  async function setStatus(orderId: number, status: string) {
    await pool.query("UPDATE purchase SET status = $2 WHERE id = $1", [
      orderId,
      status,
    ]);
  }

  //** recule la date de commande pour tester isLate
  async function setOrderAge(orderId: number, days: number) {
    await pool.query(
      "UPDATE purchase SET purchase_date = now() - make_interval(days => $2) WHERE id = $1",
      [orderId, days],
    );
  }

  //** l'admin change le statut d'une commande : PATCH /api/admin/orders/:id/status
  // cookie : celui d'un compte connecté (admin dans les tests)
  // orderId : number | string, pour tester aussi un id invalide comme "abc"
  function patchStatus(
    orderId: number | string,
    status: string,
    cookie: string,
  ) {
    return libTests.requester.patch(
      `/admin/orders/${orderId}/status`,
      { status },
      { headers: { Cookie: cookie } },
    );
  }

  // ==================
  // Vérification des droits (communs aux 3 routes, vérifiés sur la liste)
  // ==================
  describe("Access rights", () => {
    it("should respond 401 if not connected", async () => {
      // Act
      const response = await libTests.requester.get("/admin/orders");

      // Assert
      assert.strictEqual(response.status, 401);
    });

    it("should respond 403 for a customer", async () => {
      // Arrange
      await libTests.createAccount(libTests.ALICE);
      const cookie = await libTests.loginAs(libTests.ALICE);

      // Act
      const response = await libTests.requester.get("/admin/orders", {
        headers: { Cookie: cookie },
      });

      // Assert
      assert.strictEqual(response.status, 403);
    });
  });

  // ==================
  // GET /admin/orders (liste, filtre, retards)
  // ==================
  describe("[GET] /api/admin/orders", () => {
    it("should respond 200 with the orders, the most recent first, with the fields of the contract", async () => {
      // Arrange : deux commandes, la première passée il y a 2 jours
      const firstId = await createOrder();
      const secondId = await createOrder();
      await setOrderAge(firstId, 2);
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.get("/admin/orders", {
        headers: { Cookie: cookie },
      });

      // Assert : la plus récente d'abord, exactement les champs
      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(
        response.data.map((order: { id: number }) => order.id),
        [secondId, firstId],
      );

      // Object.keys donne la liste des noms des champs et sort trie par ordre alphabétique,
      // pour que la comparaison ne dépende pas de l'ordre des colonnes du SELECT
      assert.deepStrictEqual(Object.keys(response.data[0]).sort(), [
        "buyerEmail",
        "buyerFirstname",
        "buyerLastname",
        "id",
        "isLate",
        "purchaseDate",
        "status",
        "totalAmount",
      ]);
      assert.strictEqual(response.data[0].buyerEmail, libTests.ALICE.email);
      assert.strictEqual(response.data[0].totalAmount, 33.8);
    });

    it("should filter the orders by status", async () => {
      // Arrange : une commande payée et une en attente
      const paidId = await createOrder();
      await createOrder();
      await setStatus(paidId, "payée");
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.get(
        "/admin/orders?status=payée",
        { headers: { Cookie: cookie } },
      );

      // Assert : seulement la commande payée
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.length, 1);
      assert.strictEqual(response.data[0].id, paidId);
    });

    it("should respond 400 if the status filter is unknown", async () => {
      // Arrange
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.get(
        "/admin/orders?status=livrée",
        { headers: { Cookie: cookie } },
      );

      // Assert
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "Statut invalide.");
    });

    it("should mark as late an order waiting for payment for more than 10 days", async () => {
      // Arrange : une commande en attente depuis 11 jours, une en attente depuis 2 jours et une payée depuis 11 jours
      const lateId = await createOrder();
      const recentId = await createOrder();
      const paidId = await createOrder();
      await setOrderAge(lateId, 11);
      await setOrderAge(recentId, 2);
      await setOrderAge(paidId, 11);
      await setStatus(paidId, "payée");
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.get("/admin/orders", {
        headers: { Cookie: cookie },
      });

      // Assert : seule la commande en attente depuis plus de 10 jours est en retard
      const isLateById = (id: number) =>
        response.data.find((order: { id: number }) => order.id === id).isLate;
      assert.strictEqual(isLateById(lateId), true);
      assert.strictEqual(isLateById(recentId), false);
      assert.strictEqual(isLateById(paidId), false);
    });
  });

  // ==================
  // GET /admin/orders/:id (détail)
  // ==================
  describe("[GET] /api/admin/orders/:id", () => {
    it("should respond 200 with the order, its buyer, its due date and its lines", async () => {
      // Arrange
      const orderId = await createOrder();
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.get(
        `/admin/orders/${orderId}`,
        { headers: { Cookie: cookie } },
      );

      // Assert :
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.id, orderId);
      assert.strictEqual(response.data.billingAddress, billingAddress);
      assert.strictEqual(response.data.paymentMethod, "virement");
      // date limite au format "AAAA-MM-JJ" (ex. "2026-11-20"), vérifié avec une expression régulière :
      // ^ et $ : début et fin du texte ; \d{4} : 4 chiffres ; - : un tiret ; \d{2} : 2 chiffres
      // on vérifie le format, pas la valeur : elle dépend du jour où le test tourne
      assert.match(response.data.dueDate, /^\d{4}-\d{2}-\d{2}$/);
      assert.strictEqual(response.data.paidAt, null);
      assert.deepStrictEqual(response.data.lines, [
        {
          treeName: "Chêne pédonculé",
          unitPrice: 16.9,
          quantity: 2,
          plantingLocation: "Forêt de Brocéliande — Paimpont (35)",
        },
      ]);
    });

    it("should respond 404 for an unknown order", async () => {
      // Arrange
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.get("/admin/orders/999999", {
        headers: { Cookie: cookie },
      });

      // Assert
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data.error, "Commande introuvable.");
    });

    it("should respond 400 if the id is not a positive integer", async () => {
      // Arrange
      const cookie = await loginAsAdmin();

      // Act
      const response = await libTests.requester.get("/admin/orders/abc", {
        headers: { Cookie: cookie },
      });

      // Assert : refusé par validateId
      assert.strictEqual(response.status, 400);
    });
  });

  // ==================
  // PATCH /admin/orders/:id/status (changement de statut)
  // ==================
  describe("[PATCH] /api/admin/orders/:id/status", () => {
    it("should respond 200, save the status and its date when an order is paid", async () => {
      // Arrange
      const orderId = await createOrder();
      const cookie = await loginAsAdmin();
      // console.log coupé : l'email de paiement ne s'affiche pas (il est vérifié plus bas, dans les emails)
      const consoleLog = mock.method(console, "log", () => {});

      try {
        // Act
        const response = await patchStatus(orderId, "payée", cookie);

        // Assert : la réponse est la commande relue, avec son nouveau statut et sa date
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.status, "payée");
        assert.notStrictEqual(response.data.paidAt, null);
        // en BDD aussi
        const purchase = await pool.query(
          "SELECT status, paid_at FROM purchase WHERE id = $1",
          [orderId],
        );
        assert.strictEqual(purchase.rows[0].status, "payée");
        assert.notStrictEqual(purchase.rows[0].paid_at, null);
      } finally {
        consoleLog.mock.restore();
      }
    });

    it("should respond 200 and keep the payment date when a paid order is planted", async () => {
      // Arrange : commande déjà payée par la route
      const orderId = await createOrder();
      const cookie = await loginAsAdmin();
      // console.log coupé : les emails de paiement et de plantation ne s'affichent pas
      const consoleLog = mock.method(console, "log", () => {});

      try {
        await patchStatus(orderId, "payée", cookie);

        // Act
        const response = await patchStatus(orderId, "plantée", cookie);

        // Assert : plantée, avec la date de plantation, et la date de paiement gardée
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.status, "plantée");
        assert.notStrictEqual(response.data.plantedAt, null);
        assert.notStrictEqual(response.data.paidAt, null);
      } finally {
        consoleLog.mock.restore();
      }
    });

    it("should respond 409 for a forbidden change, and keep the status", async () => {
      // Arrange : une commande en attente ne peut pas être plantée (pas encore payée)
      const orderId = await createOrder();
      const cookie = await loginAsAdmin();

      // Act
      const response = await patchStatus(orderId, "plantée", cookie);

      // Assert
      assert.strictEqual(response.status, 409);
      assert.strictEqual(
        response.data.error,
        "Une commande « en attente » ne peut pas passer à « plantée ».",
      );
      const purchase = await pool.query(
        "SELECT status FROM purchase WHERE id = $1",
        [orderId],
      );
      assert.strictEqual(purchase.rows[0].status, "en attente");
    });

    it("should respond 409 when changing a planted order", async () => {
      // Arrange
      const orderId = await createOrder();
      await setStatus(orderId, "plantée");
      const cookie = await loginAsAdmin();

      // Act
      const response = await patchStatus(orderId, "annulée", cookie);

      // Assert
      assert.strictEqual(response.status, 409);
    });

    it("should respond 400 if the status is unknown", async () => {
      // Arrange
      const orderId = await createOrder();
      const cookie = await loginAsAdmin();

      // Act
      const response = await patchStatus(orderId, "livrée", cookie);

      // Assert
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.error, "Statut invalide.");
    });

    it("should respond 404 for an unknown order", async () => {
      // Arrange
      const cookie = await loginAsAdmin();

      // Act
      const response = await patchStatus(999999, "payée", cookie);

      // Assert
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data.error, "Commande introuvable.");
    });

    it("should respond 400 if the id is not a positive integer", async () => {
      // Arrange
      const cookie = await loginAsAdmin();

      // Act
      const response = await patchStatus("abc", "payée", cookie);

      // Assert : refusé par validateId
      assert.strictEqual(response.status, 400);
    });
  });

  // ==================
  // Emails de changement de statut : la route envoie le bon email à chaque changement (payée, annulée, plantée).
  // en test, SMTP_HOST est absent : emailService affiche l'email avec console.log au lieu de l'envoyer.
  // mock.method remplace console.log le temps du test : on compte les emails « envoyés ».
  // (contenu de l'email vérifié dans emailService.unit.test.ts - buildOrderStatusEmail)
  // ==================
  describe("Status change emails", () => {
    it("should prepare the payment email when the order is paid", async () => {
      // Arrange
      const orderId = await createOrder();
      const cookie = await loginAsAdmin();
      const consoleLog = mock.method(console, "log", () => {});

      try {
        // Act
        await patchStatus(orderId, "payée", cookie);

        // Assert : email « Commande n° X : paiement reçu »
        // (l'email de confirmation de commande n'est pas compté : il a été coupé dans createOrder)
        // consoleLog garde la trace de chaque appel :
        // --> mock.callCount() : combien de fois il a été appelé (1 email « envoyé »)
        // --> mock.calls[0].arguments[0] : le texte de l'email
        assert.strictEqual(consoleLog.mock.callCount(), 1);
        const email = consoleLog.mock.calls[0].arguments[0];
        assert.ok(
          email.includes(`Objet : Commande n° ${orderId} : paiement reçu`),
        );
      } finally {
        consoleLog.mock.restore();
      }
    });

    it("should prepare the cancellation email when the order is cancelled", async () => {
      // Arrange
      const orderId = await createOrder();
      const cookie = await loginAsAdmin();
      const consoleLog = mock.method(console, "log", () => {});

      try {
        // Act
        await patchStatus(orderId, "annulée", cookie);

        // Assert : email « Commande n° X annulée »
        assert.strictEqual(consoleLog.mock.callCount(), 1);
        const email = consoleLog.mock.calls[0].arguments[0];
        assert.ok(email.includes(`Objet : Commande n° ${orderId} annulée`));
      } finally {
        consoleLog.mock.restore();
      }
    });

    it("should prepare the planting email when the order is planted", async () => {
      // Arrange : commande payée directement en BDD (sans email)
      const orderId = await createOrder();
      await setStatus(orderId, "payée");
      const cookie = await loginAsAdmin();
      const consoleLog = mock.method(console, "log", () => {});

      try {
        // Act
        const response = await patchStatus(orderId, "plantée", cookie);

        // Assert : 200, et un seul email, celui de la plantation
        assert.strictEqual(response.status, 200);
        assert.strictEqual(consoleLog.mock.callCount(), 1);
        const email = consoleLog.mock.calls[0].arguments[0];
        assert.ok(
          email.includes(
            `Objet : Commande n° ${orderId} : vos arbres sont plantés`,
          ),
        );
      } finally {
        consoleLog.mock.restore();
      }
    });

    it("should send the status email even if the customer deleted their account", async () => {
      // Arrange : ALICE commande, puis supprime son compte (la commande reste, account_id passe à NULL)
      const orderId = await createOrder();
      await pool.query("DELETE FROM account WHERE email = $1", [
        libTests.ALICE.email,
      ]);
      const cookie = await loginAsAdmin();
      const consoleLog = mock.method(console, "log", () => {});

      try {
        // Act
        const response = await patchStatus(orderId, "payée", cookie);

        // Assert : la commande est toujours là, et l'email part à l'adresse copiée à l'achat
        assert.strictEqual(response.status, 200);
        assert.strictEqual(consoleLog.mock.callCount(), 1);
        const email = consoleLog.mock.calls[0].arguments[0];
        assert.ok(email.includes(`À : ${libTests.ALICE.email}`));
      } finally {
        consoleLog.mock.restore();
      }
    });

    it("should keep the new status if the email fails", async () => {
      // Arrange : on simule un échec d'envoi (console.log, l'« envoi » en test, lève une erreur) ;
      // console.error est espionné pour vérifier la trace laissée par le catch du contrôleur
      const orderId = await createOrder();
      const cookie = await loginAsAdmin();
      // ici, le faux console.log ne fait pas rien : il lance une erreur, comme un serveur d'email en panne
      const consoleLog = mock.method(console, "log", () => {
        throw new Error("échec d'envoi simulé");
      });
      // console.error coupé et espionné : c'est lui qu'appelle le catch du contrôleur
      const consoleError = mock.method(console, "error", () => {});

      try {
        // Act
        const response = await patchStatus(orderId, "payée", cookie);

        // Assert : 200, statut enregistré, et l'échec noté dans les logs
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.status, "payée");
        assert.strictEqual(consoleError.mock.callCount(), 1);
        assert.strictEqual(
          consoleError.mock.calls[0].arguments[0],
          "Email de changement de statut non envoyé",
        );
      } finally {
        consoleLog.mock.restore();
        consoleError.mock.restore();
      }
    });
  });
});
