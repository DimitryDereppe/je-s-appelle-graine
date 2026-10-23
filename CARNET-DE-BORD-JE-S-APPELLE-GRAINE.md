# Carnet de bord — Je s’appelle Graine

## 2026-10-23 — Fin du sprint 0, organisation du sprint 1 et Kanban GitHub

### Travail réalisé

- Présentation de l'organisation des sprints et pitch du sprint 1 par Fabrice. Le backlog a été présenté rapidement : il sera relu en détail au sprint planning du lundi 26 octobre.
- Derniers ajustement de la maquette (rajout de la « Politique de confidentialité » oublié).
- Finalisation des slides pour la présentation par Loïc
- **Présentation de fin du sprint 0 faite par Loïc et Shanna** : le sprint 0 (conception) est terminé.
- Charte graphique, maquette complète et wireframes ajoutés au dépôt (`docs/design/`).

### Décisions

- **Organisation** : validée par l'équipe (rien n'est figé et fermé).
- **Sessions communes du début du sprint 1** en Live Share : lundi après-midi l'API et la base (Dimitry guide), mardi matin Next.js et Husky (Loïc guide). Chacun passe au clavier à tour de rôle, celui qui guide commite et pousse.
- **Dépôt GitHub renommé** : `apo-greenroots` devient `apo-jesappellegraine`, pour correspondre au nom du projet. Le Kanban suit le renommage ; GitHub redirige encore l'ancienne adresse.

### À poursuivre

- **Sprint planning du lundi 26 octobre** : objectif du sprint, matrice des binômes, Definition of Ready et Definition of Done, conventions front et back, relecture des cartes du sprint 1.
- Accepter l'invitation au Kanban GitHub (chacun).
- Mettre à jour l'adresse du dépôt sur sa machine (chacun) : `git remote set-url origin git@github.com:O-clock-Kyoto/apo-jesappellegraine.git`, ou recloner le dépôt.
- Vérifications de chaque machine avant lundi (connexion au VPS, Git, clé SSH, Docker, Node.js) avec une checklist commune.

## 2026-10-22 — Relecture complète de la documentation et simplification du panier

### Travail réalisé

- Relecture complète du cahier des charges, des user stories, de la charte et des documents de conception pour corriger les incohérences (routes au singulier et au pluriel mélangées, langage, routes manquantes).
- Modèle de données mis à jour (textes, dictionnaire et schémas MCD, MLD, MPD) : suppression de la table `cart`, mode de paiement sans carte.
- Diagrammes PlantUML mis à jour (cas d'utilisation, séquence et activité de l'achat, architecture).
- Cahier des charges : choix de modélisation du panier documenté, nouvelles routes, précisions sur le paiement, les photos et la page d'accueil.

### Décisions

- **Table `cart` supprimée** (validé en équipe) : le panier n'a aucune information propre (réservé aux comptes connectés, un seul panier en cours par client, pas de suivi des paniers abandonnés). _Contenir_ relie directement l'utilisateur et l'arbre : `cart_item` est rattaché au compte (`account_id`, `UNIQUE (account_id, tree_id)`). Plus de panier à créer à l'inscription. Un panier enrichi (visiteur, paniers abandonnés, codes promo) est noté en évolution.
- **Paiement par carte et PayPal retirés du MVP** : sans paiement en ligne, aucun moyen de payer par carte, et PayPal arrivera avec le paiement en ligne. Modes acceptés : virement et chèque (`payment_method`). La carte bancaire et PayPal sont en évolution (Stripe).
- **Référence et instructions de paiement** : la page de confirmation et l'email donnent la référence de la commande, le montant TTC, la date limite et les instructions du mode choisi (IBAN ou adresse d'envoi du chèque). Les coordonnées sont dans la configuration de l'API.
- **Annulation par le client** : le client annule sa commande en attente (`PATCH /api/orders/:id/status`, passage à `cancelled`) au lieu de la supprimer. Aucune commande n'est jamais supprimée.
- **Email d'annulation** quand l'admin annule une commande non payée (US25c).
- **Routes** : connexion et déconnexion sur `/api/auth` (cohérent avec le JWT, sans session) ; pages de commande au pluriel (`/commandes/nouvelle`, `/commandes/nouvelle/paiement`, `/commandes/:id/confirmation`) ; ajout de `GET /api/categories`, `GET /api/admin/trees` et `GET /api/admin/trees/:id` (l'admin voit aussi les arbres retirés). Les ressources uniques de l'utilisateur connecté restent au singulier (`/panier`, `/compte`, `/api/cart`).
- **Filtre par catégorie** : la catégorie se choisit dans une liste et le site envoie son identifiant (`?category=2`) ; seul le nom de l'arbre se tape dans la recherche.
- **Après la connexion** : le client revient sur la fiche de l'arbre et clique de nouveau sur « Ajouter au panier » ; le retour automatique reste une évolution (US06).
- **TypeScript** pour le front-end et l'API.
- **Prix TTC** partout ; quantité de 1 à 100 par arbre dans le panier.
- **Accueil** : les 3 derniers arbres disponibles ajoutés au catalogue (`GET /api/trees/featured`).
- **Photos** stockées en dur dans le projet : l'admin renseigne le chemin, l'envoi de fichier est une évolution.
- **Premier compte admin** créé avec les données de départ de la base.
- **Informations modifiables par le client** (US28) : tout (prénom, nom, adresse, email, type de compte, structure) sauf le rôle ; l'activation du compte reste gérée par l'admin.
- **Durée du JWT** : 24 heures, puis le client se reconnecte.
- **Envoi des emails** : Nodemailer côté API, via le serveur SMTP d'un prestataire (choix retenu).
- **Sécurité de la connexion** : en MVP, mot de passe d'au moins 12 caractères et protection CSRF (cookie `SameSite=Lax` et requêtes JSON uniquement sur les routes qui modifient des données). La limitation des tentatives de connexion est classée en évolution.
- **Serveur web** : Nginx, placé devant le front-end et l'API sur le VPS (HTTPS avec Certbot, aiguillage des requêtes `/api`).
- **CGV** : classées en évolution (page `/cgv` et case à cocher sur la page de paiement).
- **Rôle administrateur des ventes** : classé en évolution. Il gérera les commandes et le catalogue sans accès aux comptes ni à la partie technique ; l'administrateur actuel devient le super-administrateur. La table `role` permet de l'ajouter sans changer la structure de la base (US49, US55, US56).
- **Évolutions ajoutées** : mot de passe oublié (US37), pagination des listes, envoi des photos (US48), retour automatique sur la fiche, panier enrichi.
- **Fin du sprint 0** : Préparation ensemble, Loïc et Shanna feront la présentation. Simulation faite, ajustée et validée.
- **Maquette et charte graphique** : analyse avec l'équipe, ajustement et correction. Maquette finale validée.

### À poursuivre

- **Fin du sprint 0** : Préparation de la présentation officielle..
- **Vision sur le sprint 1** : réflexions à donner aux Tech Leads pour lundi, tests des environements de chacun via une checklist

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
- **Suppression d'une commande** : ~~le client ne peut supprimer une commande que si elle est `pending` (`DELETE /api/orders/:id`)~~. Révisé le 2026-10-22 : le client annule sa commande au lieu de la supprimer. Une commande `paid`, `planted` ou `cancelled` n'est jamais effacée : les annulations restent tracées.
- **Suivi du statut par le client** (US27) : passe en MVP ; le client voit le statut de ses commandes dans son historique, l'admin le fait évoluer (US46).
- **Paiement** : page de paiement avec choix du mode (virement, ~~carte,~~ chèque, ~~PayPal~~ ; carte et PayPal retirés le 2026-10-22) et case obligatoire « Je m'engage à effectuer mon paiement sous 10 jours ou ma commande sera annulée ». Rien n'est encaissé en ligne (nouveau statut `cancelled`).
- **Emails automatiques** : confirmation à la création de la commande ; avis de réception quand l'admin passe la commande à `paid`. Le suivi des commandes par l'admin (US46) passe en MVP.
- **Hébergement** : tout sur un **VPS fourni par O'Clock** (front, API, PostgreSQL en conteneurs Docker), sur un seul nom de domaine.
- **Authentification par JWT** : jeton signé (id du compte et rôle) dans un cookie `httpOnly`, aucune session stockée côté serveur. Un jeton ne peut pas être révoqué avant son expiration : en V1, `is_active` est contrôlé à la connexion ; la révocation (relecture du compte à chaque requête ou `token_version`) est prévue en V2.
- **Rôles** : les droits sont contrôlés par un middleware de rôles dans l'API. Les règles que la base ne peut pas garantir sont gérées par l'API : vérification du propriétaire d'une ressource, transitions de statut autorisées, refus de supprimer ou désactiver le dernier admin.
- **Recherche par nom** : `unaccent(name) ILIKE unaccent('%' || $1 || '%')`, sans nouvelle colonne.
- **Arbre jamais commandé** : supprimé directement ; il disparaît des paniers qui le contiennent (`cart_item.tree_id` en `ON DELETE CASCADE`).
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
