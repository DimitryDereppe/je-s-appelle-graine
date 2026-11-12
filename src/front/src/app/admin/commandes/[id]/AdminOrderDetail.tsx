"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IAdminOrderDetail } from "../../../../@types";
import { clientApi } from "../../../utils/clientApi";
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

  // détail complet : étape 5b (acheteur, adresse, lignes, dates)
  return <h1 className={styles.title}>Commande n° {order.id}</h1>;
}
