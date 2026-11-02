# Entités du projet Je s’appelle Graine

Quels sont les groupes de données qui interviennent dans le projet ?

## Réflexion

En relisant le cahier des charges et le parcours principal du MVP, on identifie les blocs d'informations suivants :

- Le site vend des **arbres** à planter. Chaque arbre a une photo, une description, un prix et, s'il est renseigné, un lieu de plantation. L'administrateur peut l'ajouter, le modifier ou le retirer du catalogue. Il faut donc une entité **Arbre**.
- Chaque arbre a une **disponibilité** : disponible, en rupture de stock ou retiré du catalogue. Comme pour le rôle, on en fait une entité **Disponibilité** : la liste des états est stockée une seule fois et on pourra en ajouter un sans modifier la table des arbres.
- Le catalogue se filtre par **catégorie** (résineux, feuillage caduc, feuillage persistant). Il faut une entité pour classer les arbres.
- Un visiteur peut s'inscrire, se connecter, modifier ses informations et supprimer son compte. L'administrateur se connecte aussi et gère les comptes clients. Les deux ont un compte et ne diffèrent que par leur **rôle** : une seule entité **Utilisateur** suffit.
- Ce **rôle** (client, administrateur) détermine les droits de chaque utilisateur. On en fait une entité **Rôle** plutôt qu'un simple attribut : la liste des rôles est ainsi stockée une seule fois, et on pourra en ajouter un plus tard (ex. _administrateur des ventes_ ou _partenaire_, prévus dans les évolutions) sans modifier la structure de la table des utilisateurs.
- Le client connecté ajoute des arbres à son **panier**, avec une quantité. Le panier n'a aucune information propre (pas de date, pas de total) : c'est simplement la liste des arbres choisis par le client. On n'en fait donc pas une entité : c'est une association _Contenir_ entre l'Utilisateur et l'Arbre, qui porte la quantité. Le panier est **réservé aux comptes connectés** : un visiteur qui clique sur « Ajouter au panier » est redirigé vers la page de connexion, qui propose aussi de créer un compte (il est peut-être déjà client).
- Le client connecté confirme une **commande** en choisissant son **mode de paiement** (virement ou chèque), sans paiement en ligne, et la retrouve dans son historique. Il faut une entité **Commande**. Elle **mémorise** l'identité de l'acheteur (la vente doit rester identifiable si le compte est supprimé) et la date de chaque changement de statut.
- Le nom, le prix et le lieu de plantation d'un arbre peuvent changer après une commande : la commande **mémorise** donc le nom de l'arbre, le prix unitaire payé et le lieu de plantation. Un arbre déjà commandé n'est jamais supprimé, il passe à l'état « retiré du catalogue ».

## Liste des entités

- Utilisateur
- Rôle (client ou administrateur)
- Arbre
- Catégorie
- Disponibilité (disponible, en rupture de stock, retiré du catalogue)
- Commande
