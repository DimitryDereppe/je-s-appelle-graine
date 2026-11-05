"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

interface AddToCartButtonProps {
  treeId: number;
  treeName: string;
}

export function AddToCartButton({ treeId, treeName }: AddToCartButtonProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  async function handleAddToCart() {
    setIsAdding(true);
    setCartMessage("");

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tree_id: treeId, quantity: 1 }),
      });

      if (response.status === 401 || response.status === 403) {
        // Page actuelle, filtres compris (ex. "/arbres?category=1")
        const currentPage = window.location.pathname + window.location.search;
        router.push(`/connexion?next=${encodeURIComponent(currentPage)}`);
        return;
      }

      if (!response.ok) {
        throw new Error("L’ajout au panier n’a pas fonctionné.");
      }

      setCartMessage("L’arbre a été ajouté au panier.");
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
        className={styles.addToCart}
        type="button"
        aria-label={`Ajouter ${treeName} au panier`}
        disabled={isAdding}
        onClick={handleAddToCart}
      >
        <Image src="/assets/panier.svg" alt="" width={22} height={22} />
      </button>
      {cartMessage && (
        <p className={styles.cartMessage} role="status" aria-live="polite">
          {cartMessage}
        </p>
      )}
    </>
  );
}
