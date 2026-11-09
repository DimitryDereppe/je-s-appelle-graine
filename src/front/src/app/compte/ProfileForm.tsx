"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AccountType, IAccount } from "../../@types";
import { clientApi } from "../utils/clientApi";
import styles from "./page.module.css";

// Mes informations : chargées par GET /api/users/me, enregistrées par PATCH /api/users/me
export function ProfileForm() {
  // null tant que le compte n'est pas chargé
  const [account, setAccount] = useState<IAccount | null>(null);
  // dans un state : le champ « structure » apparaît ou disparaît selon le type choisi
  const [accountType, setAccountType] = useState<AccountType>("particulier");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // chargement du compte une fois la page affichée dans le navigateur (qui envoie le cookie)
  useEffect(() => {
    // useEffect ne peut pas être async : on déclare une fonction async, appelée juste après
    async function loadAccount() {
      try {
        const response = await clientApi("users/me");

        if (response.status === 401) {
          // pas connecté : la page de connexion nous renvoie ici ensuite
          router.push("/connexion?next=/compte");
          return;
        }
        // autre erreur de l'API (ex. 403 compte désactivé, 500)
        if (!response.ok) {
          setErrorMessage("Quelque chose n’a pas fonctionné.");
          return;
        }

        const dataAccount: IAccount = await response.json();
        setAccount(dataAccount);
        // affiche le type enregistré dans le menu « Type de compte » (sinon il resterait
        // sur « particulier », la valeur de départ du useState, et le champ structure serait caché)
        setAccountType(dataAccount.accountType);
      } catch {
        // l'API n'a pas répondu : sans ce message, le chargement durerait toujours
        setErrorMessage("Une erreur est survenue.");
      }
    }

    loadAccount();
    // dépendances = ce que l'effet utilise et qui vient du composant ;
    // router ne change jamais : l'effet ne se lance qu'une fois
  }, [router]);

  async function handleUpdate(formData: FormData) {
    setErrorMessage("");
    setSuccessMessage("");

    // le contrat attend tous les champs, même ceux qui ne changent pas
    const body = {
      firstname: String(formData.get("firstname") ?? ""),
      lastname: String(formData.get("lastname") ?? ""),
      email: String(formData.get("email") ?? ""),
      // champ vide → null : le client n'a pas d'adresse
      address: String(formData.get("address") ?? "").trim() || null,
      accountType,
      // un particulier n'a pas de structure (l'API l'enregistre aussi à null)
      organizationName:
        accountType === "particulier"
          ? null
          : String(formData.get("organizationName") ?? "").trim() || null,
    };

    try {
      const response = await clientApi("users/me", "PATCH", body);

      // 400 : champ invalide ; 409 : email déjà utilisé → message de l'API
      if (response.status === 400 || response.status === 409) {
        const apiMessage: { error?: string } = await response.json();
        setErrorMessage(
          apiMessage.error ?? "Les informations saisies sont invalides.",
        );
        return;
      }
      if (!response.ok) {
        setErrorMessage("Quelque chose n’a pas fonctionné.");
        return;
      }

      // l'API renvoie le compte à jour : les champs affichent les valeurs enregistrées
      setAccount(await response.json());
      setSuccessMessage("Vos informations ont été enregistrées.");
    } catch {
      setErrorMessage("Une erreur est survenue.");
    }
  }

  // erreur avant tout chargement : rien à afficher d'autre
  if (!account) {
    return errorMessage ? (
      <p className={styles.error} role="alert">
        {errorMessage}
      </p>
    ) : (
      <p className={styles.subtitle}>Chargement de vos informations…</p>
    );
  }

  return (
    // defaultValue : le champ est prérempli, puis le client le modifie librement
    <form className={styles.form} action={handleUpdate}>
      <p className={styles.requiredNote}>* Champ obligatoire</p>

      <div className={styles.field}>
        <label htmlFor="firstname">Prénom *</label>
        <input
          id="firstname"
          name="firstname"
          type="text"
          autoComplete="given-name"
          defaultValue={account.firstname}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="lastname">Nom *</label>
        <input
          id="lastname"
          name="lastname"
          type="text"
          autoComplete="family-name"
          defaultValue={account.lastname}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Adresse e-mail *</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={account.email}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="address">Adresse</label>
        {/* ?? "" : une adresse null s'affiche comme un champ vide */}
        <input
          id="address"
          name="address"
          type="text"
          autoComplete="street-address"
          defaultValue={account.address ?? ""}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="accountType">Type de compte *</label>
        <select
          id="accountType"
          name="accountType"
          value={accountType}
          onChange={(event) =>
            setAccountType(event.target.value as AccountType)
          }
          required
        >
          <option value="particulier">Particulier</option>
          <option value="association">Association</option>
          <option value="entreprise">Entreprise</option>
        </select>
      </div>

      {accountType !== "particulier" && (
        <div className={styles.field}>
          <label htmlFor="organizationName">Nom de la structure</label>
          <input
            id="organizationName"
            name="organizationName"
            type="text"
            autoComplete="organization"
            defaultValue={account.organizationName ?? ""}
          />
        </div>
      )}

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className={styles.success} role="status">
          {successMessage}
        </p>
      )}

      <button className={styles.submitButton} type="submit">
        Enregistrer
      </button>
    </form>
  );
}
