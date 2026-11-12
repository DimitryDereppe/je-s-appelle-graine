// Le formulaire est vide : sans prop "tree", il fera un POST pour créer l'arbre.
import TreeForm from "@/components/admin/TreeForm";

// Ce fichier est dans le dossier "nouveau", donc il correspond à
// l'adresse /admin/arbres/nouveau.
import styles from "../../page.module.css";

export default function NewTreePage() {
  return (
    <>
      <h1 className={styles.title}>Ajouter un arbre</h1>
      <TreeForm />
    </>
  );
}
