"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IAccount } from "@/@types";
import { clientApi } from "@/app/utils/clientApi";
import styles from "./page.module.css";

// Menu de l'espace admin, affiché au-dessus de chaque page admin
// (en dehors du composant : il ne change jamais, inutile de le recréer à chaque affichage)
const adminLinks = [
  { href: "/admin/arbres", label: "Catalogue" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/comptes", label: "Comptes" },
];

interface AdminGuardProps {
  // la page admin ouverte, que Next.js passe au layout puis le layout à AdminGuard
  // React.ReactNode : tout ce qu'on peut afficher en JSX (balises, texte, composants)
  children: React.ReactNode;
}

// Affiche la page admin seulement à un admin connecté.
// Ne fait que choisir l'affichage : la vraie protection est dans l'API (401, 403).
export function AdminGuard({ children }: AdminGuardProps) {
  // trois états : null = vérification en cours, true = admin, false = connecté mais pas admin
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  // adresse de la page ouverte (ex. "/admin/arbres"), pour le retour après la connexion et le menu
  const pathname = usePathname();
  // pour changer de page depuis le code (redirection vers la connexion)
  const router = useRouter();

  // à chaque page admin ouverte (pathname dans les dépendances) : redemander à l'API qui est connecté
  useEffect(() => {
    // useEffect ne peut pas être async : on déclare une fonction async, appelée juste après
    async function checkAdmin() {
      try {
        const response = await clientApi("users/me");

        if (response.status === 401) {
          // pas connecté : la page de connexion nous renvoie ici ensuite
          // encodeURIComponent : protège les caractères spéciaux de l'adresse dans ?next=
          router.push(`/connexion?next=${encodeURIComponent(pathname)}`);
          return;
        }
        // autre erreur de l'API (ex. 403 compte désactivé, 500)
        if (!response.ok) {
          setErrorMessage("Quelque chose n’a pas fonctionné.");
          return;
        }

        const account: IAccount = await response.json();
        // vrai pour un admin, faux pour un client
        setIsAdmin(account.role === "admin");
      } catch {
        // l'API n'a pas répondu : sans ce message, la vérification durerait toujours
        setErrorMessage("Une erreur est survenue.");
      }
    }

    checkAdmin();
    // pathname change à chaque page admin : on revérifie (ex. compte désactivé entre-temps)
  }, [pathname, router]);

  // un seul affichage à la fois : erreur, vérification, accès refusé, ou la page admin

  if (errorMessage) {
    return (
      <main className={styles.main}>
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      </main>
    );
  }

  // === null et pas !isAdmin : false (pas admin) est un autre cas, traité juste après
  if (isAdmin === null) {
    return (
      <main className={styles.main}>
        <p className={styles.subtitle}>Vérification de vos droits…</p>
      </main>
    );
  }

  // client connecté : rien de l'espace admin n'est affiché
  if (!isAdmin) {
    return (
      <main className={styles.main}>
        <p className={styles.error} role="alert">
          Accès réservé à l’administrateur.
        </p>
      </main>
    );
  }

  // le menu des rubriques, gardé dans une variable pour le placer selon la page
  const adminMenu = (
    <>
      {/* aria-label : distingue ce menu du menu principal de l'en-tête pour les lecteurs d'écran */}
      <nav aria-label="Espace administrateur">
        <ul className={styles.menu}>
          {/* même écriture que les liens de l'en-tête (Header.tsx) */}
          {adminLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                // startsWith : true si l'adresse commence par href ;
                // « Catalogue » reste donc en avant sur toutes les pages du catalogue (la liste, l'ajout et la modification d'un arbre)
                className={`${styles.menuLink} ${
                  pathname.startsWith(href) ? styles.menuLinkActive : ""
                }`}
                aria-current={pathname.startsWith(href) ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );

  // admin : sur l'accueil (/admin), le titre puis le menu ; ailleurs, le menu puis la page
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        {/* ternaire (condition ? A : B) : le if / else*/}
        {pathname === "/admin" ? (
          <>
            {/* accueil : le titre et « Choisissez votre rubrique : »… */}
            {children}
            {/* …puis les boutons des rubriques */}
            {adminMenu}
          </>
        ) : (
          <>
            {/* autres pages : le menu en haut, pour changer de rubrique sans descendre… */}
            {adminMenu}
            {/* …puis la page admin ouverte (catalogue, commandes ou comptes) */}
            {children}
          </>
        )}
      </div>
    </main>
  );
}
