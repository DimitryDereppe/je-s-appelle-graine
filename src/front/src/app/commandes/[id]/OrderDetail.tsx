"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IOrderDetail, OrderStatus } from "../../../@types";
import { clientApi } from "../../utils/clientApi";
import { formatDate, formatEuros, formatOrderStatus } from "../../utils/format";
import styles from "../page.module.css";

interface OrderDetailProps {
  id: string; // id de la commande, lu dans l'URL par page.tsx
}

// Message quand l'annulation est refusée (409), selon le statut actuel de la commande
// default : "en attente" ne donne jamais de 409, mais la fonction doit toujours renvoyer un texte
function getCancelRefusedMessage(status: OrderStatus): string {
  switch (status) {
    case "payée":
      return "Votre paiement a déjà été reçu : cette commande ne peut plus être annulée.";
    case "plantée":
      return "Vos arbres ont déjà été plantés : cette commande ne peut plus être annulée.";
    case "annulée":
      return "Cette commande est déjà annulée.";
    default:
      return "Cette commande ne peut plus être annulée.";
  }
}

// Détail d'une commande (GET /api/orders/:id) et annulation (PATCH /api/orders/:id/status)
export function OrderDetail({ id }: OrderDetailProps) {
  // null tant que la commande n'est pas chargée
  const [order, setOrder] = useState<IOrderDetail | null>(null);
  // erreur de chargement : remplace tout le détail
  const [errorMessage, setErrorMessage] = useState("");
  // message après le clic sur Annuler (succès ou refus de l'API)
  const [cancelMessage, setCancelMessage] = useState("");
  // désactive le bouton pendant l'envoi : évite un double clic
  const [isCancelling, setIsCancelling] = useState(false);
  // pour changer de page depuis le code (redirection vers la connexion)
  const router = useRouter();

  // chargement de la commande une fois la page affichée dans le navigateur
  useEffect(() => {
    // useEffect ne peut pas être async : on déclare une fonction async, appelée juste après
    async function loadOrder() {
      try {
        const response = await clientApi(`orders/${id}`);

        if (response.status === 401) {
          // pas connecté : la page de connexion nous renvoie ici ensuite
          router.push(`/connexion?next=/commandes/${id}`);
          return;
        }
        // 404 : commande inconnue ou d'un autre client ; 400 : id invalide (ex. /commandes/abc)
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

  // Au clic sur « Annuler la commande »
  async function handleCancel() {
    // fenêtre de confirmation fournie par le navigateur (accessible au clavier)
    if (!window.confirm("Voulez-vous vraiment annuler cette commande ?")) {
      return; // l'utilisateur a cliqué sur Annuler dans la fenêtre : on ne fait rien
    }

    setIsCancelling(true);
    // efface le message d'un essai précédent
    setCancelMessage("");

    try {
      const response = await clientApi(`orders/${id}/status`, "PATCH", {
        status: "annulée",
      });

      // 409 : la commande n'est plus en attente (ex. l'admin a enregistré le paiement entre temps)
      // → on la relit pour connaître son statut actuel
      if (response.status === 409) {
        const updated = await clientApi(`orders/${id}`);
        if (updated.ok) {
          const currentOrder: IOrderDetail = await updated.json();
          // met la page à jour : bon statut affiché, le bouton Annuler disparaît
          setOrder(currentOrder);
          setCancelMessage(getCancelRefusedMessage(currentOrder.status));
          return;
        }
      }

      // autre erreur, ou relecture impossible après le 409
      if (!response.ok) {
        setCancelMessage("L’annulation n’a pas fonctionné.");
        return;
      }

      // l'API renvoie la commande à jour : statut « Annulée », le bouton disparaît
      setOrder(await response.json());
      setCancelMessage("Votre commande a été annulée.");
    } catch {
      setCancelMessage("Une erreur est survenue.");
    } finally {
      // dans tous les cas (succès, erreur, return) : le bouton redevient cliquable
      setIsCancelling(false);
    }
  }

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
        <p className={styles.subtitle}>Chargement de votre commande…</p>
      </>
    );
  }

  // calculé à chaque affichage : après une annulation, il passe à false et le bouton disparaît
  const isPending = order.status === "en attente";

  return (
    <>
      <h1 className={styles.title}>Commande n° {order.id}</h1>

      {/* dl : une liste « intitulé → valeur », lue comme telle par les lecteurs d'écran */}
      <dl className={styles.summary}>
        <dt>Date</dt>
        <dd>{formatDate(order.purchaseDate)}</dd>
        <dt>Statut</dt>
        <dd>{formatOrderStatus(order.status)}</dd>
        <dt>Paiement</dt>
        <dd>{order.paymentMethod}</dd>
        {/* la date limite ne compte que tant que la commande n'est pas payée */}
        {isPending && (
          <>
            <dt>À payer avant le</dt>
            <dd>{formatDate(order.dueDate)}</dd>
          </>
        )}
        <dt>Adresse de facturation</dt>
        <dd>{order.billingAddress}</dd>
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
            {/* && : n'affiche le lieu que s'il est renseigné (il peut être null) */}
            {line.plantingLocation && (
              <span className={styles.location}>
                Lieu de plantation :
                {/* "Forêt … — Landiras (33)" : une ligne pour le lieu, une pour la commune */}
                {line.plantingLocation.split(" — ").map((part) => (
                  <span key={part}>{part}</span>
                ))}
              </span>
            )}
            {/* quantité × prix : à droite, sous le total de la ligne */}
            <span className={styles.quantity}>
              {line.quantity} × {formatEuros(line.unitPrice)}
            </span>
          </li>
        ))}
      </ul>

      <p className={styles.total}>
        Total TTC : <strong>{formatEuros(order.totalAmount)}</strong>
      </p>

      {/* annulation seulement si la commande est en attente (l'API le vérifie aussi) */}
      {isPending && (
        <button
          type="button"
          className={styles.cancelButton}
          onClick={handleCancel}
          disabled={isCancelling}
        >
          {/* texte changé pendant l'envoi : l'utilisateur voit que sa demande est prise en compte */}
          {isCancelling ? "Annulation…" : "Annuler la commande"}
        </button>
      )}

      {/* role="status" : le lecteur d'écran annonce le message sans couper l'utilisateur */}
      {cancelMessage && (
        <p className={styles.subtitle} role="status">
          {cancelMessage}
        </p>
      )}
    </>
  );
}
