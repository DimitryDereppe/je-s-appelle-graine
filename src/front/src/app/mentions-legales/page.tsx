import type { Metadata } from "next";
import styles from "@/components/infoPage/infoPage.module.css";

export const metadata: Metadata = {
  title: "Mentions légales — Je s’appelle Graine",
  description:
    "Éditeur, direction de la publication, hébergement et propriété intellectuelle du site Je s’appelle Graine.",
};

export default function LegalNoticePage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>Mentions légales</h1>
        <p className={styles.intro}>Dernière mise à jour : à venir</p>

        <h2>Éditeur du site</h2>
        <p>
          « Je s’appelle Graine » est un projet réalisé par une équipe
          d’apprenants dans le cadre d’une formation O’Clock.
        </p>
        <p>
          Personne ou structure juridiquement responsable de la publication :{" "}
          <em>à venir</em>.
        </p>
        <p>
          Adresse électronique :{" "}
          <a href="mailto:contact@graine.fr">contact@graine.fr</a>
        </p>

        <h2>Direction de la publication</h2>
        <p>
          Directeur ou directrice de la publication : <em>à venir</em>.
        </p>

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

        <h2>Conditions générales de vente</h2>

        <h3>1. Vendeur</h3>
        <p>
          Les arbres proposés sur le site sont destinés à être plantés en forêt.
          Courriel : <a href="mailto:contact@graine.fr">contact@graine.fr</a>.
          Adresse postale, statut juridique et numéro d’immatriculation :{" "}
          <em>à venir</em>.{" "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053310511/2026-10-05">
            Article L. 221-5 du Code de la consommation
          </a>
          .
        </p>

        <h3>2. Objet de la vente et plantation</h3>
        <p>
          Les présentes conditions encadrent l’achat d’un arbre proposé dans le
          catalogue. L’arbre acheté est destiné à être planté en forêt ; il
          n’est pas expédié au domicile de l’acheteur. La fiche de chaque arbre
          précise son lieu de plantation.{" "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053310511/2026-10-05">
            Article L. 221-5 : caractéristiques du bien ou du service
          </a>
          .
        </p>
        <p>
          La plantation est réalisée par des entreprises partenaires et des
          bénévoles. La période de plantation et le délai à prévoir sont{" "}
          <em>à préciser</em>.{" "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053310511/2026-10-05">
            Article L. 221-5 : délai d’exécution
          </a>
          .
        </p>

        <h3>3. Prix</h3>
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises (TTC). Aucun
          frais supplémentaire n’est ajouté par « Je s’appelle Graine » au prix
          affiché.{" "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053310511/2026-10-05">
            Article L. 221-5 : information préalable sur le prix
          </a>
          .
        </p>

        <h3>4. Commande</h3>
        <p>
          Avant de confirmer sa commande, l’acheteur peut vérifier les arbres
          sélectionnés et le montant total. Les modalités précises de
          confirmation seront indiquées au moment de l’achat.{" "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563210/2026-05-19">
            Article L. 221-13 : confirmation du contrat
          </a>
          .
        </p>

        <h3>5. Paiement</h3>
        <p>
          Les moyens de paiement acceptés et le moment où la commande est
          considérée comme réglée sont <em>à confirmer</em>. Ils seront indiqués
          au début du processus de commande.{" "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032226854/2026-06-26">
            Article L. 221-14 : moyens de paiement acceptés
          </a>
          .
        </p>

        <h3>6. Rétractation et remboursement</h3>
        <p>
          Le délai général de rétractation pour un contrat conclu à distance est
          de quatorze jours. Des exceptions peuvent s’appliquer. Les modalités
          de rétractation et de remboursement pour l’achat d’un arbre destiné à
          être planté sont <em>à préciser après validation</em>.{" "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032226842/2026-05-20">
            Article L. 221-18 : délai de rétractation
          </a>
          {" · "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563170/2026-05-20">
            Article L. 221-28 : exceptions
          </a>
          {" · "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032226828/2026-03-02">
            Article L. 221-24 : remboursement
          </a>
          .
        </p>

        <h3>7. Réclamations et médiation</h3>
        <p>
          Pour toute question ou réclamation, l’acheteur peut écrire à{" "}
          <a href="mailto:contact@graine.fr">contact@graine.fr</a>. Le nom et
          les coordonnées du médiateur de la consommation sont <em>à venir</em>.{" "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032224762/2026-04-28">
            Article L. 616-1 : coordonnées du médiateur
          </a>
          .
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          Les textes, éléments graphiques, logos et autres contenus du site sont
          protégés par le droit de la propriété intellectuelle. Toute
          reproduction ou réutilisation sans autorisation est interdite, sauf
          disposition légale contraire.{" "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042814694/2026-09-21">
            Article L. 111-1 du Code de la propriété intellectuelle
          </a>
          {" · "}
          <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006278911/2026-06-25">
            Article L. 122-4 du Code de la propriété intellectuelle
          </a>
          .
        </p>
        <p>
          Les photographies utilisées sur le site proviennent de banques
          d’images proposant des images libres de droits. Elles sont utilisées
          conformément aux conditions de licence applicables à chaque image. Les
          crédits sont indiqués lorsque la licence l’exige.
        </p>
        <p>
          Pour toute question concernant un contenu, écrivez-nous :{" "}
          <em>à venir</em>.
        </p>
      </div>
    </main>
  );
}
