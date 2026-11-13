"use client";

// Ce formulaire s'exécute dans le navigateur : il charge des données
// et réagit à la validation du formulaire.
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { IAdminTree, ICategory } from "@/@types";
import { clientApi } from "@/app/utils/clientApi";
import styles from "./TreeForm.module.css";

// Une disponibilité contient son identifiant et son nom.
type Availability = {
  id: number;
  name: IAdminTree["availabilityName"];
};

// Une photo contient son nom et le chemin à enregistrer pour l'arbre.
type TreePhoto = {
  name: string;
  photoUrl: string;
};

interface TreeFormProps {
  // Si "tree" est fourni, le formulaire modifie cet arbre.
  // Sans "tree", il crée un nouvel arbre.
  tree?: IAdminTree;
}

// Récupère le message d'erreur envoyé par l'API.
async function getApiError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return data?.error ?? "Une erreur est survenue.";
}

export default function TreeForm({ tree }: TreeFormProps) {
  // Permet de revenir à la liste après l'enregistrement.
  const router = useRouter();

  // Ces listes alimentent les choix du formulaire.
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [photos, setPhotos] = useState<TreePhoto[]>([]);

  // Ces états servent à afficher l'attente, les erreurs et le bouton désactivé.
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Charge les catégories, disponibilités et photos quand le formulaire s'ouvre.
  useEffect(() => {
    // Évite de modifier l'écran si on le quitte avant la réponse de l'API.
    let isMounted = true;

    async function loadChoices() {
      try {
        // Récupère les catégories disponibles.
        const categoryResponse = await clientApi("categories");

        if (!categoryResponse.ok) {
          throw new Error(await getApiError(categoryResponse));
        }

        // Récupère les disponibilités disponibles.
        const availabilityResponse = await clientApi("admin/availabilities");

        if (!availabilityResponse.ok) {
          throw new Error(await getApiError(availabilityResponse));
        }

        // Récupère les photos déjà présentes dans l'API.
        const photoResponse = await clientApi("admin/tree-photos");

        if (!photoResponse.ok) {
          throw new Error(await getApiError(photoResponse));
        }

        // Convertit les réponses de l'API en données JSON.
        const categoryData: unknown = await categoryResponse.json();
        const availabilityData: unknown = await availabilityResponse.json();
        const photoData: unknown = await photoResponse.json();

        // Vérifie que l'API a bien renvoyé trois listes.
        if (
          !Array.isArray(categoryData) ||
          !Array.isArray(availabilityData) ||
          !Array.isArray(photoData)
        ) {
          throw new Error("Les choix du formulaire sont invalides.");
        }

        // Enregistre les choix pour les afficher dans le formulaire.
        if (isMounted) {
          setCategories(categoryData as ICategory[]);
          setAvailabilities(availabilityData as Availability[]);
          setPhotos(photoData as TreePhoto[]);
        }
      } catch (error) {
        // Affiche l'erreur si une requête a échoué.
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Les choix du formulaire n’ont pas pu être chargés.",
          );
        }
      } finally {
        // Cache le message de chargement, même en cas d'erreur.
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // Démarre le chargement sans bloquer l'affichage du composant.
    void loadChoices();

    // Cette fonction s'exécute si on quitte la page.
    return () => {
      isMounted = false;
    };
  }, []);

  // Cette fonction s'exécute quand on clique sur « Enregistrer ».
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Empêche le navigateur de recharger toute la page.
    event.preventDefault();

    setErrorMessage("");
    setIsSaving(true);

    // FormData récupère les valeurs saisies dans le formulaire.
    const formData = new FormData(event.currentTarget);

    // Ces champs peuvent rester vides : l'API recevra alors null.
    function getOptionalText(fieldName: string): string | null {
      const value = String(formData.get(fieldName) ?? "").trim();

      return value === "" ? null : value;
    }

    // FormData fournit les nombres sous forme de texte.
    // Number() les convertit pour l'API.
    const treeInput = {
      name: String(formData.get("name") ?? ""),
      categoryId: Number(formData.get("categoryId")),
      description: getOptionalText("description"),
      price: Number(formData.get("price")),
      photoUrl: getOptionalText("photoUrl"),
      plantingLocation: getOptionalText("plantingLocation"),
      availabilityId: Number(formData.get("availabilityId")),
    };

    try {
      // Avec un arbre, on le modifie avec PATCH.
      // Sans arbre, on le crée avec POST.
      const response = tree
        ? await clientApi(`admin/trees/${tree.id}`, "PATCH", treeInput)
        : await clientApi("admin/trees", "POST", treeInput);

      // Si l'API refuse les données, on affiche son message.
      if (!response.ok) {
        setErrorMessage(await getApiError(response));
        return;
      }

      // L'enregistrement a réussi : retour à la liste.
      router.push("/admin/arbres");
    } catch {
      // Ce message s'affiche si l'API ne répond pas.
      setErrorMessage("L’enregistrement de l’arbre a échoué.");
    } finally {
      // Réactive le bouton après la réponse de l'API.
      setIsSaving(false);
    }
  }

  // Attend que les catégories, disponibilités et photos soient chargées.
  if (isLoading) {
    return <p role="status">Chargement du formulaire…</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Le lecteur d'écran annonce ce message comme une erreur. */}
      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      {/* Le nom de l'arbre est obligatoire. */}
      <label className={styles.field}>
        <span>Nom</span>
        <input
          name="name"
          type="text"
          maxLength={150}
          defaultValue={tree?.name ?? ""}
          required
        />
      </label>

      {/* Les radios d'un même groupe ont le même attribut "name". */}
      <fieldset className={styles.choices}>
        <legend>Catégorie</legend>

        {categories.map((category) => (
          <label className={styles.choice} key={category.id}>
            <input
              type="radio"
              name="categoryId"
              value={category.id}
              defaultChecked={category.id === tree?.categoryId}
              required
            />
            <span>{category.name}</span>
          </label>
        ))}
      </fieldset>

      {/* La description peut rester vide. */}
      <label className={styles.field}>
        <span>Description</span>
        <textarea name="description" defaultValue={tree?.description ?? ""} />
      </label>

      {/* Le prix est positif, avec deux décimales possibles. */}
      <label className={styles.field}>
        <span>Prix TTC en euros</span>
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={tree?.price ?? ""}
          required
        />
      </label>

      {/* La liste propose les photos présentes dans le dossier de l'API. */}
      <label className={styles.field}>
        <span>Photo</span>
        <select name="photoUrl" defaultValue={tree?.photoUrl ?? ""}>
          <option value="">Aucune photo</option>

          {photos.map((photo) => (
            <option key={photo.photoUrl} value={photo.photoUrl}>
              {photo.name}
            </option>
          ))}
        </select>
      </label>

      {/* Le lieu de plantation peut rester vide. */}
      <label className={styles.field}>
        <span>Lieu de plantation</span>
        <input
          name="plantingLocation"
          type="text"
          maxLength={150}
          defaultValue={tree?.plantingLocation ?? ""}
        />
      </label>

      {/* Le choix de disponibilité est obligatoire. */}
      <fieldset className={styles.choices}>
        <legend>Disponibilité</legend>

        {availabilities.map((availability) => (
          <label className={styles.choice} key={availability.id}>
            <input
              type="radio"
              name="availabilityId"
              value={availability.id}
              defaultChecked={availability.id === tree?.availabilityId}
              required
            />
            <span>{availability.name}</span>
          </label>
        ))}
      </fieldset>

      <div className={styles.formActions}>
        <button
          className={styles.submitButton}
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Enregistrement…" : "Enregistrer"}
        </button>

        {/* Ce lien quitte le formulaire sans enregistrer les changements. */}
        <Link className={styles.cancelLink} href="/admin/arbres">
          Annuler
        </Link>
      </div>
    </form>
  );
}
