"use client";
// composant client : seul le navigateur envoie le cookie de connexion à l'API

import { useState } from "react";
import type { AccountType, IAccount } from "../../@types";
import { clientApi } from "../utils/clientApi";
import styles from "./page.module.css";

interface ProfileFormProps {
  // le compte déjà chargé par AccountContent (GET /api/users/me)
  initialAccount: IAccount;
}

// Mes informations : préremplies avec le compte reçu, enregistrées par PATCH /api/users/me
export function ProfileForm({ initialAccount }: ProfileFormProps) {
  // part du compte reçu, puis remplacé par la réponse de l'API après chaque enregistrement
  const [account, setAccount] = useState<IAccount>(initialAccount);
  // dans un state : le champ « structure » apparaît ou disparaît selon le type choisi ;
  // part du type enregistré, pour afficher le bon choix et la structure dès l'arrivée
  const [accountType, setAccountType] = useState<AccountType>(
    initialAccount.accountType,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
