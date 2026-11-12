// Styles communs de l'espace admin.
import styles from "../page.module.css";
import TreeList from "./TreeList";

export default function AdminTreesPage() {
  return (
    <>
      <h1 className={styles.title}>Catalogue des arbres</h1>
      <TreeList />
    </>
  );
}
