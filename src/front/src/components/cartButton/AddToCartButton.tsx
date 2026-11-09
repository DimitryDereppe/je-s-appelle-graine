"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./addToCartButton.module.css";
import { clientApi } from "@/app/utils/clientApi";

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
  const [isAdding, setIsAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  async function handleAddToCart() {
    if (isOutOfStock) return;

    setIsAdding(true);
    setCartMessage("");

    try {
      const response = await clientApi("cart/items", "POST", {
        treeId,
        quantity: 1,
      });

      if (response.status === 401 || response.status === 403) {
        const currentPage = window.location.pathname + window.location.search;
        router.push(`/connexion?next=${encodeURIComponent(currentPage)}`);
        return;
      }

      if (!response.ok) {
        throw new Error("L'ajout au panier n'a pas fonctionné.");
      }

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
        disabled={isAdding || isOutOfStock}
        onClick={handleAddToCart}
      >
        {iconOn ? (
          <Image src="/assets/panier.svg" alt="" width={22} height={22} />
        ) : (
          <p>Ajouter au panier</p>
        )}
      </button>
      {cartMessage && (
        <p className={styles.cartMessage} role="status" aria-live="polite">
          {cartMessage}
        </p>
      )}
    </>
  );
}
