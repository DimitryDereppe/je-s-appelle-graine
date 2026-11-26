import { describe, it } from "node:test";
import assert from "node:assert";
import {
  MAX_QUANTITY_PER_TREE,
  isTreeAvailable,
  exceedsMaxQuantity,
} from "./cartRules.ts";

describe("isTreeAvailable", () => {
  it("accepte seulement un arbre « disponible »", () => {
    assert.strictEqual(isTreeAvailable("disponible"), true);
    assert.strictEqual(isTreeAvailable("en rupture de stock"), false);
    assert.strictEqual(isTreeAvailable("retiré"), false);
  });
});

describe("exceedsMaxQuantity", () => {
  it("accepte d'atteindre exactement le maximum", () => {
    assert.strictEqual(exceedsMaxQuantity(MAX_QUANTITY_PER_TREE - 1, 1), false);
  });

  it("refuse de dépasser le maximum", () => {
    assert.strictEqual(exceedsMaxQuantity(MAX_QUANTITY_PER_TREE, 1), true);
    assert.strictEqual(exceedsMaxQuantity(60, 50), true);
  });
});
