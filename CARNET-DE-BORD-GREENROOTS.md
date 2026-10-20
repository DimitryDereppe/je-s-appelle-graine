# Carnet de bord — GreenRoots

## 2026-10-19 — Sprint 0

### Travail réalisé

- Le cahier des charges de GreenRoots a été établi (à valider).
- Les rôles de l’équipe restent à définir et à répartir.

### À poursuivre

- Répartir les rôles et valider le cahier des charges.
- Proposition de la charte de nommage
- Réaliser les documents de conception : diagramme ERD (ex: MCD, MLD, MPD), Use Cases, diagramme de séquence et dictionnaire de données.

## 2026-10-20 — Conception de la base de données

### Travail réalisé

- MCD, MLD et MPD réalisés : [[Apothéose/apo-greenroots/docs_conception/05-mcd|MCD]], [[Apothéose/apo-greenroots/docs_conception/07-MLD|MLD]], [MPD](docs_conception/08-MPD.drawio.svg), et [[Apothéose/apo-greenroots/docs_conception/06-dictionnaire-de-donnees|dictionnaire de données]].

### Décisions

- **Exception à la charte de nommage** : `user` et `order` sont des mots réservés en PostgreSQL. Les tables sont renommées `account`, `purchase` et `purchase_line`.
- **Suppression d'un compte** : le compte est supprimé, ses commandes sont conservées (`account_id` passe à `NULL`). Cardinalité *Passer* : 0,1 côté Commande.
- **Statut d'une commande** : `pending` (en attente), `paid` (payée), `planted` (plantée), changé manuellement par l'admin. Le client n'a pas le droit de supprimer une commande `paid` ou `planted` (vérifié par l'API).

### À poursuivre

- Faire valider ces décisions par l'équipe et mettre à jour le cahier des charges et les user stories (US27, US46, suppression d'une commande).
