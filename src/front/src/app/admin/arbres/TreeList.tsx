"use client";

// Cette liste doit tourner dans le navigateur : elle utilise des états,
// des clics et des appels à l'API.
import Link from "next/link";
import { useEffect, useState } from "react";
import type { IAdminTree } from "@/@types";
import { clientApi } from "@/app/utils/clientApi";
import { formatEuros } from "@/app/utils/format";
import styles from "./page.module.css";

// Lit le message d'erreur envoyé par l'API.
// Par exemple : { "error": "Cet arbre a déjà été commandé." }
async function getApiError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  // Si l'API n'a pas fourni de message, on affiche un message par défaut.
  return payload?.error ?? "Une erreur est survenue.";
}

export default function TreeList() {
  // Les arbres reçus de l'API, affichés sous forme de cartes.
  const [trees, setTrees] = useState<IAdminTree[]>([]);

  // Indique si le premier chargement est encore en cours.
  const [isLoading, setIsLoading] = useState(true);

  // Message d'erreur affiché à l'écran, s'il y en a un.
  const [errorMessage, setErrorMessage] = useState("");

  // Message affiché après une suppression réussie.
  const [statusMessage, setStatusMessage] = useState("");

  // Identifiant de l'arbre en cours de suppression.
  // Il sert à désactiver son bouton pendant l'appel à l'API.
  const [deletingTreeId, setDeletingTreeId] = useState<number | null>(null);

  // Charge la liste quand le composant apparaît dans la page.
  useEffect(() => {
    // Cette variable évite de modifier l'écran si on quitte la page
    // avant que la réponse de l'API arrive.
    let isMounted = true;

    async function loadTrees() {
      try {
        // clientApi ajoute déjà "/api/" à cette adresse.
        const response = await clientApi("admin/trees");

        // Une réponse qui n'a pas le statut 2xx est une erreur.
        if (!response.ok) {
          throw new Error(await getApiError(response));
        }

        // Les données de l'API arrivent en JSON.
        const data: unknown = await response.json();

        // On vérifie que l'API a bien renvoyé une liste.
        if (!Array.isArray(data)) {
          throw new Error("La réponse de l’API n’a pas le format attendu.");
        }

        // TypeScript ne peut pas vérifier les champs du JSON reçu.
        // On indique ici que chaque élément suit le type IAdminTree.
        if (isMounted) {
          setTrees(data as IAdminTree[]);
        }
      } catch (error) {
        // Cette partie s'exécute si l'API répond en erreur
        // ou si la requête ne peut pas aboutir.
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Le catalogue n’a pas pu être chargé.",
          );
        }
      } finally {
        // finally s'exécute que le chargement ait réussi ou échoué.
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // On lance le chargement. "void" indique qu'on ne bloque pas l'effet
    // en attendant la fonction asynchrone.
    void loadTrees();

    // Cette fonction est appelée si on quitte la page.
    return () => {
      isMounted = false;
    };
  }, []);

  // Demande confirmation, appelle l'API, puis retire l'arbre de la liste.
  async function deleteTree(tree: IAdminTree) {
    const confirmed = window.confirm(`Supprimer l’arbre « ${tree.name} » ?`);

    // Si la personne choisit « Annuler », on s'arrête ici.
    if (!confirmed) return;

    // On efface les anciens messages avant de lancer la suppression.
    setErrorMessage("");
    setStatusMessage("");
    setDeletingTreeId(tree.id);

    try {
      // On appelle DELETE /api/admin/trees/:id.
      const response = await clientApi(`admin/trees/${tree.id}`, "DELETE");

      // En cas d'erreur, on affiche le message de l'API.
      // Par exemple, l'API répond 409 si l'arbre a déjà été commandé.
      if (!response.ok) {
        setErrorMessage(await getApiError(response));
        return;
      }

      // La suppression a réussi : on garde tous les autres arbres.
      setTrees((currentTrees) =>
        currentTrees.filter((currentTree) => currentTree.id !== tree.id),
      );

      setStatusMessage(`L’arbre « ${tree.name} » a été supprimé.`);
    } catch {
      // Cette erreur peut arriver si l'API est inaccessible.
      setErrorMessage("La suppression de l’arbre a échoué.");
    } finally {
      // On réactive le bouton, même si la suppression a échoué.
      setDeletingTreeId(null);
    }
  }

  // Pendant le premier appel à l'API, on affiche un message d'attente.
  if (isLoading) {
    return <p role="status">Chargement des arbres…</p>;
  }

  return (
    <section className={styles.listSection} aria-label="Catalogue des arbres">
      <div className={styles.toolbar}>
        <p className={styles.treeCount}>
          {trees.length} arbre(s) dans le catalogue
        </p>

        {/* Ce lien ouvre le formulaire de création. */}
        <Link className={styles.addLink} href="/admin/arbres/nouveau">
          Ajouter un arbre
        </Link>
      </div>

      {/* role="alert" signale immédiatement l'erreur aux lecteurs d'écran. */}
      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      {/* role="status" annonce la réussite sans interrompre la lecture. */}
      {statusMessage && (
        <p className={styles.success} role="status">
          {statusMessage}
        </p>
      )}

      {trees.length === 0 ? (
        <p>Aucun arbre dans le catalogue.</p>
      ) : (
        <ul className={styles.treeList}>
          {trees.map((tree) => (
            <li className={styles.treeCard} key={tree.id}>
              <article aria-labelledby={`tree-${tree.id}`}>
                <h2 id={`tree-${tree.id}`}>{tree.name}</h2>

                {/* Les détails sont présentés en paires : intitulé et valeur. */}
                <dl className={styles.details}>
                  <div>
                    <dt>Catégorie</dt>
                    <dd>{tree.categoryName}</dd>
                  </div>

                  <div>
                    <dt>Prix TTC</dt>
                    <dd>{formatEuros(tree.price)}</dd>
                  </div>

                  <div>
                    <dt>Disponibilité</dt>
                    <dd>{tree.availabilityName}</dd>
                  </div>
                </dl>

                <div className={styles.actions}>
                  {/* Le nom dans aria-label distingue les liens pour les lecteurs d'écran. */}
                  <Link
                    className={styles.actionLink}
                    href={`/admin/arbres/${tree.id}/modifier`}
                    aria-label={`Modifier ${tree.name}`}
                  >
                    Modifier
                  </Link>

                  <button
                    className={styles.deleteButton}
                    type="button"
                    onClick={() => void deleteTree(tree)}
                    disabled={deletingTreeId === tree.id}
                    aria-label={`Supprimer ${tree.name}`}
                  >
                    {deletingTreeId === tree.id ? "Suppression…" : "Supprimer"}
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
