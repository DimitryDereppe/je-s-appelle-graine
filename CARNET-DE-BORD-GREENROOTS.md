# Carnet de bord — GreenRoots

## 2026-10-20 — Conception de la base de données

### Travail réalisé

- MCD, MLD et MPD réalisés : [[Apothéose/apo-greenroots/docs_conception/05-mcd|MCD]], [[Apothéose/apo-greenroots/docs_conception/07-MLD|MLD]], [[Apothéose/apo-greenroots/docs_conception/08-MPD|MPD]], et [[Apothéose/apo-greenroots/docs_conception/06-dictionnaire-de-donnees|dictionnaire de données]].

### Décisions

- **Exception à la charte de nommage** : `user` et `order` sont des mots réservés en PostgreSQL. Les tables sont renommées `account`, `purchase` et `purchase_line`.
- **Suppression d'un compte** : le compte est supprimé, ses commandes sont conservées (`account_id` passe à `NULL`). Cardinalité *Passer* : 0,1 côté Commande.
- **Statut d'une commande** : `pending` (en attente), `paid` (payée), `planted` (plantée), changé manuellement par l'admin. Le client n'a pas le droit de supprimer une commande `paid` ou `planted` (vérifié par l'API).
- **Panier réservé aux comptes connectés** : un visiteur qui clique sur « Ajouter au panier » est redirigé vers l'inscription. L'entité Panier est conservée, mais *Posséder* passe à **1,1** côté Panier : `cart.account_id` devient `NOT NULL`. L'API répond **401** sans session (403 si le client touche au panier d'un autre). Plus de panier visiteur ni de cookie de session dédié. Le retour automatique sur la fiche de l'arbre après inscription devient une évolution (US06).
- **Création du panier** : le panier est créé à l'inscription du client (vide). *Posséder* reste 0,1 côté Utilisateur, car un admin n'a pas forcément de panier.

## 2026-10-19 — Sprint 0

### Travail réalisé

- Le cahier des charges de GreenRoots a été établi (à valider).
- Les rôles de l’équipe restent à définir et à répartir.

### À poursuivre

- Répartir les rôles et valider le cahier des charges.
- Proposition de la charte de nommage
- Réaliser les documents de conception : diagramme ERD (ex: MCD, MLD, MPD), Use Cases, diagramme de séquence et dictionnaire de données.
