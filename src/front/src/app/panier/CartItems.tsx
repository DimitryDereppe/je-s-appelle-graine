"use client";

// ─── Liste des articles du panier ────────────────────────────────────────────
// Lit le panier depuis le Context (déjà chargé via GET /api/cart),
// permet de modifier la quantité (PATCH) et de supprimer une ligne (DELETE).

import { useState } from "react";
import styles from "./cartItems.module.css";
import { clientApi } from "@/app/utils/clientApi";
import { useCartCount } from "@/app/context/CartCountContext";

export function CartItems() {
  const { items, loading, refresh } = useCartCount();
  const [error, setError] = useState("");

  // ─── Modifier la quantité : PATCH /api/cart/items/:id ──────────────────────
  async function handleUpdateQuantity(itemId: number, quantity: number) {
    if (quantity < 1) return; // on ne permet pas 0 (utiliser DELETE)

    try {
      const response = await clientApi(`cart/items/${itemId}`, "PATCH", {
        quantity,
      });

      if (!response.ok) {
        throw new Error("La modification a échoué.");
      }

      // ✅ Mis à jour en base → on relit le panier
      await refresh();
    } catch {
      setError("Impossible de modifier la quantité.");
    }
  }

  // ─── Supprimer une ligne : DELETE /api/cart/items/:id ──────────────────────
  async function handleDeleteItem(itemId: number) {
    try {
      const response = await clientApi(`cart/items/${itemId}`, "DELETE");

      if (!response.ok) {
        throw new Error("La suppression a échoué.");
      }

      // ✅ Supprimé de la base → on relit le panier
      await refresh();
    } catch {
      setError("Impossible de retirer cet article.");
    }
  }

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  if (loading) {
    return <p className={styles.loading}>Chargement du panier…</p>;
  }

  if (items.length === 0) {
    return <p className={styles.empty}>Votre panier est vide.</p>;
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className={styles.container}>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            {/* Nom + prix unitaire */}
            <div className={styles.itemInfo}>
              <span className={styles.treeName}>{item.treeName}</span>
              <span className={styles.unitPrice}>
                {item.price.toFixed(2)} €
              </span>
            </div>

            {/* Contrôle de la quantité : − / valeur / + */}
            <div className={styles.qtyControl}>
              <button
                type="button"
                aria-label={`Diminuer la quantité de ${item.treeName}`}
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                −
              </button>
              <span className={styles.qtyValue}>{item.quantity}</span>
              <button
                type="button"
                aria-label={`Augmenter la quantité de ${item.treeName}`}
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>

            {/* Prix total de la ligne */}
            <span className={styles.lineTotal}>
              {(item.price * item.quantity).toFixed(2)} €
            </span>

            {/* Bouton supprimer */}
            <button
              type="button"
              className={styles.deleteBtn}
              aria-label={`Retirer ${item.treeName} du panier`}
              onClick={() => handleDeleteItem(item.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* Total du panier */}
      <p className={styles.total}>
        Total : <strong>{total.toFixed(2)} €</strong>
      </p>
    </div>
  );
}
