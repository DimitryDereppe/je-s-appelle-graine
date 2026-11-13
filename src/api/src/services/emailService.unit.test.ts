import { describe, it } from "node:test";
import assert from "node:assert";
import type { IAdminOrder } from "../@types/index.d.ts";
import { buildOrderStatusEmail } from "./emailService.ts";

// Test unitaire : on appelle buildOrderStatusEmail et on vérifie l'objet qu'elle renvoie
// pas de BDD, pas de requête HTTP
describe("buildOrderStatusEmail", () => {
  // orderTest : une commande de test comme la renvoie findOrderByIdForAdmin
  // ... recopiée dans chaque test avec le statut voulu
  const orderTest: IAdminOrder = {
    id: 12,
    purchaseDate: "2026-11-10T10:00:00.000Z",
    status: "payée",
    totalAmount: 33.8,
    buyerFirstname: "Alice",
    buyerLastname: "Martin",
    buyerEmail: "alice@test.fr",
    isLate: false,
    dueDate: "2026-11-20",
    paymentMethod: "virement",
    buyerOrganization: null,
    billingAddress: "12 rue des Chênes, 35380 Paimpont",
    paidAt: "2026-11-11T09:00:00.000Z",
    plantedAt: null,
    cancelledAt: null,
    // différent de buyerEmail : vérifie que l'email part bien à notificationEmail
    notificationEmail: "alice.nouvelle@test.fr",
    lines: [],
  };

  it("should build the payment email", () => {
    // Act
    const email = buildOrderStatusEmail({ ...orderTest, status: "payée" });

    // Assert : destinataire, objet et contenu
    assert.strictEqual(email.to, "alice.nouvelle@test.fr");
    assert.strictEqual(email.subject, "Commande n° 12 : paiement reçu");
    assert.ok(email.text.startsWith("Bonjour Alice Martin,"));
    assert.ok(email.text.includes("Votre paiement a bien été reçu."));
    assert.ok(email.text.includes("Référence : commande n° 12"));
    // 33.8 → « 33,80 € » : 2 chiffres après la virgule, virgule à la française
    assert.ok(email.text.includes("Montant TTC : 33,80 €"));
  });

  it("should build the cancellation email", () => {
    // Act
    const email = buildOrderStatusEmail({ ...orderTest, status: "annulée" });

    // Assert : l'objet et le message de l'annulation, pas ceux du paiement
    assert.strictEqual(email.subject, "Commande n° 12 annulée");
    assert.ok(
      email.text.includes(
        "Votre commande a été annulée faute de paiement sous 10 jours.",
      ),
    );
    assert.ok(!email.text.includes("paiement a bien été reçu"));
  });

  it("should build the planting email", () => {
    // Act
    const email = buildOrderStatusEmail({ ...orderTest, status: "plantée" });

    // Assert : l'objet et le message de la plantation
    assert.strictEqual(
      email.subject,
      "Commande n° 12 : vos arbres sont plantés",
    );
    assert.ok(email.text.includes("vos arbres ont été plantés"));
  });
});
