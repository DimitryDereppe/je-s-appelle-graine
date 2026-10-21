# Carnet de bord — Je s’appelle Graine

## 2026-10-21 — Nom du projet, paiement, disponibilité et hébergement

### Travail réalisé

- Projet renommé partout dans le dépôt : GreenRoots devient **Je s’appelle Graine** (fichiers `*-JE-S-APPELLE-GRAINE.md`).
- Modèle de données mis à jour (texte et schémas MCD, MLD, MPD) : lieu de plantation, compte actif, table de disponibilité, mode de paiement.
- Cahier des charges et user stories : quantité choisie sur la fiche arbre, page de paiement, emails automatiques, suivi des commandes par l'admin, hébergement sur VPS, nouvelles routes.

### Décisions

- **Nom du projet** : « Je s’appelle Graine » (décidé avec le groupe). Le dépôt GitHub `apo-greenroots` garde son nom pour l'instant.
- **Lieu de plantation** : champ texte facultatif dans `tree` (pourra devenir une entité Lieu pour la carte interactive).
- **Compte actif** (`account.is_active`) : géré par l'admin ; un compte désactivé reçoit un **403** à la connexion.
- **Quantité** : le client choisit la quantité sur la fiche arbre avant d'ajouter au panier (US13b / US23b).
- **Disponibilité** : nouvelle table `availability` (disponible, épuisé, retiré du catalogue) qui remplace `tree.is_available`.
- **Historique des commandes** : `purchase_line` ne garde que la quantité et le prix payé ; le nom et le lieu sont lus dans `tree`. Un arbre déjà commandé n'est jamais supprimé (`purchase_line.tree_id` NOT NULL), il passe à « retiré du catalogue ».
- **Email unique** : un utilisateur ne peut créer qu'un seul compte (`account.email` UNIQUE, déjà en place).
- **Paiement** : page de paiement avec choix du mode (virement, carte, chèque, PayPal) et case obligatoire « Je m'engage à effectuer mon paiement sous 10 jours ou ma commande sera annulée ». Rien n'est encaissé en ligne. Nouveau statut `cancelled`.
- **Emails automatiques** : confirmation à la création de la commande ; avis de réception quand l'admin passe la commande à `paid`. Le suivi des commandes par l'admin (US46) passe en MVP.
- **Hébergement** : tout sur un **VPS** (front, API, PostgreSQL en conteneurs Docker), sur un seul nom de domaine. Fin de Vercel et Neon.

### À poursuivre

- Valider : modes de paiement en colonne `CHECK` (ou table), engagement « 10 jours » non stocké, annulation manuelle par l'admin, routes `/api/admin/orders`.
- Choisir le fournisseur du VPS, le serveur web (HTTPS), le prestataire d'envoi d'emails et la politique de sauvegarde.
- Refaire l'image `01b-diagramme-architecture.png` (montre encore Vercel et Neon) et vérifier les autres PNG (ancien nom).
- Trancher US27 (le client suit le statut de sa commande) : MVP ou évolution.
- Aligner la numérotation des user stories entre le cahier et `user-stories.md`.

## 2026-10-20 — Conception de la base de données

### Travail réalisé

- MCD, MLD, MPD et dictionnaire de données.
- Répartition des rôles
- Diagramme de séquence l'achat et Use Cases
- Diagramme d'architecture et diagramme d'activité pour l'achat

### Décisions

- **Exception à la charte de nommage** : `user` et `order` sont des mots réservés en PostgreSQL. Les tables sont renommées `account`, `purchase` et `purchase_line`.
- **Suppression d'un compte** : le compte est supprimé, ses commandes sont conservées (`account_id` passe à `NULL`). Cardinalité *Passer* : 0,1 côté Commande.
- **Statut d'une commande** : `pending` (en attente), `paid` (payée), `planted` (plantée), changé manuellement par l'admin. Le client n'a pas le droit de supprimer une commande (vérifié par l'API).
- **Panier réservé aux comptes connectés** : un visiteur qui clique sur « Ajouter au panier » est redirigé vers l'inscription. L'entité Panier est conservée, mais *Posséder* passe à **1,1** côté Panier : `cart.account_id` devient `NOT NULL`. L'API répond **401** sans session (403 si le client touche au panier d'un autre). Plus de panier visiteur ni de cookie de session dédié. Le retour automatique sur la fiche de l'arbre après inscription devient une évolution (US06).
- **Création du panier** : le panier est créé à l'inscription du client (vide). *Posséder* reste 0,1 côté Utilisateur, car un admin n'a pas forcément de panier.
- Rôles répartis : Shanna **Product Owner**, Fabrice **Scrum Master**, Loïc **Tech Lead Front** et Dimitry **Tech Lead Back**

### À poursuivre

- Wireframes (mobile first + desktop) : Shanna page **Accueil**, Dimitry page **Fiche arbre**, Mahamadou **Panier**, Fabrice **Connexion/Inscription**, Loïc **à définir**
- Maquettes : Shanna
- Charte graphique
- Valider le choix du DataMapper et prendre en compte l'analyse de Loïc pour la conception

## 2026-10-19 — Sprint 0

### Travail réalisé

- Le cahier des charges de Je s’appelle Graine a été établi (à valider).
- Les rôles de l’équipe restent à définir et à répartir.

### À poursuivre

- Répartir les rôles et valider le cahier des charges.
- Proposition de la charte de nommage
- Réaliser les documents de conception : diagramme ERD (ex: MCD, MLD, MPD), Use Cases, diagramme de séquence et dictionnaire de données.
