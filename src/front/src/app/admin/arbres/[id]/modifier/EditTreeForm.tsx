"use client";

// Ce composant charge l'arbre dans le navigateur, avec le cookie de connexion.
import { useEffect, useState } from "react";
import type { IAdminTree } from "@/@types";
import { clientApi } from "@/app/utils/clientApi";
import TreeForm from "@/components/admin/TreeForm";
import styles from "../../../page.module.css";

interface EditTreeFormProps {
  // L'identifiant vient de l'adresse, par exemple /admin/arbres/12/modifier.
  treeId: string;
}

export default function EditTreeForm({ treeId }: EditTreeFormProps) {
  // "null" signifie que l'arbre n'est pas encore chargé.
  const [tree, setTree] = useState<IAdminTree | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Cherche l'arbre quand la page de modification s'ouvre.
  useEffect(() => {
    let isMounted = true;

    async function loadTree() {
      try {
        // Appelle GET /api/admin/trees/:id.
        const response = await clientApi(`admin/trees/${treeId}`);

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;

          throw new Error(data?.error ?? "L’arbre n’a pas pu être chargé.");
        }

        const data: IAdminTree = await response.json();

        if (isMounted) {
          setTree(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "L’arbre n’a pas pu être chargé.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTree();

    // Évite de mettre à jour le composant si on quitte la page pendant l'appel.
    return () => {
      isMounted = false;
    };
  }, [treeId]);

  if (isLoading) {
    return <p role="status">Chargement de l’arbre…</p>;
  }

  // Si l'API renvoie une erreur, le formulaire ne s'affiche pas.
  if (errorMessage || !tree) {
    return (
      <p className={styles.error} role="alert">
        {errorMessage || "Arbre introuvable."}
      </p>
    );
  }

  // On transmet l'arbre au formulaire pour préremplir les champs
  // et lui faire envoyer un PATCH à la validation.
  return <TreeForm tree={tree} />;
}
