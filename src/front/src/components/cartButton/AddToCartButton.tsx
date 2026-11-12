"use client";

// ─── Bouton "Ajouter au panier" ──────────────────────────────────────────────
// Appelle POST /api/cart/items via clientApi, puis rafraîchit le compteur.

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./addToCartButton.module.css";
import { clientApi } from "@/app/utils/clientApi";
import { useCartCount } from "@/app/context/CartCountContext";

interface AddToCartButtonProps {
  treeId: number;
  treeName: string;
  isOutOfStock?: boolean;
  iconOn?: boolean;
}

export function AddToCartButton({
  treeId,
  treeName,
  isOutOfStock = false,
  iconOn = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const { refresh } = useCartCount(); // ← rafraîchit le compteur après mutation
  const [isAdding, setIsAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  // ─── Handler : POST /api/cart/items puis refresh du compteur ───────────────
  async function handleAddToCart() {
    if (isOutOfStock) {
      setCartMessage("Article indisponible en ce moment");
      return;
    }

    setIsAdding(true);
    setCartMessage("");

    try {
      const response = await clientApi("cart/items", "POST", {
        treeId,
        quantity: 1,
      });

      // 401 / 403 : pas connecté → redirection vers la page de connexion
      if (response.status === 401 || response.status === 403) {
        const currentPage = window.location.pathname + window.location.search;
        router.push(`/connexion?next=${encodeURIComponent(currentPage)}`);
        return;
      }

      if (!response.ok) {
        throw new Error("L'ajout au panier n'a pas fonctionné.");
      }

      // ✅ Ajout réussi en base → on relit le panier pour mettre à jour le badge
      await refresh();
      setCartMessage(iconOn ? "+ 1" : "L'arbre a été ajouté au panier.");
    } catch (addError) {
      setCartMessage(
        addError instanceof Error
          ? addError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <>
      <button
        className={iconOn ? styles.iconOn : styles.basketButton}
        type="button"
        aria-label={`Ajouter ${treeName} au panier`}
        disabled={isAdding}
        onClick={handleAddToCart}
      >
        {iconOn ? (
          <Image src="/assets/panier.svg" alt="" width={22} height={22} />
        ) : (
          <p>Ajouter au panier</p>
        )}
      </button>
      {cartMessage && (
        <span className={styles.cartMessage} role="status" aria-live="polite">
          {cartMessage}
        </span>
      )}
    </>
  );
}
