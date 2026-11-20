import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import commonStyles from "@/components/infoPage/infoPage.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Qui sommes-nous",
  description:
    "La mission de Je s’appelle Graine : contribuer à la reforestation en offrant un arbre à une forêt française.",
};

// A valider avec la team
export default function AboutPage() {
  return (
    <main className={`${commonStyles.main} ${styles.aboutMain}`}>
      <div className={`${commonStyles.content} ${styles.aboutContent}`}>
        <h1 className={`${commonStyles.title} ${styles.aboutTitle}`}>
          Qui sommes-nous
        </h1>
        <p className={styles.intro}>
          Je s’appelle Graine permet à chacun d’offrir un arbre à une forêt
          française qui en a besoin.
        </p>

        <h2>Notre mission</h2>

        <p>
          Replanter des essences locales, adaptées au sol et au climat de chaque
          région, avec des forestiers et des associations partenaires, afin de
          redonner à nos forêts dévastées leur beauté et d’aider notre Terre à
          retrouver son souffle.
        </p>

        <div className={styles.missionImages}>
          <Image
            className={styles.missionImage}
            src="/assets/foret-deboisement.jpg"
            alt="une forêt ayant subi des coupes et des dégats"
            width={760}
            height={420}
            // sizes="(min-width: 768px) 736px, 100vw"
          />
          <Image
            className={styles.missionImage}
            src="/assets/foret-verdoyante.jpg"
            alt="une forêt luxuriante pleine d'arbres feuillus et vert"
            width={760}
            height={420}
            // sizes="(min-width: 768px) 736px, 100vw"
          />
        </div>

        <h2>Comment un arbre est choisi et planté</h2>
        <ul>
          <li>
            Chaque essence est choisie avec nos partenaires pour sa résistance
            et sa place dans la forêt : découvrez{" "}
            <Link href="/nos-forets">nos forêts et leurs mélanges</Link>.
          </li>
          <li>
            Vous choisissez votre arbre dans le catalogue : sa fiche indique son
            lieu de plantation.
          </li>
          <li>
            Après la réception de votre paiement, l’arbre est planté pendant la
            saison de plantation.
          </li>
        </ul>

        <Image
          className={styles.image}
          src="/assets/personnes-qui-plante.jpg"
          alt="un homme a gauche et une femme à droite de l'image qui plantent une jeune pousse "
          width={760}
          height={420}
          sizes="(min-width: 1072px) 1024px, (min-width: 768px) calc(100vw - 3rem), calc(100vw - 2rem)"
        />
        <h2>Un suivi transparent</h2>
        <p className={styles.followUpText}>
          Dans votre espace, chaque commande indique son statut : en attente de
          paiement, payée, puis plantée.
        </p>
        <div className={styles.followUpImageFrame}>
          <Image
            className={styles.followUpImage}
            src="/assets/suivi.png"
            alt="Espace client, paiement en attente, paiement confirmé et arbre planté"
            fill
            sizes="100vw"
          />
        </div>
        <Link
          className={`${commonStyles.button} ${styles.aboutButton}`}
          href="/arbres"
        >
          Voir nos arbres
        </Link>
      </div>
    </main>
  );
}
