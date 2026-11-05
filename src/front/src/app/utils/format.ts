// Écrit un montant en euros, à la française : 9.9 → « 9,90 € »
export function formatEuros(amount: number): string {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

// Écrit une date en français : « 5 novembre 2026 »
// Avec timeZone, le serveur et le navigateur affichent ainsi le même jour
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  });
}
