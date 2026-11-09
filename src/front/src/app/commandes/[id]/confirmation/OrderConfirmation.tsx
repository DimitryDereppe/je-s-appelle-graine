"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IOrderWithInstructions } from "../../../../@types";
import { clientApi } from "../../../utils/clientApi";
import { formatDate, formatEuros } from "../../../utils/format";
import styles from "./page.module.css";

interface OrderConfirmationProps {
  id: string;
}

export function OrderConfirmation({ id }: OrderConfirmationProps) {
  // null tant que la commande n'est pas chargée
  const [order, setOrder] = useState<IOrderWithInstructions | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // useEffect : lance le chargement une fois la page affichée dans le navigateur
  useEffect(() => {
    async function loadOrder() {
      try {
        const response = await clientApi(`orders/${id}`);

        if (response.status === 401) {
          // pas connecté : on revient ici après la connexion
          router.push(`/connexion?next=/commandes/${id}/confirmation`);
          return;
        }
        if (response.status === 404) {
          // commande inconnue, ou commande d'un autre client
          setErrorMessage("Cette commande est introuvable.");
          return;
        }
        if (!response.ok) {
          setErrorMessage("Quelque chose n’a pas fonctionné.");
          return;
        }

        setOrder(await response.json());
      } catch {
        setErrorMessage("Une erreur est survenue.");
      }
    }

    loadOrder();
  }, [id, router]);

  // titre neutre tant qu'on ne sait pas si la commande existe
  if (errorMessage) {
    return (
      <>
        <h1 className={styles.title}>Confirmation de commande</h1>
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <h1 className={styles.title}>Confirmation de commande</h1>
        <p className={styles.subtitle}>Chargement de votre commande…</p>
      </>
    );
  }

  // la référence à recopier sur le virement ou le chèque (la même que dans l'email)
  const reference = `Commande n° ${order.id}`;
  const instructions = order.paymentInstructions;

  return (
    <>
      <h1 className={styles.title}>Merci pour votre commande !</h1>
      <p className={styles.subtitle}>
        Votre commande est enregistrée. Un email de confirmation vous a été
        envoyé.
      </p>

      {/* dl : une liste « intitulé → valeur », lue comme telle par les lecteurs d'écran */}
      <dl className={styles.summary}>
        <dt>Référence</dt>
        <dd>{reference}</dd>
        <dt>Montant TTC</dt>
        <dd>{formatEuros(order.totalAmount)}</dd>
        <dt>À payer avant le</dt>
        <dd>{formatDate(order.dueDate)}</dd>
      </dl>

      <p className={styles.warning}>
        Sans paiement à cette date, la commande sera annulée.
      </p>

      {/* "iban" in … : vrai pour un virement ; TypeScript sait alors quels champs existent */}
      {"iban" in instructions ? (
        <section className={styles.instructions} aria-labelledby="payment">
          <h2 id="payment" className={styles.sectionTitle}>
            Paiement par virement
          </h2>
          <dl className={styles.summary}>
            <dt>IBAN</dt>
            <dd>{instructions.iban}</dd>
            <dt>BIC</dt>
            <dd>{instructions.bic}</dd>
            <dt>Titulaire</dt>
            <dd>{instructions.holder}</dd>
          </dl>
          <p>Indiquez « {reference} » dans le libellé du virement.</p>
        </section>
      ) : (
        <section className={styles.instructions} aria-labelledby="payment">
          <h2 id="payment" className={styles.sectionTitle}>
            Paiement par chèque
          </h2>
          <dl className={styles.summary}>
            <dt>À l’ordre de</dt>
            <dd>{instructions.payableTo}</dd>
            <dt>À envoyer à</dt>
            <dd className={styles.address}>{instructions.address}</dd>
          </dl>
          <p>Écrivez « {reference} » au dos du chèque.</p>
        </section>
      )}
    </>
  );
}
