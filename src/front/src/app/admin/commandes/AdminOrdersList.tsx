"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IAdminOrderSummary } from "../../../@types";
import { clientApi } from "../../utils/clientApi";
import { formatDate, formatEuros, formatOrderStatus } from "../../utils/format";
import styles from "./page.module.css";

// Liste de toutes les commandes, pour l'admin (GET /api/admin/orders, contrat carte #167)
export function AdminOrdersList() {
  // null tant que la liste n'est pas chargée ([] = aucune commande)
  const [orders, setOrders] = useState<IAdminOrderSummary[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  // pour changer de page depuis le code (redirection vers la connexion)
  const router = useRouter();

  // chargement une fois la page affichée dans le navigateur (qui envoie le cookie)
  useEffect(() => {
    // useEffect ne peut pas être async : on déclare une fonction async, appelée juste après
    async function loadOrders() {
      try {
        const response = await clientApi("admin/orders");

        if (response.status === 401) {
          // pas connecté : la page de connexion lit ?next= et nous renvoie ici ensuite
          router.push("/connexion?next=/admin/commandes");
          return;
        }
        // connecté, mais pas admin : on explique plutôt que de rediriger
        if (response.status === 403) {
          setErrorMessage("Cette page est réservée à l’administration.");
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

    // router ne change jamais : l'effet ne se lance qu'une fois
  }, [router]);

  // ----------------------------------------------------------------------
  // un seul affichage à la fois : erreur, chargement, liste vide ou liste
  // ----------------------------------------------------------------------

  if (errorMessage) {
    return (
      <p className={styles.error} role="alert">
        {errorMessage}
      </p>
    );
  }

  if (!orders) {
    return <p className={styles.subtitle}>Chargement des commandes…</p>;
  }

  if (orders.length === 0) {
    return <p className={styles.subtitle}>Aucune commande pour le moment.</p>;
  }

  // Liste : une carte par commande, entièrement cliquable vers le détail admin
  return (
    <ul className={styles.list}>
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/admin/commandes/${order.id}`} className={styles.card}>
            <span className={styles.reference}>Commande n° {order.id}</span>
            <span className={styles.status}>
              {formatOrderStatus(order.status)}
            </span>
            <span>
              {order.buyerFirstname} {order.buyerLastname}
            </span>
            <span className={styles.amount}>
              {formatEuros(order.totalAmount)}
            </span>
            <span className={styles.date}>
              {formatDate(order.purchaseDate)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
