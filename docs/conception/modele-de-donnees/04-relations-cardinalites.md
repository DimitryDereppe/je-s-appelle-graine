# Relations et cardinalités du projet Je s’appelle Graine

Pour chaque lien entre des entités, combien de représentations peut-il y avoir de la première entité vers la seconde ? Et inversement ?

| Relation | Entité A | Cardinalité A | Entité B | Cardinalité B |
| --- | --- | --- | --- | --- |
| Appartenir | Arbre | 1,1 | Catégorie | 0,N |
| Contenir (quantité) | Panier | 0,N | Arbre | 0,N |
| Posséder | Utilisateur | 0,1 | Panier | 1,1 |
| Avoir | Utilisateur | 1,1 | Rôle | 0,N |
| Passer | Utilisateur | 0,N | Commande | 0,1 |
| Composer (quantité, prix unitaire, nom de l'arbre, lieu de plantation) | Commande | 1,N | Arbre | 0,N |

## Lecture des cardinalités

- **Appartenir** : un arbre appartient à **une et une seule** catégorie. Une catégorie regroupe **zéro ou plusieurs** arbres (une catégorie peut être vide au départ).
- **Contenir** : un panier contient **zéro ou plusieurs** arbres (il peut être vide). Un arbre se trouve dans **zéro ou plusieurs** paniers.
- **Posséder** : un utilisateur possède **au plus un** panier en cours (le panier d'un client est créé à son inscription ; un administrateur n'en a pas forcément). Un panier appartient à **un et un seul** utilisateur : il n'existe pas de panier visiteur.
- **Avoir** : un utilisateur a **un et un seul** rôle (client ou administrateur). Un rôle est attribué à **zéro ou plusieurs** utilisateurs (au départ, aucun compte n'a forcément le rôle administrateur).
- **Passer** : un utilisateur passe **zéro ou plusieurs** commandes. Une commande est passée par **zéro ou un** utilisateur : zéro si le compte a été supprimé, car la commande est conservée.
- **Composer** : une commande est composée d'**au moins un** arbre (on ne valide pas un panier vide). Un arbre figure dans **zéro ou plusieurs** commandes.

## Décisions

- **Panier réservé aux comptes connectés** : un visiteur qui clique sur « Ajouter au panier » est redirigé vers l'inscription. Il n'y a donc pas de panier visiteur, d'où la cardinalité *Posséder* **1,1** côté Panier (au lieu de 0,1). L'API refuse tout accès au panier sans session (**401**).
- **Création du panier** : le panier (vide) est créé **à l'inscription** du client. *Posséder* reste **0,1** côté Utilisateur, car un administrateur n'a pas forcément de panier.
- **Suppression d'un compte** (droit à l'effacement RGPD) : le compte est réellement supprimé et ses commandes sont **conservées**, sans propriétaire. D'où la cardinalité *Passer* **0,1** côté Commande (au lieu de 1,1). L'autre piste, anonymiser le compte au lieu de le supprimer, a été écartée.
- **Suppression d'une commande** : le client **n'a pas le droit** de supprimer une commande finalisée et payée (statut payée ou plantée) ; seules les commandes en attente peuvent l'être. Le statut est changé **manuellement par l'admin**. C'est une règle de gestion, vérifiée par l'API : elle ne change pas les cardinalités.
