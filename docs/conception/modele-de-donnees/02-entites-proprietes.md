# Entités et propriétés du projet Je s’appelle Graine

- De quelles données est composée chaque entité ?
- Quelles propriétés permettent d'identifier de façon unique chaque entité ?

## Utilisateur

- **code utilisateur** (identifiant unique)
- email (unique, sert à se connecter)
- mot de passe (stocké haché, jamais en clair)
- nom (obligatoire)
- prénom (obligatoire)
- adresse (facultative)
- type de compte : particulier, association ou entreprise (obligatoire, particulier par défaut)
- raison sociale : nom de l'association ou de l'entreprise (facultatif)
- actif (oui/non) : compte actif dès l'inscription ; seul l'admin peut le désactiver

## Arbre

- **code arbre** (identifiant unique)
- nom
- description
- prix
- photo
- lieu de plantation (facultatif)

## Disponibilité

- **code disponibilité** (identifiant unique)
- libellé (disponible, épuisé, retiré du catalogue), unique

## Catégorie

- **code catégorie** (identifiant unique)
- nom (résineux, feuillage caduc, feuillage persistant), unique

## Panier

- **code panier** (identifiant unique)

## Commande

- **code commande** (identifiant unique)
- date de commande
- statut : en attente, payée, plantée ou annulée. Changé **manuellement par l'admin** : payée à réception du paiement, annulée si le paiement n'est pas arrivé sous 10 jours. Une commande payée, plantée ou annulée ne peut plus être supprimée par le client (seules les commandes en attente peuvent l'être).
- total (montant total de la commande)
- mode de paiement : virement, carte, chèque ou PayPal (obligatoire)
- acheteur au moment de la commande : prénom, nom et email (obligatoires), structure et adresse (facultatives). Copiés depuis l'utilisateur : la vente reste identifiable si le compte est supprimé
- date de paiement, date de plantation, date d'annulation (facultatives : renseignées au changement de statut)

## Rôle

- **code rôle** (identifiant unique)
- rôle (client, administrateur), unique
