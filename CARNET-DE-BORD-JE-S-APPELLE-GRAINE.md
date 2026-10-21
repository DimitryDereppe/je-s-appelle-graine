# Carnet de bord — Je s’appelle Graine

## 2026-10-21 — Nom du projet, paiement, disponibilité, hébergement et vérification du modèle de données

### Travail réalisé

- Projet renommé partout dans le dépôt : GreenRoots devient **Je s’appelle Graine** (fichiers `*-JE-S-APPELLE-GRAINE.md`).
- Modèle de données mis à jour (texte et schémas MCD, MLD, MPD) : lieu de plantation, compte actif, table de disponibilité, mode de paiement.
- Cahier des charges et user stories : quantité choisie sur la fiche arbre, page de paiement, emails automatiques, suivi des commandes par l'admin, hébergement sur VPS, nouvelles routes.
- Recherche d'arbres par nom (MVP, accents gérés avec l'extension PostgreSQL `unaccent`) ; filtres par lieu et par prix, et tri, en évolution.
- Endpoints de l'API renommés en anglais, comme le demande la charte de nommage (`/api/trees`, `/api/orders`, `/api/cart/items`…).
- Diagrammes d'architecture, de cas d'utilisation, de séquence et d'activité refaits avec PlantUML : les sources `.puml` sont rangées à côté des images pour pouvoir les modifier.
- Numérotation des user stories alignée entre le cahier des charges et `user-stories.md`.
- Wireframes (mobile first + desktop) :  
  Shanna page **Accueil**, Dimitry page **Fiche arbre**, Mahamadou **Panier**, Fabrice **Connexion/Inscription**, Loïc page **Catalogue**

### Décisions

- **Nom du projet** : « Je s’appelle Graine » (décidé avec le groupe). Le dépôt GitHub `apo-greenroots` garde son nom.
- **Lieu de plantation** : simple champ texte facultatif dans `tree` pour le MVP. Il pourra devenir une entité **Lieu** si la carte interactive (US33, évolution) a besoin de coordonnées.
- **Compte actif** (`account.is_active`, `TRUE` dès l'inscription) : géré par l'admin (`PATCH /api/admin/users/:id`, « Modifier l'état d'un compte client »). Un compte désactivé reçoit un **403** à la connexion : il est bien identifié, mais n'a pas le droit d'accéder au service.
- **Quantité** : le client choisit la quantité sur la fiche arbre avant d'ajouter au panier (US23b).
- **Disponibilité** : nouvelle table `availability` (disponible, épuisé, retiré du catalogue) qui remplace `tree.is_available`.
- **Historique des commandes** : `purchase_line` fige le **nom de l'arbre**, la quantité, le prix payé et le **lieu de plantation** (`tree_name` et `planting_location`, copiés à la création de la commande) : si l'admin modifie un arbre, l'historique ne change pas. Un arbre déjà commandé n'est jamais supprimé (`purchase_line.tree_id` NOT NULL), il passe à « retiré du catalogue ».
- **Acheteur figé dans la commande** : `purchase` copie à sa création le prénom, le nom, l'email, la structure et l'adresse du compte (`buyer_*`). Si le compte est supprimé, la vente reste identifiable (comptabilité, facturation des associations et entreprises, pièces conservées 10 ans) et les emails de la commande peuvent encore être envoyés.
- **Dates de statut** : `paid_at`, `planted_at` et `cancelled_at` sont renseignées par l'API au changement de statut.
- **Suppression d'une commande** : le client ne peut supprimer une commande que si elle est `pending` (`DELETE /api/orders/:id`). Une commande `paid`, `planted` ou `cancelled` n'est jamais effacée : les annulations restent tracées.
- **Suivi du statut par le client** (US27) : passe en MVP ; le client voit le statut de ses commandes dans son historique, l'admin le fait évoluer (US46).
- **Paiement** : page de paiement avec choix du mode (virement, carte, chèque, PayPal) et case obligatoire « Je m'engage à effectuer mon paiement sous 10 jours ou ma commande sera annulée ». Rien n'est encaissé en ligne (nouveau statut `cancelled`).
- **Emails automatiques** : confirmation à la création de la commande ; avis de réception quand l'admin passe la commande à `paid`. Le suivi des commandes par l'admin (US46) passe en MVP.
- **Hébergement** : tout sur un **VPS fourni par O'Clock** (front, API, PostgreSQL en conteneurs Docker), sur un seul nom de domaine.
- **Authentification par JWT** : jeton signé (id du compte et rôle) dans un cookie `httpOnly`, aucune session stockée côté serveur. Un jeton ne peut pas être révoqué avant son expiration : en V1, `is_active` est contrôlé à la connexion ; la révocation (relecture du compte à chaque requête ou `token_version`) est prévue en V2.
- **Rôles** : les droits sont contrôlés par un middleware de rôles dans l'API. Les règles que la base ne peut pas garantir sont gérées par l'API : vérification du propriétaire d'une ressource, transitions de statut autorisées, refus de supprimer ou désactiver le dernier admin, nom d'un arbre déjà commandé.
- **Recherche par nom** : `unaccent(name) ILIKE unaccent('%' || $1 || '%')`, sans nouvelle colonne.
- **DataMapper** : choix validé
- Échange de vision pour valider les wireframes (contenu, mise en forme, etc.)

### À poursuivre

- Fixer la durée d'expiration du JWT.
- Maquette et charte graphique en cours et à valider
- Fin du sprint 0 : nommer une personne et préparer la présentation ensemble

## 2026-10-20 — Conception de la base de données

### Travail réalisé

- MCD, MLD, MPD et dictionnaire de données.
- Répartition des rôles
- Diagramme de séquence pour l'achat et Use Cases
- Diagramme d'architecture et diagramme d'activité pour l'achat

### Décisions

- **Exception à la charte de nommage** : `user` et `order` sont des mots réservés en PostgreSQL. Les tables sont renommées `account`, `purchase` et `purchase_line`.
- **Suppression d'un compte** : le compte est supprimé, ses commandes sont conservées (`account_id` passe à `NULL`). Cardinalité _Passer_ : 0,1 côté Commande.
- **Statut d'une commande** : `pending` (en attente), `paid` (payée), `planted` (plantée), changé manuellement par l'admin. Le client peut supprimer une commande `pending`.
- **Panier réservé aux comptes connectés** : un visiteur qui clique sur « Ajouter au panier » est redirigé vers connexion. L'entité Panier est conservée, mais _Posséder_ passe à **1,1** côté Panier : `cart.account_id` devient `NOT NULL`. L'API répond **401** sans session (403 si le client touche au panier d'un autre).
- **Création du panier** : le panier est créé à l'inscription du client (vide). _Posséder_ reste 0,1 côté Utilisateur, car un admin n'a pas forcément de panier.
- **Rôles répartis** : Shanna **Product Owner**, Fabrice **Scrum Master**, Loïc **Tech Lead Front** et Dimitry **Tech Lead Back**

### À poursuivre

- Wireframes (mobile first + desktop) :  
  Shanna page **Accueil**, Dimitry page **Fiche arbre**, Mahamadou **Panier**, Fabrice **Connexion/Inscription**, Loïc page **Catalogue**
- Maquettes : Shanna
- Charte graphique : Shanna
- Valider le choix du DataMapper et prendre en compte l'analyse de Loïc pour la conception

## 2026-10-19 — Sprint 0

### Travail réalisé

- Le cahier des charges de Je s’appelle Graine a été établi (à valider).
- Les rôles de l’équipe restent à définir et à répartir.

### À poursuivre

- Répartir les rôles et valider le cahier des charges.
- Proposition de la charte de nommage
- Réaliser les documents de conception : diagramme ERD (ex: MCD, MLD, MPD), Use Cases, diagramme de séquence et dictionnaire de données.
