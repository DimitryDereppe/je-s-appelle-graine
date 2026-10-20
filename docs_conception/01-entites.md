# Entités du projet GreenRoots

Quels sont les groupes de données qui interviennent dans le projet ?

> Sources : [[Apothéose/doc_ext/CAHIER-DES-CHARGES-GREENROOTS - a valider avec la team|cahier des charges GreenRoots]] (périmètre MVP) et [[Apothéose/doc_ext/user-stories|user stories]].
> Les évolutions (partenaires, paiement Stripe, carte interactive, newsletter...) ne sont **pas** modélisées ici.

## Réflexion

En relisant le cahier des charges et le parcours principal du MVP, on identifie les blocs d'informations suivants :

- Le site vend des **arbres** à planter. Chaque arbre a une photo, une description, un prix et, s'il est renseigné, un lieu de plantation. L'administrateur peut l'ajouter, le modifier ou le retirer du catalogue. Il faut donc une entité **Arbre**.
- Le catalogue se filtre par **catégorie** (résineux, feuillage caduc, feuillage persistant). Il faut une entité pour classer les arbres.
- Un visiteur peut s'inscrire, se connecter, modifier ses informations et supprimer son compte. L'administrateur se connecte aussi et gère les comptes clients. Les deux ont un compte et ne diffèrent que par leur **rôle** : une seule entité **Utilisateur** suffit.
- Ce **rôle** (client, administrateur) détermine les droits de chaque utilisateur. On en fait une entité **Rôle** plutôt qu'un simple attribut : la liste des rôles est ainsi stockée une seule fois, et on pourra en ajouter un plus tard (ex. *partenaire*, prévu dans les évolutions) sans modifier la structure de la table des utilisateurs.
- Le visiteur ajoute des arbres à un **panier**, avec une quantité. Le panier existe **avant** la connexion et est conservé après l'inscription ou la connexion. Il faut une entité dédiée.
- Le client connecté confirme une **commande** (sans paiement réel) et la retrouve dans son historique. Il faut une entité **Commande**.
- Un arbre modifié ou retiré du catalogue ne doit pas changer l'historique. La commande doit donc **mémoriser** le nom et le prix des arbres au moment de l'achat (voir la relation *Composer* dans [[03-relations|03-relations]]).

## Liste des entités

- Utilisateur
- Rôle (client ou administrateur)
- Arbre
- Catégorie
- Panier
- Commande
