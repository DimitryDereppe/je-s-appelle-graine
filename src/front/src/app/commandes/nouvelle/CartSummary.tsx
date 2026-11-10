"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ICartItem } from "../../../@types";
import { clientApi } from "../../utils/clientApi";
import { formatEuros } from "../../utils/format";
import styles from "./page.module.css";

export function CartSummary() {
  // null tant que le panier n'est pas chargé
  const [items, setItems] = useState<ICartItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [total, setTotal] = useState(0);
  const router = useRouter();

  // useEffect : lance le chargement une fois la page affichée dans le navigateur
  useEffect(() => {
    async function loadCart() {
      try {
        const response = await clientApi("cart");

        if (response.status === 401) {
          // pas connecté : on revient ici après la connexion
          router.push("/connexion?next=/commandes/nouvelle");
          return;
        }
        if (!response.ok) {
          setErrorMessage("Quelque chose n’a pas fonctionné.");
          return;
        }

        const data: { items: ICartItem[]; total: number } =
          await response.json();
        setItems(data.items);
        setTotal(data.total);
      } catch {
        setErrorMessage("Une erreur est survenue.");
      }
    }

    loadCart();
  }, [router]);

  if (errorMessage) {
    return (
      <p className={styles.error} role="alert">
        {errorMessage}
      </p>
    );
  }

  if (!items) {
    return <p className={styles.subtitle}>Chargement de votre panier…</p>;
  }

  if (items.length === 0) {
    return (
      <>
        <p className={styles.subtitle}>Votre panier est vide.</p>
        <p className={styles.back}>
          <Link href="/arbres">Découvrir nos arbres</Link>
        </p>
      </>
    );
  }

  // some : true si au moins un arbre n'est plus disponible → l'API refuserait la commande
  const hasUnavailableTree = items.some(
    (item) => item.availabilityName !== "disponible",
  );

  return (
    <>
      <ul className={styles.list}>
        {items.map((item) => (
          // key : React s'en sert pour repérer chaque ligne de la liste
          <li key={item.id} className={styles.line}>
            <div>
              <p className={styles.treeName}>{item.name}</p>
              <p className={styles.detail}>
                {item.quantity} × {formatEuros(item.price)}
              </p>
              {item.plantingLocation && (
                <p className={styles.detail}>
                  Planté à : {item.plantingLocation}
                </p>
              )}
              {item.availabilityName !== "disponible" && (
                <p className={styles.unavailable}>{item.availabilityName}</p>
              )}
            </div>
            <p className={styles.lineTotal}>
              {formatEuros(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <p className={styles.total}>
        <span>Total TTC</span>
        <span>{formatEuros(total)}</span>
      </p>

      {hasUnavailableTree ? (
        <p className={styles.error} role="alert">
          Un arbre de votre panier n’est plus disponible : retirez-le pour
          continuer.
        </p>
      ) : (
        <Link href="/commandes/nouvelle/paiement" className={styles.next}>
          Passer au paiement
        </Link>
      )}

      <p className={styles.back}>
        <Link href="/arbres">Continuer mes achats</Link>
      </p>
    </>
  );
}
