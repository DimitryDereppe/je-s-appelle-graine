"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./header.module.css";
import Image from "next/image";

const navigationLinks = [
  { href: "/", label: "Accueil" },
  { href: "/arbres", label: "Nos arbres" },
  { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
];

// Ce dont l'en-tête a besoin dans la réponse de GET /api/users/me
interface User {
  firstname: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // null = aucun utilisateur connecté (ou pas encore de réponse de l'API)
  const [user, setUser] = useState<User | null>(null);

  // Au premier affichage : demander à l'API qui est connecté (le navigateur envoie le cookie)
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch("/api/users/me");
        if (!response.ok) {
          // 401 : simplement pas connecté, ce n'est pas une erreur à afficher
          setUser(null);
          return;
        }
        const data: User = await response.json();
        setUser(data);
      } catch {
        // API injoignable : on affiche l'en-tête comme pour un visiteur
        setUser(null);
      }
    }
    fetchCurrentUser();
  }, []);

  // Au clic sur « Déconnexion » : l'API supprime le cookie, puis on oublie l'utilisateur
  async function handleLogout() {
    try {
      const response = await fetch("/api/auth", { method: "DELETE" });
      if (!response.ok) {
        return;
      }
      setUser(null);
      setIsMenuOpen(false);
      router.push("/");
    } catch {
      // API injoignable : on reste connecté, rien n'a changé
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="Je s’appelle Graine, accueil"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/assets/graine-2-germination.ico"
            alt=""
            className={styles.badgeIcon}
            width={34}
            height={34}
          />{" "}
          <span className={styles.brandName}>Je s’appelle Graine</span>
        </Link>

        <button
          className={styles.menuToggle}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation"
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
        </button>

        <nav
          id="site-navigation"
          className={`${styles.navigation} ${
            isMenuOpen ? styles.navigationOpen : ""
          }`}
          aria-label="Navigation principale"
        >
          {navigationLinks.map(({ href, label }) => (
            <Link
              key={href}
              className={`${styles.navigationLink} ${
                pathname === href ? styles.activeLink : ""
              }`}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          {/* Connecté : prénom + déconnexion ; visiteur : lien vers la connexion */}
          {user ? (
            <>
              <span className={styles.navigationLink}>
                Bonjour {user.firstname}
              </span>
              <button
                type="button"
                className={styles.navigationLink}
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              className={`${styles.navigationLink} ${
                pathname === "/connexion" ? styles.activeLink : ""
              }`}
              href="/connexion"
              aria-current={pathname === "/connexion" ? "page" : undefined}
              onClick={() => setIsMenuOpen(false)}
            >
              Connexion
            </Link>
          )}
        </nav>

        <Link
          className={styles.cartLink}
          href="/panier"
          aria-label="Voir le panier"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src={"/assets/panier.svg"}
            alt=""
            className={styles.badgeIcon}
            width={24}
            height={24}
          />
          <span className={styles.visuallyHidden}>Panier</span>
        </Link>
      </div>
    </header>
  );
}
