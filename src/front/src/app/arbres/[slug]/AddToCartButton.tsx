"use client";

import { useState } from "react";
import styles from "./AddToCartButton.module.css";

interface AddToCartButtonProps {
  treeId: number;
  price: number;
}

export function AddToCartButton({ treeId, price }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ treeId, price }),
      });
      setAdded(true);
    } catch {
      // gérer l'erreur si besoin
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={styles.button}
      onClick={handleClick}
      disabled={loading || added}
    >
      {added ? "✓ Ajouté au panier" : "Ajouter au panier"}
    </button>
  );
}   