# Relations et cardinalités du projet Je s’appelle Graine

Pour chaque lien entre des entités, combien de représentations peut-il y avoir de la première entité vers la seconde ? Et inversement ?

| Relation | Entité A | Cardinalité A | Entité B | Cardinalité B |
| --- | --- | --- | --- | --- |
| Appartenir | Arbre | 1,1 | Catégorie | 0,N |
| Être | Arbre | 1,1 | Disponibilité | 0,N |
| Contenir (quantité) | Utilisateur | 0,N | Arbre | 0,N |
| Avoir | Utilisateur | 1,1 | Rôle | 0,N |
| Passer | Utilisateur | 0,N | Commande | 0,1 |
| Composer (quantité, nom de l'arbre, prix unitaire, lieu de plantation) | Commande | 1,N | Arbre | 0,N |

## Lecture des cardinalités

- **Appartenir** : un arbre appartient à **une et une seule** catégorie. Une catégorie regroupe **zéro ou plusieurs** arbres (une catégorie peut être vide au départ).
- **Être** : un arbre est dans **un et un seul** état de disponibilité. Un état concerne **zéro ou plusieurs** arbres.
- **Contenir** : un utilisateur a **zéro ou plusieurs** arbres dans son panier (il peut être vide ; un administrateur ne s'en sert pas). Un arbre se trouve dans le panier de **zéro ou plusieurs** utilisateurs.
- **Avoir** : un utilisateur a **un et un seul** rôle (client ou administrateur). Un rôle est attribué à **zéro ou plusieurs** utilisateurs (au départ, aucun compte n'a forcément le rôle administrateur).
- **Passer** : un utilisateur passe **zéro ou plusieurs** commandes. Une commande est passée par **zéro ou un** utilisateur : zéro si le compte a été supprimé, car la commande est conservée.
- **Composer** : une commande est composée d'**au moins un** arbre (on ne valide pas un panier vide). Un arbre figure dans **zéro ou plusieurs** commandes.

## Décisions

- **Panier réservé aux comptes connectés** : un visiteur qui clique sur « Ajouter au panier » est redirigé vers la page de connexion, qui propose aussi de créer un compte (il est peut-être déjà client). Il n'y a donc pas de panier visiteur : chaque ligne du panier appartient à un compte (`cart_item.account_id` obligatoire). L'API refuse tout accès au panier sans jeton JWT valide (**401**).
- **Pas d'entité Panier** : un panier n'a aucune propriété propre. C'est la liste des lignes *Contenir* d'un utilisateur, avec leur quantité. Rien n'est créé à l'inscription, et un administrateur n'a pas de cas particulier.
- **Suppression d'un compte** (droit à l'effacement RGPD) : le compte est réellement supprimé et ses commandes sont **conservées**, sans propriétaire. L'identité de l'acheteur reste figée dans la commande (obligation comptable). D'où la cardinalité *Passer* **0,1** côté Commande (au lieu de 1,1). L'autre piste, anonymiser le compte au lieu de le supprimer, a été écartée.
- **Annulation d'une commande** : aucune commande n'est supprimée. Le client peut annuler sa commande tant qu'elle est en attente (elle passe à « annulée », la trace est conservée) ; les autres changements de statut sont faits **manuellement par l'admin**. C'est une règle de gestion, vérifiée par l'API : elle ne change pas les cardinalités.
- **Historique des commandes** : *Composer* garde la quantité, le nom de l'arbre, le prix unitaire payé et le lieu de plantation au moment de l'achat : l'historique ne change pas si l'arbre est modifié. Un arbre déjà commandé ne peut **jamais être supprimé**, seulement passé à l'état « retiré du catalogue ».
