"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./cartItems.module.css";
import { clientApi } from "@/app/utils/clientApi";
import { useCartCount } from "@/app/context/CartCountContext";

export function CartItems() {
  const { items, loading, refresh } = useCartCount();
  const [error, setError] = useState("");

  async function handleUpdateQuantity(treeId: number, quantity: number) {
    if (quantity < 1) return;
    try {
      const response = await clientApi(`cart/items/${treeId}`, "PATCH", {
        quantity,
      });
      if (!response.ok) throw new Error("La modification a échoué.");
      await refresh();
    } catch {
      setError("Impossible de modifier la quantité.");
    }
  }

  async function handleDeleteItem(treeId: number) {
    try {
      const response = await clientApi(`cart/items/${treeId}`, "DELETE");
      if (!response.ok) throw new Error("La suppression a échoué.");
      await refresh();
    } catch {
      setError("Impossible de retirer cet article.");
    }
  }
  async function handleClearCart() {
    try {
      const response = await clientApi(`cart/items/`, "DELETE");
      if (!response.ok) throw new Error("La suppression a échoué.");
      await refresh();
    } catch {
      setError("Impossible de retirer cet article.");
    }
  }

  if (loading) {
    return <p className={styles.loading}>Chargement du panier…</p>;
  }

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Mon panier</h1>
        <div className={styles.emptyState}>
          <p className={styles.empty}>Votre panier est vide.</p>
          <Link href="/arbres" className={styles.emptyLink}>
            ← Découvrir nos arbres
          </Link>
        </div>
      </div>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={styles.container}>
      <div className={styles.titles}>
        <h1 className={styles.title}>Mon panier</h1>
        <p className={styles.subtitle}>Votre forêt de demain commence ici.</p>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <Image
              src={item.photoUrl}
              alt={item.name}
              width={64}
              height={64}
              className={styles.itemImage}
            />
            <div className={styles.itemInfo}>
              <span className={styles.treeName}>{item.name}</span>
              <div className={styles.cardLocation}>
                <span className={styles.locationIcon}>
                  <Image
                    src="/assets/localisation.svg"
                    alt=""
                    className={styles.badgeIcon}
                    width={18}
                    height={18}
                  />
                </span>
                <span className={styles.location}>{item.plantingLocation}</span>
              </div>{" "}
              <span className={styles.unitPrice}>
                {item.price.toFixed(0)}€ TTC
              </span>
              <button
                type="button"
                className={styles.deleteString}
                aria-label={`Retirer ${item.name} du panier`}
                onClick={() => handleDeleteItem(item.treeId)}
              >
                supprimer
              </button>
              <div className={styles.qtyControl}>
                <button
                  type="button"
                  aria-label={`Diminuer la quantité de ${item.name}`}
                  onClick={() =>
                    handleUpdateQuantity(item.treeId, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span className={styles.qtyValue}>{item.quantity}</span>
                <button
                  type="button"
                  aria-label={`Augmenter la quantité de ${item.name}`}
                  onClick={() =>
                    handleUpdateQuantity(item.treeId, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>
            <div className={styles.priceAndClosure}>
              <div className={styles.deleteDiv}>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  aria-label={`Retirer ${item.name} du panier`}
                  onClick={() => handleDeleteItem(item.treeId)}
                >
                  ✕
                </button>
              </div>
              <p className={styles.lineTotal}>
                {(item.price * item.quantity).toFixed(0)}€ TTC
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.summary}>
        <h2 className={styles.summaryTitle}>Récapitulatif</h2>
        <div className={styles.summaryRow}>
          <span>
            Sous-total ({totalItems} arbre{totalItems > 1 ? "s" : ""})
          </span>
          <span>{total.toFixed(2).replace(".", ",")}€ TTC</span>
        </div>
        <div className={styles.summaryRowTotal}>
          <span>Total TTC</span>
          <span>{total.toFixed(2).replace(".", ",")}€ TTC</span>
        </div>
        <Link href="/commandes/nouvelle" className={styles.orderLink}>
          Passer au paiement
        </Link>
        <button
          className={styles.clearButton}
          onClick={() => handleClearCart()}
        >
          Vider le panier
        </button>
      </div>

      <div className={styles.backToCatalogDiv}>
        <Link className={styles.backToCatalog} href="/arbres" passHref>
          <button className={styles.catalogButton} type="button">
            ← Continuer de découvrir nos arbres{" "}
            <span className={styles.arrow}></span>
          </button>
        </Link>
      </div>
    </div>
  );
}
