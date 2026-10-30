# Cahier des charges — Je s’appelle Graine V1

**Date :** 2026-10-19  
**Statut :** proposition de cadrage

## 1\. Présentation du projet

Je s’appelle Graine est une plateforme e-commerce qui permet de contribuer à la reforestation en achetant des arbres à planter. Le site présente la mission de Je s’appelle Graine, les arbres proposés et les informations disponibles sur chaque offre. Un client peut passer une commande\* et la retrouver dans son espace personnel.

La plateforme vise à réunir dans un même service la présentation du projet, la découverte des arbres, la gestion du catalogue et le suivi des commandes. À terme, Je s’appelle Graine pourra aussi accueillir des offres proposées par des associations partenaires.

\*La première version n’encaisse aucun paiement en ligne et ne collecte aucune donnée bancaire. Le client choisit son mode de paiement (virement ou chèque), s’engage à payer sous 10 jours, puis règle en dehors du site. Le paiement par carte bancaire et par PayPal arrivera avec le paiement en ligne (évolution). Le parcours d’achat est complet : commande enregistrée, confirmation à l’écran et par email.

## 2\. Besoins et objectifs

### Besoins

- Les visiteurs qui souhaitent soutenir la reforestation ont besoin de comprendre la démarche de Je s’appelle Graine et de découvrir les arbres proposés.
- Les visiteurs ont besoin d’informations suffisamment claires pour choisir un arbre avant de passer une commande.
- Les clients ont besoin de retrouver les commandes qu’ils ont passées sur la plateforme.
- L’administrateur a besoin d’ajouter, de modifier et de retirer les offres d’arbres sans intervenir directement dans la base de données.
- L’administrateur doit pouvoir gérer le catalogue sans donner ces droits aux clients.

### Objectifs

- Présenter Je s’appelle Graine et sa mission dès la page d’accueil.
- Permettre la consultation du catalogue et des fiches détaillées des arbres.
- Proposer la création d’un compte et l’authentification des clients.
- Enregistrer une commande pour un client connecté, avec le mode de paiement choisi (sans paiement en ligne), et l’informer par email.
- Permettre à chaque client de consulter uniquement son propre historique de commandes.
- Permettre aux administrateurs Je s’appelle Graine de gérer le catalogue, les commandes et les comptes clients depuis des pages protégées par authentification.
- Concevoir une application utilisable sur mobile et ordinateur et pouvant évoluer vers un paiement réel et des partenaires.

## 3\. Fonctionnalités

### MVP — première version fonctionnelle

Le MVP couvre le parcours d’achat, les fonctions essentielles du compte et l’administration du catalogue, des commandes et des comptes :

1. **Accueil** : présenter Je s’appelle Graine et mettre en avant les 3 derniers arbres disponibles ajoutés au catalogue.
2. **Pages de présentation et d’information** : proposer les pages « Qui sommes-nous », mentions légales et politique de confidentialité.
3. **Catalogue** : afficher les arbres, les rechercher par nom et les filtrer par catégorie (résineux, feuillage caduc, feuillage persistant) ; les deux critères peuvent être combinés. Le nom se tape dans un champ de recherche ; la catégorie se choisit dans une liste, et le site transmet son identifiant. Chaque arbre a un état de disponibilité : _disponible_ (visible et commandable), _épuisé_ (visible, non commandable) ou _retiré du catalogue_ (masqué).
4. **Fiche arbre** : présenter la photo, la description, le prix TTC et le lieu de plantation lorsqu’il est renseigné. Choisir la quantité souhaitée (1 par défaut, 100 au maximum) avant d’ajouter l’arbre au panier.
5. **Panier** : un utilisateur doit créer un compte ou se connecter avant d’ajouter un arbre au panier. Le client connecté peut consulter le panier, voir les quantités, les prix unitaires et le total, modifier les quantités et retirer des articles. La quantité d’un arbre dans le panier va de 1 à 100. Tous les prix affichés sur le site sont TTC. Depuis la vignette d’un arbre (accueil, catalogue), un bouton ajoute directement 1 arbre au panier ; la quantité se modifie ensuite dans le panier.
6. **Compte client** : inscription, connexion, déconnexion, consultation et modification des informations, changement de mot de passe et suppression du compte. Le client peut modifier toutes ses informations (prénom, nom, adresse, email, type de compte et structure), sauf son rôle ; l’activation du compte reste gérée par l’administrateur. Le mot de passe doit contenir au moins 12 caractères, à l’inscription comme au changement de mot de passe. Les commandes déjà passées sont conservées après la suppression du compte (voir §8).
7. **Commande et paiement** : depuis son panier, le client vérifie le récapitulatif puis, sur la page de paiement, choisit son mode de paiement (virement ou chèque) et coche la case obligatoire « Je m’engage à effectuer mon paiement sous 10 jours, sinon ma commande sera annulée ». Rien n’est encaissé en ligne et aucune donnée bancaire n’est saisie : le client règle ensuite par le moyen choisi.
8. **Confirmation, emails et historique** : à l’enregistrement de la commande, une page de confirmation s’affiche et un **email de confirmation de commande** est envoyé automatiquement. Les deux indiquent la **référence de la commande** (son numéro), le montant TTC, la date limite de paiement et les **instructions du mode choisi** : IBAN pour un virement (avec la référence dans le libellé) ou adresse d’envoi pour un chèque (avec la référence au dos). Quand l’administrateur enregistre la réception du paiement, un **email de réception du paiement** est envoyé au client ; si la commande est annulée faute de paiement, un **email d’annulation** lui est envoyé. Ces emails partent à l’adresse enregistrée dans la commande. Le client consulte ses commandes passées et leur statut, et peut **annuler** une commande tant qu’elle est en attente de paiement.
9. **Gestion du catalogue** : un administrateur peut ajouter, modifier un arbre et changer son état de disponibilité. Un arbre déjà commandé n’est jamais supprimé : il passe à l’état _retiré du catalogue_. Les photos des arbres sont stockées en dur dans le projet (dossier d’images du front-end) : l’administrateur renseigne le chemin de la photo, sans envoi de fichier. Les trois catégories sont fixes et créées avec la base.
10. **Gestion des comptes clients** : un administrateur peut consulter et gérer les comptes clients. Les droits et actions d’administration sont réservés à ce rôle. Le premier compte administrateur est créé avec les données de départ de la base : aucune page ni route ne permet de créer un administrateur.
11. **Suivi des commandes** : un administrateur consulte les commandes et change leur statut : _payée_ à réception du paiement, _plantée_, ou _annulée_ si le paiement n’est pas arrivé sous 10 jours. La liste met en évidence les commandes en attente depuis plus de 10 jours. La date de chaque changement de statut est enregistrée dans la commande.

#### Modélisation du panier

Le panier du MVP n’a **aucune information propre** : il est réservé aux comptes connectés, chaque client n’a qu’un seul panier en cours, et les paniers abandonnés ne sont pas suivis. Il n’est donc pas modélisé comme une entité : c’est une association _Contenir_ entre l’utilisateur et l’arbre, qui porte la quantité. En base, chaque ligne du panier (`cart_item`) est rattachée directement au compte du client, et le panier d’un client est l’ensemble de ses lignes. Rien n’est créé à l’inscription.

#### Parcours principal du MVP

1. Le visiteur découvre Je s’appelle Graine, parcourt le catalogue et filtre les arbres par catégorie.
2. Il consulte la fiche d’un arbre, choisit la quantité souhaitée et clique sur « Ajouter au panier » (depuis la vignette d’un arbre, sur l’accueil ou le catalogue, le bouton du panier ajoute directement 1 arbre).
3. S’il n’est pas connecté, le système le redirige vers la page de connexion, qui propose aussi de créer un compte s’il n’en a pas encore. Une fois connecté, il revient sur la fiche de l’arbre et clique de nouveau sur « Ajouter au panier » (le retour automatique sur la fiche est une évolution).
4. Une fois connecté, le client ajoute l’arbre au panier dans la quantité choisie, consulte son contenu et peut ajuster les quantités ou retirer des articles.
5. Il vérifie le récapitulatif, passe à la page de paiement, choisit son mode de paiement, coche l’engagement de payer sous 10 jours et confirme la commande.
6. Le système enregistre la commande (en attente de paiement), affiche une confirmation avec la référence de la commande et les instructions de paiement, et envoie le même récapitulatif par email.
7. À réception du paiement, l’administrateur passe la commande à _payée_ et le client reçoit un email. Sans paiement sous 10 jours, l’administrateur annule la commande et le client en est informé par email.
8. Le client retrouve sa commande et son statut dans son historique.

Un arbre épuisé ou retiré du catalogue ne peut pas faire l’objet d’une nouvelle commande. Le nom de l’arbre, le prix payé et le lieu de plantation sont enregistrés dans la commande : l’historique ne change pas si l’arbre est modifié. Un arbre déjà commandé n’est jamais supprimé, il passe à l’état _retiré du catalogue_.

### Évolutions potentielles

Ces fonctionnalités sont envisagées, mais ne sont pas nécessaires pour que le MVP soit utilisable :

- Paiement en ligne par carte bancaire et par PayPal, sécurisé par un prestataire tel que Stripe (aucune donnée bancaire stockée dans notre base).
- Annulation automatique des commandes non payées après 10 jours (tâche planifiée), au lieu d’une annulation par l’administrateur.
- Réinitialisation du mot de passe oublié, par un lien envoyé par email.
- Retour automatique sur la fiche de l’arbre après la connexion ou l’inscription.
- Limitation des tentatives de connexion (par exemple 5 essais ratés en 15 minutes) pour bloquer les attaques par force brute.
- Envoi des photos des arbres depuis l’espace administrateur.
- Pagination des listes (catalogue, commandes, comptes).
- Panier enrichi : panier d’un visiteur non connecté (repéré par un cookie, puis rattaché à son compte à la connexion), dates de création et de modification, suivi et relance des paniers abandonnés, codes promo, plusieurs paniers par client (paniers sauvegardés). Le panier ayant alors ses propres informations, il redeviendrait une entité _Panier_ : une table `cart` porterait ces informations et les lignes `cart_item` seraient rattachées au panier au lieu du compte.
- Page des associations partenaires, newsletter et formulaire de contact.
- Sélection des arbres mis en avant par l’administrateur.
- Carte interactive permettant de visualiser les lieux de plantation des arbres achetés.
- Back-office étendu (statistiques, export des commandes, gestion avancée des profils utilisateurs).
- Rôle **administrateur des ventes** : il gère les commandes (statuts, paiements reçus) et le catalogue, sans accès aux comptes des clients ni aux réglages techniques. L’administrateur actuel devient le **super-administrateur**, qui garde tous les droits, y compris l’aspect technique et l’attribution des rôles. Le modèle de données le permet déjà sans changer de structure : il suffit d’ajouter une ligne dans la table `role`, et l’API vérifie le rôle route par route.
- Espace partenaire permettant aux associations de proposer des arbres ou des lots, avec validation par Je s’appelle Graine.
- Conditions générales de vente (CGV) : page `/cgv` et case « J’ai lu et j’accepte les CGV » obligatoire sur la page de paiement.
- Version anglaise en complément du français.

## 4\. Architecture et technologies

### Architecture proposée

L’application comprend un front-end, un back-end et une base de données, hébergés ensemble sur un **VPS** (serveur privé virtuel fourni par O'Clock), chacun dans un conteneur Docker. Le front-end présente le site et envoie les demandes au back-end. Le back-end applique les règles de Je s’appelle Graine, lit ou enregistre les données dans la base et envoie les emails.

```
Visiteur dans son navigateur
        │ HTTPS (un seul nom de domaine)
        ▼
VPS — conteneurs Docker (Docker Compose)
  ├── Serveur web Nginx (HTTPS) : envoie /api/... à l’API, le reste au front-end
  ├── FRONT-END : Next.js / React
  ├── BACK-END : API REST Je s’appelle Graine
  │       │ réseau Docker interne
  │       ▼
  └── BASE DE DONNÉES : PostgreSQL (volume de données sauvegardé)

BACK-END ──SMTP──▶ Service d’envoi d’emails ──▶ boîte mail du client
```

&nbsp;

- **Serveur web — Nginx, dans un conteneur sur le VPS :** reçoit toutes les requêtes HTTPS (certificat Let’s Encrypt obtenu et renouvelé avec Certbot), envoie celles qui commencent par `/api` à l’API et les autres au front-end. Le site et l’API partagent ainsi le même nom de domaine.
- **Front-end — Next.js et React, dans un conteneur sur le VPS :** affiche les pages publiques, le catalogue, le panier, les pages client et les pages d’administration. Il envoie les demandes de lecture ou de modification à **l’API REST Je s’appelle Graine**.
- **Back-end — API REST Je s’appelle Graine avec Node.js et Express :** reçoit les requêtes du front-end, valide les données, vérifie les droits, applique les règles métier et renvoie des réponses JSON. L’API est exécutée dans un conteneur Docker, en développement comme sur le VPS.
- **Services métier :** modules du back-end qui appliquent les règles du projet. Par exemple, le service d’authentification vérifie les identifiants, émet et vérifie le jeton JWT ; le service de commande vérifie la disponibilité des arbres et l’engagement de paiement avant d’enregistrer une commande, puis demande l’envoi de l’email de confirmation.
- **Envoi d’emails :** l’API envoie les emails automatiques (confirmation de commande, réception du paiement, annulation) en se connectant à un serveur d’envoi (SMTP) : Nodemailer côté Node.js.
- **DataMappers :** modules utilisés par les services métier pour accéder aux données. Ils isolent les requêtes SQL paramétrées du reste du back-end.
- **Base de données — PostgreSQL :** conserve les comptes, les offres d’arbres, les paniers et les commandes. Les tables des comptes et des commandes s’appellent `account` et `purchase`, car `user` et `order` sont des mots réservés de PostgreSQL (exception à la charte de nommage). PostgreSQL tourne dans un conteneur Docker, en local pendant le développement et sur le VPS. Sur le VPS, les données sont conservées dans un volume Docker et sauvegardées régulièrement. Seul le back-end se connecte à la base, par le réseau Docker interne ; la base n’est pas exposée sur Internet et ses identifiants ne sont pas exposés au navigateur ni au front-end.
- **Docker :** Docker Compose lance les mêmes conteneurs (front-end, API, PostgreSQL) en développement et sur le VPS, où s’ajoute le conteneur Nginx, avec une configuration reproductible.

Dans cette architecture, les endpoints REST sont fournis par le back-end. Ce sont des routes de l’API Je s’appelle Graine, pas des Route Handlers Next.js. Le front-end et l’API sont servis sous le même nom de domaine (l’API sous `/api`), ce qui évite de partager le cookie du jeton JWT entre deux domaines.

### Justification des choix

- **Next.js et React**, en **TypeScript**, sont retenus pour construire l’interface à partir de composants réutilisables et organiser les pages du site. Le rendu côté serveur peut être utilisé pour les pages publiques, comme le catalogue, tandis que les composants interactifs répondent aux besoins du panier et des filtres.
- **Une API REST distincte** sépare l’interface, les règles métier et l’accès aux données. Elle échange des données au format JSON avec le front-end et pourra être réutilisée par un autre client si le projet en a besoin.
- **Node.js et Express** sont retenus pour développer l’API REST en **TypeScript**, comme le front-end. Express fournit le routage et les middlewares nécessaires au traitement des requêtes HTTP. L’organisation du back-end séparera les routes, les contrôleurs, les services métier et les DataMappers.
- **PostgreSQL** est retenu pour stocker les données structurées et liées du projet, notamment les comptes, les arbres, les paniers et les commandes. Ses clés et contraintes permettent de garantir la cohérence des relations entre ces données.
- **Le DataMapper** est retenu pour isoler les requêtes SQL paramétrées dans des modules dédiés et distinguer l’accès aux données des règles métier.
- **Docker** conteneurise le front-end, l’API et PostgreSQL : l’application s’exécute de la même façon sur les postes de développement et sur le VPS.
- **Husky** est retenu pour automatiser les vérifications définies par l’équipe avant les commits et détecter plus tôt les erreurs courantes. Les commandes associées seront documentées et maintenues rapides.
- **HTTPS et JSON** sont retenus pour les échanges entre le front-end et l’API : HTTPS protège les données pendant leur transmission et JSON sert de format commun aux requêtes et réponses de l’API.
- **Un VPS** est retenu pour héberger toute l’application : un seul serveur à administrer, le même environnement Docker qu’en développement, et le front-end et l’API sur le même domaine. En contrepartie, l’équipe gère elle-même les mises à jour, la sécurité (pare-feu, certificat HTTPS) et les sauvegardes de la base.
- **Nginx** est retenu comme serveur web : très répandu, il gère le HTTPS et l’aiguillage des requêtes entre le front-end et l’API avec une configuration simple.
- **Nginx et Certbot tournent dans des conteneurs**, plutôt qu’installés directement sur le VPS (décision du 29/10/2026, carte #31) :
  - leur configuration est versionnée dans le dépôt (`src/nginx/default.conf.template`, `src/docker-compose.prod.yml`) : relue en PR, identique pour toute l’équipe ;
  - Nginx joint l’API et le front-end par leur nom de service (`api`, `front`) sur le réseau Docker, sans que leurs ports soient publiés sur le VPS ;
  - la pile de production se teste d’abord sur un poste de développement ;
  - pour remettre le site en ligne sur un VPS neuf, il suffit de cloner le dépôt et de lancer `docker compose`.
  - En contrepartie, obtenir et renouveler le certificat demande quelques commandes de plus (Certbot en mode `--standalone`, puis `--webroot` avec une tâche cron), au lieu du seul `certbot --nginx` d’une installation directe.
- **Un service d’envoi d’emails (SMTP)** est nécessaire pour que les emails automatiques arrivent bien dans la boîte de réception des clients, et non dans les indésirables.

### Technologies retenues ou à confirmer

| Composant                  | Choix proposé                                              | État                                                                                               |
| :------------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| Site web                   | Next.js, React, en TypeScript                              | Choix retenu                                                                                       |
| Hébergement                | VPS : front-end, API et base de données                    | Choix retenu (fournisseur : O'Clock)                                                               |
| Serveur web                | Nginx (HTTPS avec Certbot, aiguillage `/api`)              | Choix retenu                                                                                       |
| API                        | Node.js et Express, en TypeScript ; API REST               | Choix retenu                                                                                       |
| Base de données            | PostgreSQL dans un conteneur Docker (développement et VPS) | Choix retenu                                                                                       |
| Envoi d’emails             | Serveur SMTP d’un prestataire avec Nodemailer côté API     | Choix retenu                                                                                       |
| Accès aux données          | DataMappers avec requêtes paramétrées                      | Choix retenu                                                                                       |
| Conteneurisation           | Docker et Docker Compose                                   | Front-end, API et PostgreSQL conteneurisés, en développement et sur le VPS (plus Nginx sur le VPS) |
| Versionnement              | Git et GitHub                                              | Suivre les modifications et faciliter le travail en équipe                                         |
| Hooks Git                  | Husky                                                      | Lancer automatiquement les vérifications prévues avant les commits                                 |
| Protocole navigateur ↔ API | HTTPS avec réponses JSON                                   | Certificat HTTPS à mettre en place sur le VPS                                                      |

&nbsp;

## 5\. Cible

La plateforme s’adresse :

- aux particuliers qui souhaitent contribuer à la reforestation ;
- aux entreprises responsables qui souhaitent soutenir une action environnementale ;
- aux associations engagées, susceptibles de devenir partenaires dans une évolution du service.

Les utilisateurs peuvent ne pas connaître le vocabulaire lié aux espèces ou à la plantation. Les informations devront donc être rédigées simplement et les étapes de commande devront rester lisibles. L’interface sera conçue en priorité pour le mobile, tout en restant confortable sur tablette et ordinateur. Les actions principales devront être accessibles au clavier.

## 6\. Navigateurs compatibles

Le site vise les versions stables récentes de :

- Google Chrome ;
- Mozilla Firefox ;
- Safari sur macOS et iOS.

La compatibilité sera vérifiée sur les appareils disponibles pour l’équipe. Les pages principales devront rester lisibles et utilisables aux formats mobile, tablette et ordinateur.

## 7\. Arborescence de l’application

```
Site public
├── Accueil
├── Qui sommes-nous
├── Catalogue des arbres
│   ├── Recherche par nom
│   ├── Filtre par catégorie
│   └── Fiche d’un arbre
├── Inscription
├── Connexion
├── Mentions légales
└── Politique de confidentialité

Espace client (connexion requise)
├── Panier
├── Mon compte
│   ├── Consulter mes informations
│   ├── Modifier mes informations
│   ├── Modifier mon mot de passe
│   └── Supprimer mon compte
├── Nouvelle commande
│   ├── Récapitulatif
│   └── Paiement (choix du mode et engagement de payer sous 10 jours)
└── Mes commandes
    ├── Confirmation de commande (référence et instructions de paiement)
    ├── Détail d’une commande
    └── Annuler une commande en attente

Espace administrateur (accès réservé)
├── Liste des arbres
├── Ajouter un arbre
├── Modifier un arbre
├── Changer la disponibilité d’un arbre (disponible, épuisé, retiré)
├── Gestion des comptes clients
│   ├── Consulter les comptes
│   └── Modifier l’état ou supprimer un compte
└── Gestion des commandes
    ├── Consulter les commandes
    └── Changer le statut (payée, plantée, annulée)
```

&nbsp;

## 8\. Routes prévues

Les routes des pages web sont servies par le site Next.js. Les routes `/api/...` sont servies par l’API REST, sur le même VPS et le même nom de domaine. Les méthodes HTTP indiquent l’action réalisée ; les routes API sont organisées autour des ressources.

### Routes des pages web

| Méthode | Route                           | Fonction                                                                                                       | Accès                       |
| :------ | :------------------------------ | :------------------------------------------------------------------------------------------------------------- | :-------------------------- |
| GET     | `/`                             | Présenter Je s’appelle Graine et les 3 derniers arbres disponibles ajoutés                                     | Public                      |
| GET     | `/qui-sommes-nous`              | Présenter Je s’appelle Graine et sa mission                                                                    | Public                      |
| GET     | `/arbres`                       | Afficher les arbres disponibles ou épuisés                                                                     | Public                      |
| GET     | `/arbres?categorie=:id`         | Filtrer les arbres par catégorie (choisie dans une liste, identifiant dans l’URL)                              | Public                      |
| GET     | `/arbres?recherche=:recherche`  | Rechercher les arbres par nom (combinable avec la catégorie)                                                   | Public                      |
| GET     | `/arbres/:id`                   | Afficher la fiche d’un arbre, son prix et son lieu de plantation                                               | Public                      |
| GET     | `/panier`                       | Consulter le panier et modifier les articles                                                                   | Client connecté             |
| GET     | `/inscription`                  | Afficher le formulaire d’inscription                                                                           | Public                      |
| GET     | `/connexion`                    | Afficher le formulaire de connexion                                                                            | Public                      |
| GET     | `/mentions-legales`             | Consulter les mentions légales                                                                                 | Public                      |
| GET     | `/politique-de-confidentialite` | Consulter la politique de confidentialité                                                                      | Public                      |
| GET     | `/compte`                       | Consulter et gérer les informations du compte                                                                  | Client connecté             |
| GET     | `/commandes/nouvelle`           | Afficher le récapitulatif avant le paiement                                                                    | Client connecté             |
| GET     | `/commandes/nouvelle/paiement`  | Choisir le mode de paiement et cocher l’engagement (10 jours)                                                  | Client connecté             |
| GET     | `/commandes`                    | Afficher les commandes du client connecté                                                                      | Client connecté             |
| GET     | `/commandes/:id/confirmation`   | Afficher la confirmation : référence, montant, date limite et instructions de paiement                         | Propriétaire de la commande |
| GET     | `/commandes/:id`                | Afficher le détail d’une commande, l’annuler si elle est en attente                                            | Propriétaire de la commande |
| GET     | `/admin/arbres`                 | Gérer le catalogue                                                                                             | Administrateur              |
| GET     | `/admin/arbres/nouveau`         | Afficher le formulaire d’ajout d’un arbre                                                                      | Administrateur              |
| GET     | `/admin/arbres/:id/modifier`    | Afficher le formulaire de modification                                                                         | Administrateur              |
| GET     | `/admin/comptes`                | Afficher la liste des comptes clients                                                                          | Administrateur              |
| GET     | `/admin/comptes/:id`            | Consulter un compte client                                                                                     | Administrateur              |
| GET     | `/admin/comptes/:id/modifier`   | Gérer l’état d’un compte client                                                                                | Administrateur              |
| GET     | `/admin/commandes`              | Afficher toutes les commandes et leur statut, en mettant en évidence celles en attente depuis plus de 10 jours | Administrateur              |
| GET     | `/admin/commandes/:id`          | Consulter une commande et changer son statut                                                                   | Administrateur              |

&nbsp;

Les formulaires d’inscription, de connexion, de gestion du compte, de commande et d’administration transmettent leurs données à l’API REST. Le panier est accessible aux clients connectés. Lorsqu’un visiteur clique sur « Ajouter au panier » (sur la fiche ou sur la vignette d’un arbre), il est redirigé vers la page de connexion, qui propose aussi un lien vers l’inscription (le visiteur est peut-être déjà client). Une fois connecté, il revient sur la fiche de l’arbre pour l’ajouter au panier.

### Endpoints de l’API REST

| Méthode | Endpoint                       | Fonction                                                                                                                    | Accès                       |
| :------ | :----------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :-------------------------- |
| GET     | `/api/trees`                   | Lister les arbres disponibles ou épuisés                                                                                    | Public                      |
| GET     | `/api/trees?category=:id`      | Filtrer ces arbres par catégorie (identifiant venant de `GET /api/categories`)                                              | Public                      |
| GET     | `/api/trees?search=:search`    | Rechercher ces arbres par nom, même partiel (combinable avec `category`)                                                    | Public                      |
| GET     | `/api/trees/:id`               | Consulter le détail d’un arbre (sauf retiré du catalogue)                                                                   | Public                      |
| GET     | `/api/trees/featured`          | Arbres mis en avant sur l’accueil : les 3 derniers arbres disponibles ajoutés (choix par l’administrateur en évolution)     | Public                      |
| GET     | `/api/categories`              | Lister les catégories (filtre du catalogue, formulaire arbre)                                                               | Public                      |
| POST    | `/api/users`                   | Créer un compte client                                                                                                      | Public                      |
| POST    | `/api/auth`                    | Se connecter : vérifier les identifiants et émettre le jeton JWT (cookie `httpOnly`)                                        | Public                      |
| DELETE  | `/api/auth`                    | Se déconnecter : effacer le cookie du jeton                                                                                 | Client connecté             |
| GET     | `/api/users/me`                | Consulter les informations du compte connecté                                                                               | Client connecté             |
| PATCH   | `/api/users/me`                | Modifier les informations du compte connecté                                                                                | Client connecté             |
| PATCH   | `/api/users/me/password`       | Modifier le mot de passe du compte connecté                                                                                 | Client connecté             |
| DELETE  | `/api/users/me`                | Supprimer le compte du client connecté                                                                                      | Client connecté             |
| GET     | `/api/cart`                    | Consulter le panier du client connecté                                                                                      | Client connecté             |
| POST    | `/api/cart/items`              | Ajouter un arbre au panier avec la quantité choisie                                                                         | Client connecté             |
| PATCH   | `/api/cart/items/:id`          | Modifier la quantité d’un article du panier                                                                                 | Client connecté             |
| DELETE  | `/api/cart/items/:id`          | Retirer un article du panier                                                                                                | Client connecté             |
| POST    | `/api/orders`                  | Créer la commande (mode de paiement + engagement 10 jours) et envoyer l’email de confirmation                               | Client connecté             |
| GET     | `/api/orders`                  | Lister les commandes du client connecté                                                                                     | Client connecté             |
| GET     | `/api/orders/:id`              | Consulter une de ses commandes                                                                                              | Propriétaire de la commande |
| PATCH   | `/api/orders/:id/status`       | Annuler une de ses commandes : seul le passage de `pending` à `cancelled` est accepté                                       | Propriétaire de la commande |
| GET     | `/api/admin/orders`            | Lister toutes les commandes (filtrables par statut ; celles en retard de paiement sont mises en évidence)                   | Administrateur              |
| GET     | `/api/admin/orders/:id`        | Consulter une commande                                                                                                      | Administrateur              |
| PATCH   | `/api/admin/orders/:id/status` | Changer le statut et enregistrer sa date ; `paid` envoie l’email de réception du paiement, `cancelled` l’email d’annulation | Administrateur              |
| GET     | `/api/admin/trees`             | Lister tous les arbres, y compris épuisés et retirés                                                                        | Administrateur              |
| GET     | `/api/admin/trees/:id`         | Consulter un arbre, même retiré (formulaire de modification)                                                                | Administrateur              |
| POST    | `/api/admin/trees`             | Ajouter un arbre au catalogue                                                                                               | Administrateur              |
| PATCH   | `/api/admin/trees/:id`         | Modifier un arbre, dont son état de disponibilité                                                                           | Administrateur              |
| DELETE  | `/api/admin/trees/:id`         | Supprimer un arbre jamais commandé (sinon refus : le passer à « retiré »)                                                   | Administrateur              |
| GET     | `/api/admin/availabilities`    | Lister les états de disponibilité (formulaire arbre)                                                                        | Administrateur              |
| GET     | `/api/admin/users`             | Lister les comptes clients                                                                                                  | Administrateur              |
| GET     | `/api/admin/users/:id`         | Consulter un compte client                                                                                                  | Administrateur              |
| PATCH   | `/api/admin/users/:id`         | Modifier l’état d’un compte client                                                                                          | Administrateur              |
| DELETE  | `/api/admin/users/:id`         | Supprimer un compte client                                                                                                  | Administrateur              |

&nbsp;

L’API répond en JSON. Les entrées sont validées côté serveur. Les endpoints privés contrôlent l’authentification et les droits, même si les pages du site masquent les actions non autorisées. Toutes les routes réservées à l’administrateur sont regroupées sous le préfixe `/api/admin/`, protégé par un seul middleware de rôle : une route d’administration ne peut pas être exposée par oubli. L’authentification utilise un jeton **JWT** signé par l’API (clé secrète dans les variables d’environnement) et transmis par cookie `httpOnly`. Il contient l’identifiant du compte et son rôle, et expire au bout de **24 heures** : le client doit alors se reconnecter. Aucune session n’est stockée côté serveur. Contre les requêtes envoyées à l’insu du client depuis un autre site (CSRF), le cookie est en `SameSite=Lax` et l’API n’accepte que des requêtes JSON (`Content-Type: application/json`) sur les routes qui modifient des données. Le mot de passe doit contenir au moins 12 caractères : l’API le vérifie à l’inscription et au changement de mot de passe. Le client ne peut consulter ou modifier que les informations de son propre compte. À la déconnexion ou à la suppression du compte, l’API efface le cookie. Un jeton ne peut pas être révoqué avant son expiration : la révocation (relecture du compte à chaque requête ou `token_version`) est prévue en V2. Le client peut annuler une commande tant qu’elle est en attente (`pending`) : elle passe à `cancelled`. Aucune commande n’est jamais supprimée. Les coordonnées de paiement (IBAN et adresse d’envoi des chèques) sont définies dans la configuration de l’API (variables d’environnement) et reprises sur la page de confirmation et dans l’email. Tous les montants sont TTC. `POST /api/orders` refuse la commande si le mode de paiement n’est pas dans la liste prévue, si l’engagement de payer sous 10 jours n’est pas coché ou si un arbre du panier n’est pas disponible. Les commandes sont conservées après la suppression du compte, avec l’identité de l’acheteur figée au moment de la commande (prénom, nom, email, structure, adresse) pour la comptabilité et la facturation ; les autres données du compte sont supprimées. Les emails liés à une commande sont envoyés à l’adresse enregistrée dans la commande, même si le compte a été supprimé. À chaque changement de statut, l’API enregistre la date correspondante (paiement, plantation ou annulation).

## 9\. User stories

### Rôles

| Rôle         | Description                                                                            |
| :----------- | :------------------------------------------------------------------------------------- |
| **Visiteur** | Personne non connectée qui découvre le site                                            |
| **Client**   | Utilisateur inscrit et connecté qui achète des arbres                                  |
| **Admin**    | Membre de Je s’appelle Graine qui gère le catalogue, les commandes et les utilisateurs |

&nbsp;

---

### Visiteur

| ID    | En tant que | Je veux                                                                                                                                                                                                                                                                        | Afin de                                                                    | Priorité |
| :---- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :------- |
| US01  | Visiteur    | voir une page d'accueil présentant Je s’appelle Graine et les 3 derniers arbres ajoutés au catalogue                                                                                                                                                                           | comprendre la mission du site et avoir envie de participer                 | MVP      |
| US02  | Visiteur    | consulter le catalogue des arbres                                                                                                                                                                                                                                              | voir tout ce qui est disponible à l'achat                                  | MVP      |
| US03  | Visiteur    | filtrer le catalogue par catégorie (résineux, feuillage caduc, feuillage persistant)                                                                                                                                                                                           | trouver rapidement le type d'arbre qui m'intéresse                         | MVP      |
| US03b | Visiteur    | rechercher un arbre par son nom, même partiel et sans tenir compte des majuscules                                                                                                                                                                                              | trouver directement l'arbre que je cherche                                 | MVP      |
| US03c | Visiteur    | combiner la recherche par nom et le filtre par catégorie                                                                                                                                                                                                                       | affiner ma recherche                                                       | MVP      |
| US03d | Visiteur    | voir un message clair quand aucun arbre ne correspond, avec un lien pour tout réafficher                                                                                                                                                                                       | ne pas croire que le catalogue est vide                                    | MVP      |
| US04  | Visiteur    | consulter la fiche détaillée d'un arbre (photo, description, prix TTC, lieu de plantation)                                                                                                                                                                                     | décider en connaissance de cause avant d'acheter                           | MVP      |
| US05  | Visiteur    | être redirigé vers la page de connexion, avec un lien pour créer un compte si je n’en ai pas, lorsque je clique sur « Ajouter au panier »                                                                                                                                      | pouvoir ajouter l'arbre à mon panier et préparer ma commande               | MVP      |
| US05b | Visiteur    | accéder au panier après avoir créé un compte ou m'être connecté                                                                                                                                                                                                                | poursuivre ma commande                                                     | MVP      |
| US07  | Visiteur    | créer un compte avec mon prénom, mon nom, mon email et mon mot de passe (au moins 12 caractères), choisir mon type de compte (particulier par défaut, association ou entreprise) et, si je choisis association ou entreprise, renseigner éventuellement le nom de ma structure | pouvoir acheter et suivre mes commandes avec un compte adapté à mon profil | MVP      |
| US08  | Visiteur    | consulter la page « Qui sommes-nous »                                                                                                                                                                                                                                          | savoir qui est derrière Je s’appelle Graine et lui faire confiance         | MVP      |
| US09  | Visiteur    | consulter les mentions légales et la politique de confidentialité (RGPD)                                                                                                                                                                                                       | savoir comment mes données sont utilisées                                  | MVP      |

&nbsp;

### Client

| ID    | En tant que | Je veux                                                                                                             | Afin de                                                                                   | Priorité |
| :---- | :---------- | :------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------- | :------- |
| US20  | Client      | me connecter avec mon email et mon mot de passe                                                                     | accéder à mon espace personnel                                                            | MVP      |
| US21  | Client      | me déconnecter                                                                                                      | sécuriser mon compte sur un appareil partagé                                              | MVP      |
| US22  | Client      | voir le détail de mon panier (arbres, quantités, prix unitaire, total)                                              | vérifier ma commande avant de la confirmer                                                | MVP      |
| US23  | Client      | modifier la quantité d'un arbre ou le retirer du panier                                                             | ajuster ma commande                                                                       | MVP      |
| US23b | Client      | choisir la quantité d'un arbre sur sa fiche (1 par défaut) avant de l'ajouter au panier                             | acheter plusieurs arbres identiques en une seule fois                                     | MVP      |
| US23c | Client      | ajouter un arbre au panier directement depuis sa vignette (accueil, catalogue), en quantité 1                       | ajouter rapidement un arbre sans ouvrir sa fiche, puis ajuster la quantité dans le panier | MVP      |
| US24  | Client      | choisir mon mode de paiement (virement ou chèque) et m’engager à payer sous 10 jours avant de confirmer ma commande | passer commande et régler par le moyen qui me convient                                    | MVP      |
| US25  | Client      | recevoir un email de confirmation avec la référence de ma commande et les instructions de paiement                  | être sûr que ma commande a bien été prise en compte                                       | MVP      |
| US25b | Client      | recevoir un email quand mon paiement a été reçu                                                                     | savoir que ma commande est validée                                                        | MVP      |
| US25c | Client      | recevoir un email si ma commande est annulée faute de paiement                                                      | savoir que je n'ai plus rien à payer                                                      | MVP      |
| US26  | Client      | consulter l'historique de mes commandes                                                                             | retrouver mes achats passés                                                               | MVP      |
| US26b | Client      | annuler une commande tant qu'elle est en attente de paiement                                                        | annuler un achat que je ne souhaite plus faire                                            | MVP      |
| US27  | Client      | suivre le statut d'une commande (en attente, payée, plantée, annulée)                                               | savoir où en est la plantation de mes arbres                                              | MVP      |
| US28  | Client      | modifier toutes mes informations (prénom, nom, adresse, email, type de compte, structure), sauf mon rôle            | garder un compte à jour                                                                   | MVP      |
| US29  | Client      | changer mon mot de passe (au moins 12 caractères)                                                                   | sécuriser mon compte                                                                      | MVP      |
| US30  | Client      | supprimer mon compte                                                                                                | exercer mon droit à l'effacement (RGPD)                                                   | MVP      |

&nbsp;

### Admin

| ID    | En tant que | Je veux                                                                                                                                                                                                                              | Afin de                                                                      | Priorité |
| :---- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :------- |
| US40  | Admin       | me connecter à un espace d'administration protégé                                                                                                                                                                                    | être le seul à pouvoir gérer le site                                         | MVP      |
| US41  | Admin       | ajouter un arbre au catalogue (nom, catégorie, description, prix TTC, chemin de la photo, lieu)                                                                                                                                      | proposer de nouveaux arbres à la vente                                       | MVP      |
| US42  | Admin       | modifier un arbre existant                                                                                                                                                                                                           | corriger ou mettre à jour ses informations                                   | MVP      |
| US43  | Admin       | supprimer un arbre jamais commandé                                                                                                                                                                                                   | nettoyer le catalogue                                                        | MVP      |
| US43b | Admin       | changer la disponibilité d’un arbre (disponible, épuisé, retiré du catalogue)                                                                                                                                                        | ne proposer à la vente que les arbres commandables, sans perdre l’historique | MVP      |
| US45  | Admin       | consulter et gérer la liste des utilisateurs                                                                                                                                                                                         | modérer et assister les clients                                              | MVP      |
| US46  | Admin       | consulter les commandes et changer leur statut (payée à réception du paiement, plantée, annulée si non payée sous 10 jours), la date de chaque changement étant enregistrée et les commandes en retard de paiement mises en évidence | suivre les paiements et tenir les clients informés                           | MVP      |

&nbsp;

## 10\. Risques et mesures de prévention

| Risque                                                                                                    | Conséquence possible                                                               | Mesure de prévention                                                                                                                                               |
| :-------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L’obligation de créer un compte ou de se connecter avant l’ajout au panier freine certains visiteurs      | Abandon du parcours d’achat                                                        | Expliquer clairement pourquoi un compte est requis et rendre l’inscription et la connexion simples.                                                                |
| Un utilisateur consulte la commande d’un autre                                                            | Atteinte à la confidentialité                                                      | Vérifier côté API l’identité et le propriétaire de chaque commande.                                                                                                |
| Suppression d’un compte entraînant la perte de données nécessaires ou la conservation de données inutiles | Historique de commande incomplet ou données personnelles conservées sans nécessité | Figer l’identité de l’acheteur dans la commande (obligation comptable) et supprimer les autres données du compte.                                                  |
| Un arbre est modifié ou retiré après une commande                                                         | L’historique ne correspond plus à l’achat enregistré                               | Enregistrer dans la commande le nom de l’arbre, le prix payé et le lieu de plantation ; ne jamais supprimer un arbre déjà commandé (état « retiré du catalogue »). |
| Le VPS tombe en panne, est mal sécurisé ou perd ses données                                               | Site indisponible, données perdues ou compromises                                  | Sauvegarder automatiquement la base hors du VPS, activer un pare-feu, appliquer les mises à jour de sécurité et servir le site en HTTPS.                           |
| La base locale et la base du VPS divergent                                                                | Comportements différents entre le développement et la production                   | Utiliser la même image PostgreSQL dans Docker Compose et appliquer les mêmes scripts SQL aux deux bases.                                                           |
| Les emails automatiques n’arrivent pas ou sont classés comme indésirables                                 | Le client ne reçoit ni confirmation ni avis de paiement                            | Passer par un prestataire d’envoi reconnu, configurer le nom de domaine pour l’envoi d’emails, et garder la commande et son statut visibles dans l’espace client.  |
| Des commandes restent impayées                                                                            | Arbres réservés sans paiement, suivi confus                                        | Engagement obligatoire de payer sous 10 jours, date limite visible, annulation par l’administrateur passé ce délai.                                                |
| Les identifiants de connexion sont interceptés ou mal stockés                                             | Compromission des comptes                                                          | Utiliser HTTPS, hacher les mots de passe côté serveur et transmettre le jeton JWT par cookie `httpOnly`.                                                           |
| Un client choisit un mot de passe trop simple (« 1234 », « azerty »)                                      | Compte facile à pirater                                                            | Imposer au moins 12 caractères à l’inscription et au changement de mot de passe.                                                                                   |
| Un site piégé envoie une requête vers l’API depuis le navigateur d’un client connecté (CSRF)              | Action faite à l’insu du client (annulation de commande, modification du compte)   | Cookie du jeton en `SameSite=Lax` et API qui n’accepte que des requêtes JSON sur les routes qui modifient des données.                                             |
| Un robot essaie des milliers de mots de passe sur un compte (force brute)                                 | Compte piraté                                                                      | Mots de passe d’au moins 12 caractères dès le MVP ; limitation des tentatives de connexion prévue en évolution.                                                    |
| Les images sont trop lourdes                                                                              | Pages lentes et consommation réseau excessive                                      | Redimensionner et compresser les images avant leur publication.                                                                                                    |
| Les tâches sont mal réparties                                                                             | Retards, oublis ou travail en double                                               | Désigner un responsable par fonctionnalité et signaler rapidement les blocages.                                                                                    |

&nbsp;

## 11\. Rôles de l’équipe

| Rôle          | Responsable                      | Responsabilités principales                                                                                                                                                                      |
| :------------ | :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product Owner | Shanna                           | Définit et priorise les besoins du produit. Tranche les questions liées au périmètre fonctionnel, aux objectifs et aux priorités de Je s’appelle Graine.                                         |
| Scrum Master  | Fabrice                          | Organise le fonctionnement de l’équipe et facilite sa collaboration. Tranche les questions d’organisation, aide à résoudre les blocages et veille au respect des pratiques de travail convenues. |
| Lead devs     | Loïc (Front) <br> Dimitry (Back) | Encadrent les décisions techniques et la cohérence de l’architecture. Tranchent les questions liées aux choix techniques, à l’organisation du code et aux pratiques de développement.            |

&nbsp;
