# Relations et cardinalités du projet GreenRoots

Pour chaque lien entre des entités, combien de représentations peut-il y avoir de la première entité vers la seconde ? Et inversement ?

| Relation | Entité A | Cardinalité A | Entité B | Cardinalité B |
| --- | --- | --- | --- | --- |
| Appartenir | Arbre | 1,1 | Catégorie | 0,N |
| Contenir (quantité) | Panier | 0,N | Arbre | 0,N |
| Posséder | Utilisateur | 0,1 | Panier | 0,1 |
| Avoir | Utilisateur | 1,1 | Rôle | 0,N |
| Passer | Utilisateur | 0,N | Commande | 1,1 |
| Composer (quantité, prix unitaire, nom de l'arbre) | Commande | 1,N | Arbre | 0,N |

## Lecture des cardinalités

- **Appartenir** : un arbre appartient à **une et une seule** catégorie. Une catégorie regroupe **zéro ou plusieurs** arbres (une catégorie peut être vide au départ).
- **Contenir** : un panier contient **zéro ou plusieurs** arbres (il peut être vide). Un arbre se trouve dans **zéro ou plusieurs** paniers.
- **Posséder** : un utilisateur possède **au plus un** panier en cours (un administrateur n'en a pas forcément). Un panier appartient à **zéro ou un** utilisateur : zéro tant que c'est un panier visiteur.
- **Avoir** : un utilisateur a **un et un seul** rôle (client ou administrateur). Un rôle est attribué à **zéro ou plusieurs** utilisateurs (au départ, aucun compte n'a forcément le rôle administrateur).
- **Passer** : un utilisateur passe **zéro ou plusieurs** commandes. Une commande est passée par **un et un seul** utilisateur.
- **Composer** : une commande est composée d'**au moins un** arbre (on ne valide pas un panier vide). Un arbre figure dans **zéro ou plusieurs** commandes.

## Point à trancher en équipe

- **Suppression d'un compte** (droit à l'effacement RGPD) et cardinalité *Passer* 1,1 : une commande doit toujours avoir un utilisateur. Deux pistes :
  1. ne pas effacer la ligne utilisateur mais l'**anonymiser** (email, nom et prénom remplacés par des valeurs neutres). C'est l'option retenue dans ce dossier ;
  2. passer la cardinalité à 0,1 côté Commande et mettre la clé étrangère à `NULL` lors de la suppression.
