"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IAccount } from "../../@types";
import { clientApi } from "../utils/clientApi";
// les trois blocs de la page, affichés seulement quand le compte est chargé
import { DeleteAccount } from "./DeleteAccount";
import { PasswordForm } from "./PasswordForm";
import { ProfileForm } from "./ProfileForm";
import styles from "./page.module.css";

// Contenu de /compte : rien n'est affiché tant que l'API n'a pas confirmé la connexion
// (sinon un visiteur verrait le menu et les formulaires avant d'être redirigé)
export function AccountContent() {
  // null tant que le compte n'est pas chargé
  const [account, setAccount] = useState<IAccount | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  // pour changer de page depuis le code (redirection vers la connexion)
  const router = useRouter();

  // chargement du compte une fois la page affichée dans le navigateur (qui envoie le cookie)
  useEffect(() => {
    // useEffect ne peut pas être async : on déclare une fonction async, appelée juste après
    async function loadAccount() {
      try {
        const response = await clientApi("users/me");

        if (response.status === 401) {
          // pas connecté : la page de connexion nous renvoie ici ensuite
          router.push("/connexion?next=/compte");
          return;
        }
        // autre erreur de l'API (ex. 403 compte désactivé, 500)
        if (!response.ok) {
          setErrorMessage("Quelque chose n’a pas fonctionné.");
          return;
        }

        // le compte connecté : l'affichage passe de « Chargement… » à la page
        setAccount(await response.json());
      } catch {
        // l'API n'a pas répondu : sans ce message, le chargement durerait toujours
        setErrorMessage("Une erreur est survenue.");
      }
    }

    loadAccount();
    // dépendances = ce que l'effet utilise et qui vient du composant ;
    // router ne change jamais : l'effet ne se lance qu'une fois
  }, [router]);

  // un seul affichage à la fois : erreur, chargement, ou la page
  if (errorMessage) {
    return (
      <p className={styles.error} role="alert">
        {errorMessage}
      </p>
    );
  }

  // null : la réponse de l'API n'est pas encore arrivée (ou on part vers la connexion)
  if (!account) {
    return <p className={styles.subtitle}>Chargement de votre compte…</p>;
  }

  // <> </> (fragment) : renvoie le menu et les sections sans ajouter de balise autour
  return (
    <>
      {/* nav : un menu ; les ancres (#…) descendent jusqu'au bloc de la même page */}
      {/* aria-label : distingue ce menu du menu principal de l'en-tête pour les lecteurs d'écran */}
      <nav aria-label="Mon compte">
        <ul className={styles.menu}>
          <li>
            {/* Link : change de page ; <a href="#…"> : reste sur la page et descend jusqu'au bloc */}
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
        {/* le compte déjà chargé : ProfileForm n'a pas à rappeler l'API */}
        <ProfileForm initialAccount={account} />
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
    </>
  );
}
