import type { CountryCode } from "../@types/index.d.ts";

// --------------------------------
// pays européens acceptés pour l'adresse de facturation
// code ISO à 2 lettres (le même que dans la contrainte CHECK de purchase.buyer_country)
// --------------------------------
export const COUNTRY_CODES: CountryCode[] = [
  "FR", // France
  "BE", // Belgique
  "DE", // Allemagne
  "ES", // Espagne
  "GB", // Royaume-Uni
  "LU", // Luxembourg
  "CH", // Suisse
  "IT", // Italie
  "NL", // Pays-Bas
  "PT", // Portugal
];

// --------------------------------
// format du code postal de chaque pays, sous forme d'expression régulière
// ^ = début du texte, $ = fin du texte, \d = un chiffre, {5} = 5 fois,
// [A-Z] = une lettre majuscule, ? = l'élément d'avant est facultatif
// Record<CountryCode, RegExp> : un objet avec une clé par pays, chaque valeur est une RegExp
// --------------------------------
export const POSTAL_CODE_FORMATS: Record<CountryCode, RegExp> = {
  FR: /^\d{5}$/, // 75008
  BE: /^\d{4}$/, // 7890
  DE: /^\d{5}$/, // 10779
  ES: /^\d{5}$/, // 13610
  // 1 ou 2 lettres, 1 chiffre, une lettre ou un chiffre facultatif, un espace, 1 chiffre et 2 lettres
  GB: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/, // NW1 6XE
  LU: /^\d{4}$/, // 1009
  CH: /^\d{4}$/, // 1003
  IT: /^\d{5}$/, // 00184
  NL: /^\d{4} [A-Z]{2}$/, // 1012 AB
  PT: /^\d{4}-\d{3}$/, // 1100-148
};
