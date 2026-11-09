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
  // { items, total } (Loïc) : décommenter pour garder le total renvoyé par l'API
  // const [total, setTotal] = useState(0);
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

        // aujourd'hui l'API renvoie la liste des lignes
        const data: ICartItem[] = await response.json();
        setItems(data);

        // { items, total } (Loïc) : remplacer les 2 lignes au-dessus par :
        // const data: { items: ICartItem[]; total: number } = await response.json();
        // setItems(data.items);
        // setTotal(data.total);
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

  // reduce : additionne prix × quantité de chaque ligne, en partant de 0
  // (même calcul que l'API ; c'est elle qui refait le vrai total à la commande)
  // { items, total } (Loïc) : supprimer ce calcul, total vient alors du state
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

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
