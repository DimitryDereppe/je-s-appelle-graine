// Configuration de l'API : les valeurs viennent des variables d'environnement (.env),
// avec une valeur par défaut quand elle est sans risque (dev et tests)

// isProduction vaut true quand l'API tourne en production (NODE_ENV=production dans le .env que l'on crée dans le VPS lors du déploiement)
const isProduction = process.env.NODE_ENV === "production";

// En production, la clé est obligatoire : sans elle, l'API refuse de démarrer
// si isProduction est true et qu'il manque JWT_SECRET
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET manquant dans les variables d'environnement");
}

export const config = {
  port: parseInt(process.env.PORT || "4050", 10),
  isProduction, // sert aussi pour le cookie : secure (HTTPS seulement) en production
  // Clé qui signe les jetons JWT : celle du .env en production, une clé de secours en dev et en test.
  // || et non ?? : une ligne vide « JWT_SECRET= » dans un .env donne "" (pas undefined),
  // et "" doit aussi prendre la clé de secours (jwt.sign refuse une clé vide).
  jwtSecret:
    process.env.JWT_SECRET || "cle-de-dev-a-ne-jamais-utiliser-en-production",
  // Site autorisé à appeler l'API depuis un navigateur (CORS) : le front.
  // || pour la même raison que jwtSecret (ligne vide dans le .env)
  allowedOrigins: process.env.ALLOWED_ORIGINS || "http://localhost:3000",
  // Instructions de paiement renvoyées après une commande (contrat carte #103).
  // Valeurs fictives par défaut pour le dev et les tests ; les vraies sont dans le .env de production.
  payment: {
    // virement
    iban: process.env.PAYMENT_IBAN || "FR76 0000 0000 0000 0000 0000 000",
    bic: process.env.PAYMENT_BIC || "XXXXFRPPXXX",
    holder: process.env.PAYMENT_HOLDER || "Je s'appelle Graine",
    // chèque
    payableTo: process.env.PAYMENT_CHECK_PAYABLE_TO || "Je s'appelle Graine",
    address:
      process.env.PAYMENT_CHECK_ADDRESS ||
      "Je s'appelle Graine, 1 rue de la Forêt, 35380 Paimpont",
  },
};
