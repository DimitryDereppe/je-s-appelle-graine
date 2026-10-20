# Entités et propriétés du projet GreenRoots

- De quelles données est composée chaque entité ?
- Quelles propriétés permettent d'identifier de façon unique chaque entité ?

## Utilisateur

- **code utilisateur** (identifiant unique)
- email (unique, sert à se connecter)
- mot de passe (stocké haché, jamais en clair)
- nom
- prénom

## Arbre

- **code arbre** (identifiant unique)
- nom
- description
- prix
- photo
- disponibilité (oui/non : un arbre retiré du catalogue n'est pas effacé)

## Catégorie

- **code catégorie** (identifiant unique)
- nom (résineux, feuillage caduc, feuillage persistant), unique

## Panier

- **code panier** (identifiant unique)

## Commande

- **code commande** (identifiant unique)
- date de commande
- statut (ex. : confirmée ; d'autres statuts comme « plantée » viendront avec les évolutions). Géré par l'admin.
- total (montant total de la commande)

## Rôle

- **code rôle** (identifiant unique)
- rôle (client, administrateur), unique
