import type { Metadata } from "next";
import styles from "@/components/infoPage/infoPage.module.css";

export const metadata: Metadata = {
  title: "Mentions légales — Je s’appelle Graine",
  description:
    "Éditeur, direction de la publication, hébergement et propriété intellectuelle du site Je s’appelle Graine.",
};

// Texte du document mentions-legales-je-sappelle-graine.docx : (à compléter)
export default function LegalNoticePage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>Mentions légales</h1>
        <p className={styles.intro}>Dernière mise à jour : à venir</p>

        <h2>Éditeur du site</h2>
        <p>
          « Je s’appelle Graine » est un projet pédagogique réalisé par une
          équipe d’apprenants dans le cadre d’une formation O’Clock.
        </p>
        <p>
          Personne ou structure juridiquement responsable de la publication : à
          venir
        </p>
        <p>Adresse électronique : à venir</p>

        <h2>Direction de la publication</h2>
        <p>Directeur ou directrice de la publication : à venir</p>

        <h2>Hébergement</h2>
        <p>Le site est hébergé sur un VPS fourni par O’Clock.</p>

        <h2>Activité et commandes</h2>
        <p>
          « Je s’appelle Graine » présente des arbres proposés à la commande
          ainsi que les informations disponibles sur leur plantation.
        </p>
        <p>
          Le paiement en ligne n’est pas proposé. Les commandes sont réglées par
          virement bancaire ou par chèque, selon les modalités communiquées au
          moment de la commande.
        </p>
        <p>Conditions générales de vente : à venir</p>

        <h2>Propriété intellectuelle</h2>
        <p>
          Les textes, éléments graphiques, logos et autres contenus du site sont
          protégés par le droit de la propriété intellectuelle. Toute
          reproduction ou réutilisation sans autorisation est interdite, sauf
          disposition légale contraire.
        </p>
        <p>
          Les photographies utilisées sur le site proviennent de banques
          d’images proposant des images libres de droits. Elles sont utilisées
          conformément aux conditions de licence applicables à chaque image. Les
          crédits sont indiqués lorsque la licence l’exige.
        </p>
        <p>
          Pour toute question concernant un contenu, écrivez-nous : à venir.
        </p>
      </div>
    </main>
  );
}
