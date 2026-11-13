import styles from "./page.module.css";

// Accueil de l'espace admin : le titre, puis les boutons des rubriques (affichés par AdminGuard)
// une vraie page plutôt qu'une redirection : « Administration » ne mène jamais à une 404,
// même tant qu'une page admin n'est pas encore faite
export default function AdminPage() {
  return (
    <>
      <h1 className={styles.title}>Espace administrateur</h1>
      {/* les boutons des rubriques s'affichent juste en dessous (AdminGuard) */}
      <p className={styles.subtitle}>Choisissez votre rubrique :</p>
    </>
  );
}
