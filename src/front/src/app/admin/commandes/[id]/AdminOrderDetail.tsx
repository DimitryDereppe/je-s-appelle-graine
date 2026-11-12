"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IAdminOrderDetail } from "../../../../@types";
import { clientApi } from "../../../utils/clientApi";
import {
  formatDate,
  formatEuros,
  formatOrderStatus,
} from "../../../utils/format";
import styles from "../page.module.css";

interface AdminOrderDetailProps {
  id: string; // id de la commande, lu dans l'URL par page.tsx
}

// Détail d'une commande pour l'admin (GET /api/admin/orders/:id, contrat carte #167)
export function AdminOrderDetail({ id }: AdminOrderDetailProps) {
  // null tant que la commande n'est pas chargée
  const [order, setOrder] = useState<IAdminOrderDetail | null>(null);
  // erreur de chargement : remplace tout le détail
  const [errorMessage, setErrorMessage] = useState("");
  // pour changer de page depuis le code (redirection vers la connexion)
  const router = useRouter();

  // chargement de la commande une fois la page affichée dans le navigateur
  useEffect(() => {
    // useEffect ne peut pas être async : on déclare une fonction async, appelée juste après
    async function loadOrder() {
      try {
        const response = await clientApi(`admin/orders/${id}`);

        if (response.status === 401) {
          // pas connecté : la page de connexion nous renvoie sur cette commande ensuite
          router.push(`/connexion?next=/admin/commandes/${id}`);
          return;
        }
        // connecté, mais pas admin : on explique plutôt que de rediriger
        if (response.status === 403) {
          setErrorMessage("Cette page est réservée à l’administration.");
          return;
        }
        // 404 : aucune commande avec cet id ; 400 : id invalide (ex. /admin/commandes/abc)
        if (response.status === 404 || response.status === 400) {
          setErrorMessage("Cette commande est introuvable.");
          return;
        }
        // autre erreur de l'API (ex. 500)
        if (!response.ok) {
          setErrorMessage("Quelque chose n’a pas fonctionné.");
          return;
        }

        setOrder(await response.json());
      } catch {
        // l'API n'a pas répondu : sans ce message, le chargement durerait toujours
        setErrorMessage("Une erreur est survenue.");
      }
    }

    loadOrder();
    // id change si on passe d'une commande à une autre sans quitter la page
  }, [id, router]);

  // un seul affichage à la fois : erreur, chargement ou détail
  // titre neutre tant qu'on ne sait pas si la commande existe
  if (errorMessage) {
    return (
      <>
        <h1 className={styles.title}>Détail de la commande</h1>
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      </>
    );
  }

  // null : la réponse de l'API n'est pas encore arrivée
  if (!order) {
    return (
      <>
        <h1 className={styles.title}>Détail de la commande</h1>
        <p className={styles.subtitle}>Chargement de la commande…</p>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.title}>Commande n° {order.id}</h1>

      {/* dl : une liste « intitulé → valeur », lue comme telle par les lecteurs d'écran */}
      <dl className={styles.summary}>
        <dt>Statut</dt>
        <dd>
          {formatOrderStatus(order.status)}
          {/* écrit en toutes lettres, comme dans la liste */}
          {order.isLate && <span className={styles.late}> — En retard</span>}
        </dd>
        <dt>Commandée le</dt>
        <dd>{formatDate(order.purchaseDate)}</dd>
        {/* la date limite ne compte que tant que la commande n'est pas payée */}
        {order.status === "en attente" && (
          <>
            <dt>À payer avant le</dt>
            <dd>{formatDate(order.dueDate)}</dd>
          </>
        )}
        <dt>Paiement</dt>
        <dd>{order.paymentMethod}</dd>
        {/* chaque date de changement de statut vaut null tant qu'il n'a pas eu lieu : && n'affiche rien */}
        {order.paidAt && (
          <>
            <dt>Payée le</dt>
            <dd>{formatDate(order.paidAt)}</dd>
          </>
        )}
        {order.plantedAt && (
          <>
            <dt>Plantée le</dt>
            <dd>{formatDate(order.plantedAt)}</dd>
          </>
        )}
        {order.cancelledAt && (
          <>
            <dt>Annulée le</dt>
            <dd>{formatDate(order.cancelledAt)}</dd>
          </>
        )}
      </dl>

      <h2 className={styles.sectionTitle}>Client</h2>
      <dl className={styles.summary}>
        <dt>Nom</dt>
        <dd>
          {order.buyerFirstname} {order.buyerLastname}
        </dd>
        <dt>Email</dt>
        {/* mailto: un clic ouvre la messagerie de l'admin, adresse déjà remplie */}
        <dd>
          <a href={`mailto:${order.buyerEmail}`}>{order.buyerEmail}</a>
        </dd>
        {/* organisation et adresse peuvent être null (non renseignées) */}
        {order.buyerOrganization && (
          <>
            <dt>Organisation</dt>
            <dd>{order.buyerOrganization}</dd>
          </>
        )}
        {order.billingAddress && (
          <>
            <dt>Adresse de facturation</dt>
            <dd>{order.billingAddress}</dd>
          </>
        )}
      </dl>

      <h2 className={styles.sectionTitle}>Arbres commandés</h2>
      <ul className={styles.list}>
        {order.lines.map((line) => (
          // key : pas d'id dans une ligne de commande ; un arbre n'apparaît qu'une fois par commande
          <li
            key={`${line.treeName}-${line.unitPrice}`}
            className={styles.line}
          >
            <span className={styles.reference}>{line.treeName}</span>
            {/* total de la ligne, calculé ici : l'API ne le renvoie pas */}
            <span className={styles.amount}>
              {formatEuros(line.unitPrice * line.quantity)}
            </span>
            {/* le lieu peut être null : && ne l'affiche que s'il est renseigné */}
            {line.plantingLocation && (
              <span className={styles.location}>
                Lieu de plantation :
                {/* "Forêt … — Landiras (33)" : une ligne pour le lieu, une pour la commune */}
                {line.plantingLocation.split(" — ").map((part) => (
                  <span key={part}>{part}</span>
                ))}
              </span>
            )}
            <span className={styles.quantity}>
              {line.quantity} × {formatEuros(line.unitPrice)}
            </span>
          </li>
        ))}
      </ul>

      <p className={styles.total}>
        Total TTC : <strong>{formatEuros(order.totalAmount)}</strong>
      </p>

      {/* boutons de changement de statut : étape 5c */}
    </>
  );
}
