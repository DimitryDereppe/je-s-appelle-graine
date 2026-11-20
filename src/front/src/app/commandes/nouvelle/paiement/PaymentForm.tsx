"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { IOrderWithInstructions } from "../../../../@types";
import { clientApi } from "../../../utils/clientApi";
import { useCartCount } from "@/app/context/CartCountContext";
import styles from "./page.module.css";

export function PaymentForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { refresh } = useCartCount();

  async function handlePayment(formData: FormData) {
    setErrorMessage("");

    // 1. Lire les champs
    // radio non choisi → null ; l'API répondra « Mode de paiement invalide. »
    const paymentMethod = formData.get("paymentMethod");
    // case cochée → "on", case non cochée → null : on en fait un booléen
    const paymentCommitment = formData.get("paymentCommitment") === "on";
    const billingAddress = formData.get("billingAddress");

    try {
      // 2. Envoyer la commande : l'API lit le panier elle-même
      const response = await clientApi("orders", "POST", {
        paymentMethod,
        paymentCommitment,
        billingAddress,
      });

      // 3. Traiter la réponse
      if (response.status === 401) {
        // pas connecté : on revient ici après la connexion
        router.push("/connexion?next=/commandes/nouvelle/paiement");
        return;
      }
      if (response.status === 400 || response.status === 409) {
        // l'API renvoie { error: "…" }, un message déjà écrit pour le client
        const data = await response.json();
        setErrorMessage(data.error);
        return;
      }
      if (!response.ok) {
        setErrorMessage("Quelque chose n’a pas fonctionné.");
        return;
      }

      // 201 : commande créée, on affiche sa confirmation grâce à son id
      const order: IOrderWithInstructions = await response.json();
      // l'API a vidé le panier : le compteur et /panier se mettent à jour
      await refresh();
      router.push(`/commandes/${order.id}/confirmation`);
    } catch {
      setErrorMessage("Une erreur est survenue.");
    }
  }

  return (
    <form className={styles.form} action={handlePayment}>
      <p className={styles.requiredNote}>* (champs obligatoires)</p>

      {/* fieldset + legend : les lecteurs d'écran annoncent la question avant les choix */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Mode de paiement *</legend>
        {/* même name : cocher l'un décoche l'autre */}
        <label className={styles.choice}>
          <input type="radio" name="paymentMethod" value="virement" required />
          Virement bancaire
        </label>
        <label className={styles.choice}>
          <input type="radio" name="paymentMethod" value="chèque" />
          Chèque
        </label>
      </fieldset>

      <label className={styles.label} htmlFor="billingAddress">
        Adresse de facturation *
      </label>
      <textarea
        className={styles.input}
        id="billingAddress"
        name="billingAddress"
        rows={4}
        maxLength={255}
        autoComplete="street-address"
        required
      />

      <label className={styles.commitment}>
        <input type="checkbox" name="paymentCommitment" required />
        Je m’engage à effectuer mon paiement sous 10 jours, sinon ma commande
        sera annulée *
      </label>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      <button className={styles.submit} type="submit">
        Valider ma commande
      </button>
    </form>
  );
}
