"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IOrderSummary } from "../../@types";
import { clientApi } from "../utils/clientApi";
import { formatDate, formatEuros, formatOrderStatus } from "../utils/format";
import styles from "./page.module.css";

// Liste des commandes du client connecté (GET /api/orders)
export function OrdersList() {
  // null tant que la liste n'est pas chargée ([] = aucune commande)
  const [orders, setOrders] = useState<IOrderSummary[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  // pour changer de page depuis le code (redirection vers la connexion)
  const router = useRouter();

  // chargement une fois la page affichée dans le navigateur (qui envoie le cookie)
  useEffect(() => {
    // useEffect ne peut pas être async : on déclare une fonction async, appelée juste après
    async function loadOrders() {
      try {
        const response = await clientApi("orders");

        if (response.status === 401) {
          // pas connecté : la page de connexion lit ?next= et nous renvoie ici ensuite
          router.push("/connexion?next=/commandes");
          return;
        }
        // autre erreur de l'API (ex. 500) : fetch a réussi, mais la réponse est une erreur
        if (!response.ok) {
          setErrorMessage("Quelque chose n’a pas fonctionné.");
          return;
        }

        setOrders(await response.json());
      } catch {
        // l'API n'a pas répondu (réseau, serveur arrêté) : sans ce message, le chargement durerait toujours
        setErrorMessage("Une erreur est survenue.");
      }
    }

    loadOrders();

    // dépendances = ce que l'effet utilise et qui vient du composant ;
    // router ne change jamais : l'effet ne se lance qu'une fois
  }, [router]);

  // ----------------------------------------------------------------------
  // un seul affichage à la fois : erreur, chargement, liste vide ou liste
  // ----------------------------------------------------------------------

  // erreur
  if (errorMessage) {
    return (
      <p className={styles.error} role="alert">
        {errorMessage}
      </p>
    );
  }

  // Chargement
  if (!orders) {
    // null : la réponse de l'API n'est pas encore arrivée
    return <p className={styles.subtitle}>Chargement de vos commandes…</p>;
  }

  // liste vide : un message et un lien, plutôt qu'une page blanche
  if (orders.length === 0) {
    return (
      <p className={styles.subtitle}>
        Vous n’avez pas encore passé de commande.{" "}
        <Link href="/arbres">Découvrir nos arbres</Link>
      </p>
    );
  }

  // Liste : une carte par commande, entièrement cliquable vers le détail
  return (
    <ul className={styles.list}>
      {orders.map((order) => (
        // key : identifiant unique, React s'en sert pour suivre chaque élément de la liste
        <li key={order.id}>
          <Link href={`/commandes/${order.id}`} className={styles.card}>
            <span className={styles.reference}>Commande n° {order.id}</span>
            <span>{formatDate(order.purchaseDate)}</span>
            <span className={styles.status}>
              {formatOrderStatus(order.status)}
            </span>
            <span className={styles.amount}>
              {formatEuros(order.totalAmount)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
