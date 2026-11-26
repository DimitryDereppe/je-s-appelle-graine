import { describe, it } from "node:test";
import assert from "node:assert";
import {
  computeTotal,
  canChangeStatus,
  canBeCancelledByClient,
  getPaymentInstructions,
} from "./orderRules.ts";

// Tests unitaires : les règles métier se testent sans BDD ni requête HTTP,
// on appelle la fonction et on compare son résultat à ce qu'on attend

describe("computeTotal", () => {
  it("renvoie 0 pour une liste vide", () => {
    assert.strictEqual(computeTotal([]), 0);
  });

  it("additionne prix × quantité de chaque ligne", () => {
    const lines = [
      { price: 10, quantity: 2 },
      { price: 5.5, quantity: 1 },
    ];
    assert.strictEqual(computeTotal(lines), 25.5);
  });

  it("arrondit au centime (16.9 × 3 ne donne pas 50.699999999999996)", () => {
    assert.strictEqual(computeTotal([{ price: 16.9, quantity: 3 }]), 50.7);
  });
});

describe("canChangeStatus", () => {
  it("autorise en attente → payée, en attente → annulée et payée → plantée", () => {
    assert.strictEqual(canChangeStatus("en attente", "payée"), true);
    assert.strictEqual(canChangeStatus("en attente", "annulée"), true);
    assert.strictEqual(canChangeStatus("payée", "plantée"), true);
  });

  it("refuse les autres changements", () => {
    assert.strictEqual(canChangeStatus("en attente", "plantée"), false);
    assert.strictEqual(canChangeStatus("payée", "annulée"), false);
    assert.strictEqual(canChangeStatus("plantée", "annulée"), false);
    assert.strictEqual(canChangeStatus("annulée", "payée"), false);
  });
});

describe("canBeCancelledByClient", () => {
  it("n'autorise l'annulation que pour une commande en attente", () => {
    assert.strictEqual(canBeCancelledByClient("en attente"), true);
    assert.strictEqual(canBeCancelledByClient("payée"), false);
    assert.strictEqual(canBeCancelledByClient("plantée"), false);
    assert.strictEqual(canBeCancelledByClient("annulée"), false);
  });
});

describe("getPaymentInstructions", () => {
  it("donne les coordonnées bancaires pour un virement", () => {
    const instructions = getPaymentInstructions("virement");
    assert.ok("iban" in instructions);
    assert.ok("bic" in instructions);
    assert.ok("holder" in instructions);
  });

  it("donne l'ordre et l'adresse pour un chèque", () => {
    const instructions = getPaymentInstructions("chèque");
    assert.ok("payableTo" in instructions);
    assert.ok("address" in instructions);
  });
});
