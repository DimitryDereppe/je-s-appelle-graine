import type { Metadata } from "next";
// Ce composant récupère l'identifiant dans l'adresse
// et le transmet au composant client qui charge l'arbre.
import EditTreeForm from "./EditTreeForm";
import styles from "../../../page.module.css";

export const metadata: Metadata = {
  title: "Catalogue",
};

interface EditTreePageProps {
  // Next.js fournit les paramètres de l'adresse sous forme de promesse.
  params: Promise<{ id: string }>;
}

export default async function EditTreePage({ params }: EditTreePageProps) {
  // Exemple : si l'adresse est /admin/arbres/12/modifier, id vaut "12".
  const { id } = await params;

  return (
    <>
      <h1 className={styles.title}>Modifier un arbre</h1>
      <EditTreeForm treeId={id} />
    </>
  );
}
