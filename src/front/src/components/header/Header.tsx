"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import styles from "./header.module.css";
import Image from "next/image";
import { useCartCount } from "@/app/context/CartCountContext";

// ─── Constantes ───────────────────────────────────────────────────────────────
const navigationLinks = [
  { href: "/", label: "Accueil" },
  { href: "/arbres", label: "Nos arbres" },
  { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  firstname: string;
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Compteur d'articles dans le panier (partagé via le Context)
  const { itemCount } = useCartCount();

  // État local du menu mobile (hamburger)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // null = aucun utilisateur connecté (ou pas encore de réponse de l'API)
  const [user, setUser] = useState<User | null>(null);

  // Message à afficher sous l'en-tête (ex. compte désactivé) ; null = rien à afficher
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // ─── Fetch utilisateur à chaque changement de page ──────────────────────────
  // Le navigateur envoie le cookie automatiquement → l'API renvoie l'utilisateur
  useEffect(() => {
    // Flag de cancellation : évite qu'une réponse obsolète écrase l'état
    // si l'utilisateur navigue rapidement (race condition)
    let cancelled = false;

    async function fetchCurrentUser() {
      try {
        const response = await fetch("/api/users/me");

        // Réponse obsolète (l'utilisateur a déjà navigué ailleurs) → on ignore
        if (cancelled) return;

        // 403 : jeton valide, mais l'admin a désactivé le compte après la connexion
        //       → on affiche le message renvoyé par l'API, et l'en-tête d'un visiteur
        if (response.status === 403) {
          const data: { error: string } = await response.json();
          if (cancelled) return;
          setAlertMessage(data.error);
          setUser(null);
          return;
        }

        // 401 : simplement pas connecté, ce n'est pas une erreur à afficher
        if (!response.ok) {
          if (cancelled) return;
          setUser(null);
          setAlertMessage(null); // ← correction : on efface l'alerte éventuelle
          return;
        }

        // 200 : utilisateur connecté, on stocke ses infos
        const data: User = await response.json();
        if (cancelled) return;
        setUser(data);
        setAlertMessage(null); // ← correction : on efface l'alerte éventuelle
      } catch {
        if (cancelled) return;
        // API injoignable : on affiche l'en-tête comme pour un visiteur
        setUser(null);
        setAlertMessage(null); // ← correction : on efface l'alerte éventuelle
      }
    }

    fetchCurrentUser();

    // Cleanup : invalide la réponse en cours si le composant se démonte
    // ou si pathname change avant que le fetch ne soit terminé
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // ─── Déconnexion ────────────────────────────────────────────────────────────
  // L'API supprime le cookie, puis on oublie l'utilisateur côté front
  async function handleLogout() {
    try {
      const response = await fetch("/api/auth", { method: "DELETE" });

      // 204 : déconnexion réussie
      // 401 : jeton expiré ou invalide → on déconnecte aussi côté front
      // autre erreur (ex. 500) : on ne change rien
      if (!response.ok && response.status !== 401) {
        return;
      }

      setUser(null);
      setAlertMessage(null); // ← on efface aussi l'alerte à la déconnexion
      setIsMenuOpen(false);
      router.push("/");
    } catch {
      // API injoignable : on reste connecté, rien n'a changé
    }
  }

  // ─── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* ─── Logo / Marque ─────────────────────────────────────────────── */}
        <Link
          className={styles.brand}
          href="/"
          aria-label="Je s'appelle Graine, accueil"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/assets/graine-2-germination.ico"
            alt=""
            className={styles.badgeIcon}
            width={34}
            height={34}
          />
          <span className={styles.brandName}>Je s&apos;appelle Graine</span>
        </Link>

        {/* ─── Bouton hamburger (menu mobile) ────────────────────────────── */}
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

        {/* ─── Navigation + SearchBar ────────────────────────────────────── */}
        <div className={styles.navArea}>
          <nav
            id="site-navigation"
            className={`${styles.navigation} ${
              isMenuOpen ? styles.navigationOpen : ""
            }`}
            aria-label="Navigation principale"
          >
            {/* Liens de navigation principaux */}
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
            {/* Connecté : prénom avec lien vers mon compte + déconnexion ; visiteur : lien vers la connexion */}{" "}
            {user ? (
              <>
                <span className={styles.greeting}>
                  Bonjour {user.firstname}
                </span>
                <button
                  type="button"
                  className={`${styles.navigationLink} ${styles.logoutButton}`}
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

          {/* Barre de recherche (Suspense pour le lazy loading) */}
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        {/* ─── Icône panier + badge compteur ─────────────────────────────── */}
        <Link
          className={styles.cartLink}
          href="/panier"
          aria-label={
            itemCount > 0
              ? `Voir le panier (${itemCount} article${itemCount > 1 ? "s" : ""})`
              : "Voir le panier"
          }
          onClick={() => setIsMenuOpen(false)}
        >
          <span className={styles.cartIconWrapper}>
            <Image
              src={"/assets/panier.svg"}
              alt=""
              className={styles.badgeIcon}
              width={24}
              height={24}
            />
            {/* Badge : visible uniquement si le panier n'est pas vide */}
            {itemCount > 0 && (
              <span className={styles.cartBadge} aria-hidden="true">
                {itemCount}
              </span>
            )}
          </span>
          <span className={styles.visuallyHidden}>Panier</span>
        </Link>
      </div>

      {/* ─── Alert globale (ex. compte désactivé) ────────────────────────── */}
      {alertMessage && (
        <p className={styles.alert} role="alert">
          {alertMessage}
        </p>
      )}
    </header>
  );
}
