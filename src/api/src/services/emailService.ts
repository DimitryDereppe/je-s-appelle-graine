// Service d'envoi d'emails (carte #105) : ni HTTP (contrôleur) ni BDD (datamapper),
// seulement la mise en forme et l'envoi. Le contrôleur lui donne tout ce qu'il faut.
import nodemailer from "nodemailer";
import type { IAccountProfile, IOrder } from "../@types/index.d.ts";
import { config } from "../../config.ts";

// instructions de paiement, calculées par le contrôleur (getPaymentInstructions)
// | : soit les coordonnées bancaires (virement), soit l'ordre et l'adresse (chèque)
type PaymentInstructions =
  | { iban: string; bic: string; holder: string }
  | { payableTo: string; address: string };

// --------------------------------
// transporteur : la connexion au serveur d'envoi, créée une seule fois au démarrage
// --------------------------------
// sans SMTP_HOST (dev et tests) : pas de transporteur, l'email sera affiché dans la console
// ? : (ternaire) : si host existe → on crée le transporteur, sinon → null
const transporter = config.mail.host
  ? nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: config.mail.auth,
    })
  : null;

// --------------------------------
// email de confirmation de commande (US25)
// --------------------------------
export async function sendOrderConfirmation(
  account: IAccountProfile,
  order: IOrder,
  paymentInstructions: PaymentInstructions,
) {
  // mêmes informations que la page de confirmation (carte #105) :
  // référence, montant TTC, date limite, lignes, adresse de facturation, instructions de paiement

  // date limite : "2026-11-15" → "15/11/2026"
  // split coupe le texte à chaque "-" → ["2026", "11", "15"],
  // reverse inverse l'ordre → ["15", "11", "2026"], join recolle avec "/"
  const dueDate = order.dueDate.split("-").reverse().join("/");

  // montant : 50.7 → "50,70 €" (toFixed(2) : toujours 2 chiffres après la virgule,
  // replace : virgule à la française)
  const formatEuros = (amount: number) =>
    `${amount.toFixed(2).replace(".", ",")} €`;

  // une ligne de texte par arbre commandé
  // map transforme chaque ligne de commande en texte, join les colle avec un retour à la ligne
  const lines = order.lines
    .map((line) => {
      // le lieu de plantation peut être absent (null) : on ne l'écrit que s'il existe
      const location = line.plantingLocation
        ? ` — planté à : ${line.plantingLocation}`
        : "";
      return `- ${line.treeName} × ${line.quantity} : ${formatEuros(line.unitPrice * line.quantity)}${location}`;
    })
    .join("\n");

  // instructions selon le mode de paiement
  // "iban" in paymentInstructions : vrai si l'objet a une propriété iban (virement) ;
  // TypeScript sait alors quel côté du type | on manipule dans chaque branche
  const instructions =
    "iban" in paymentInstructions
      ? `Paiement par virement :
IBAN : ${paymentInstructions.iban}
BIC : ${paymentInstructions.bic}
Titulaire : ${paymentInstructions.holder}
Indiquez « Commande n° ${order.id} » dans le libellé du virement.`
      : `Paiement par chèque : n°
À l'ordre de : ${paymentInstructions.payableTo}
À envoyer à : ${paymentInstructions.address}
Écrivez « Commande n° ${order.id} » au dos du chèque.`;

  // le texte complet : un template literal garde les retours à la ligne tels quels
  const text = `Bonjour ${account.firstname},

Votre commande n° ${order.id} est confirmée. Merci pour votre geste pour la forêt !

Montant TTC : ${formatEuros(order.totalAmount)}
À payer avant le : ${dueDate} (sinon la commande sera annulée)

Vos arbres :
${lines}

Adresse de facturation :
${order.billingAddress}

${instructions}

L'équipe Je s'appelle Graine`;

  // l'email, au format attendu par Nodemailer
  const email = {
    from: config.mail.from,
    to: account.email,
    subject: `Commande n° ${order.id} confirmée`,
    text,
  };

  // dev et tests : on affiche l'email au lieu de l'envoyer
  if (!transporter) {
    // un seul texte (et pas l'objet) : la console affiche les vrais retours à la ligne
    console.log(
      `--- Email non envoyé (SMTP_HOST absent) ---\nÀ : ${email.to}\nObjet : ${email.subject}\n\n${email.text}\n---`,
    );
    return;
  }

  // production : envoi réel ; une erreur ici remonte au contrôleur, qui l'attrape (try…catch)
  await transporter.sendMail(email);
}
