"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IAdminOrderSummary, OrderStatus } from "../../../@types";
import { clientApi } from "../../utils/clientApi";
import { formatDate, formatEuros, formatOrderStatus } from "../../utils/format";
import styles from "./page.module.css";

// les 4 statuts, dans l'ordre de la vie d'une commande, pour les options du filtre
const ORDER_STATUSES: OrderStatus[] = [
  "en attente",
  "payée",
  "plantée",
  "annulée",
];

// Liste de toutes les commandes, pour l'admin (GET /api/admin/orders, contrat carte #167)
export function AdminOrdersList() {
  // null tant que la liste n'est pas chargée ([] = aucune commande)
  const [orders, setOrders] = useState<IAdminOrderSummary[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  // statut choisi dans le filtre ("" = tous les statuts, pas de filtre)
  const [status, setStatus] = useState<OrderStatus | "">("");
  // pour changer de page depuis le code (redirection vers la connexion)
  const router = useRouter();

  // chargement une fois la page affichée dans le navigateur (qui envoie le cookie)
  useEffect(() => {
    // useEffect ne peut pas être async : on déclare une fonction async, appelée juste après
    async function loadOrders() {
      // nouveau filtre : on vide la liste pour afficher « Chargement… » pendant la requête
      setOrders(null);

      // ?status= seulement si un statut est choisi ; encodeURIComponent code l'espace et les accents
      const query = status ? `?status=${encodeURIComponent(status)}` : "";

      try {
        const response = await clientApi(`admin/orders${query}`);

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

    // l'effet se relance à chaque changement de status (router, lui, ne change jamais)
  }, [router, status]);

  // erreur : pas de filtre affiché (ex. 403, la page n'est pas pour cet utilisateur)
  if (errorMessage) {
    return (
      <p className={styles.error} role="alert">
        {errorMessage}
      </p>
    );
  }

  // un seul affichage à la fois sous le filtre : chargement, liste vide ou liste
  function renderOrders() {
    if (!orders) {
      return <p className={styles.subtitle}>Chargement des commandes…</p>;
    }

    if (orders.length === 0) {
      // message différent si c'est le filtre qui ne trouve rien
      return (
        <p className={styles.subtitle}>
          {status
            ? "Aucune commande avec ce statut."
            : "Aucune commande pour le moment."}
        </p>
      );
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
              {/* écrit en toutes lettres : pas seulement une couleur, lisible par tout le monde */}
              {order.isLate && <span className={styles.late}>En retard</span>}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  // le filtre reste affiché même si la liste est vide, pour pouvoir changer de statut
  return (
    <>
      <div className={styles.filter}>
        {/* htmlFor relie le label au select : lu par les lecteurs d'écran, clic sur le texte = focus */}
        <label htmlFor="status-filter">Statut</label>
        <select
          id="status-filter"
          value={status}
          // e.target.value est une string : on précise qu'elle vaut un des statuts (ou "")
          onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
        >
          <option value="">Tous les statuts</option>
          {ORDER_STATUSES.map((orderStatus) => (
            <option key={orderStatus} value={orderStatus}>
              {formatOrderStatus(orderStatus)}
            </option>
          ))}
        </select>
      </div>

      {renderOrders()}
    </>
  );
}
