import type { Metadata } from "next";
import Link from "next/link";
import { DeleteAccount } from "./DeleteAccount";
import { PasswordForm } from "./PasswordForm";
import { ProfileForm } from "./ProfileForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Mon compte",
  description:
    "Vos commandes, vos informations personnelles et votre mot de passe.",
  // page privée : les moteurs de recherche ne l'indexent pas
  robots: { index: false },
};

// Page /compte : un menu, puis un bloc par action ; chaque bloc (page client client) appelle l'API
export default function AccountPage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>Mon compte</h1>

        {/* nav : un menu ; les ancres (#…) descendent jusqu'au bloc de la même page */}
        <nav aria-label="Mon compte">
          <ul className={styles.menu}>
            <li>
              <Link href="/commandes" className={styles.menuItem}>
                <strong>Suivre mes commandes</strong>
              </Link>
            </li>
            <li>
              <a href="#informations" className={styles.menuItem}>
                <strong>Modifier mes informations</strong>
              </a>
            </li>
            <li>
              <a href="#mot-de-passe" className={styles.menuItem}>
                <strong>Modifier mon mot de passe</strong>
              </a>
            </li>
            <li>
              <a
                href="#suppression"
                className={`${styles.menuItem} ${styles.danger}`}
              >
                <strong>Supprimer mon compte</strong>
              </a>
            </li>
          </ul>
        </nav>

        {/* id du titre : la cible de l'ancre du menu ; aria-labelledby : la section porte le nom de son titre */}
        <section className={styles.section} aria-labelledby="informations">
          <h2 id="informations" className={styles.sectionTitle}>
            Mes informations
          </h2>
          <ProfileForm />
        </section>

        <section className={styles.section} aria-labelledby="mot-de-passe">
          <h2 id="mot-de-passe" className={styles.sectionTitle}>
            Mot de passe
          </h2>
          <PasswordForm />
        </section>

        <section className={styles.section} aria-labelledby="suppression">
          <h2 id="suppression" className={styles.sectionTitle}>
            Supprimer mon compte
          </h2>
          <DeleteAccount />
        </section>
      </div>
    </main>
  );
}
