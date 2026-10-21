# Cahier des charges — Je s’appelle Graine V1

**Date :** 2026-10-19  
**Statut :** proposition de cadrage

## 1\. Présentation du projet

Je s’appelle Graine est une plateforme e-commerce qui permet de contribuer à la reforestation en achetant des arbres à planter. Le site présente la mission de Je s’appelle Graine, les arbres proposés et les informations disponibles sur chaque offre. Un client peut passer une commande\* et la retrouver dans son espace personnel.

La plateforme vise à réunir dans un même service la présentation du projet, la découverte des arbres, la gestion du catalogue et le suivi des commandes. À terme, Je s’appelle Graine pourra aussi accueillir des offres proposées par des associations partenaires.

\*La première version n’encaisse aucun paiement en ligne et ne collecte aucune donnée bancaire. Le client choisit son mode de paiement (virement, carte, chèque, PayPal), s’engage à payer sous 10 jours, puis règle en dehors du site. Le parcours d’achat est complet : commande enregistrée, confirmation à l’écran et par email.

## 2\. Besoins et objectifs

### Besoins

- Les visiteurs qui souhaitent soutenir la reforestation ont besoin de comprendre la démarche de Je s’appelle Graine et de découvrir les arbres proposés.
- Les visiteurs ont besoin d’informations suffisamment claires pour choisir un arbre avant de passer une commande.
- Les clients ont besoin de retrouver les commandes qu’ils ont passées sur la plateforme.
- L’administrateur a besoin d’ajouter, de modifier et de retirer les offres d’arbres sans intervenir directement dans la base de données.
- L' administrateur doit pouvoir gérer le catalogue sans donner ces droits aux clients.

### Objectifs

- Présenter Je s’appelle Graine et sa mission dès la page d’accueil.
- Permettre la consultation du catalogue et des fiches détaillées des arbres.
- Proposer la création d’un compte et l’authentification des clients.
- Enregistrer une commande pour un client connecté, avec le mode de paiement choisi (sans paiement en ligne), et l’informer par email.
- Permettre à chaque client de consulter uniquement son propre historique de commandes.
- Permettre aux administrateurs Je s’appelle Graine de gérer les offres du catalogue depuis des pages protégées par authentification.
- Concevoir une application utilisable sur mobile et ordinateur et pouvant évoluer vers un paiement réel et des partenaires.

## 3\. Fonctionnalités

### MVP — première version fonctionnelle

Le MVP couvre le parcours d’achat, les fonctions essentielles du compte et l’administration du catalogue et des comptes :

1. **Accueil** : présenter Je s’appelle Graine et mettre en avant quelques arbres.
2. **Pages de présentation et d’information** : proposer les pages « Qui sommes-nous », mentions légales et politique de confidentialité.
3. **Catalogue** : afficher les arbres et filtrer par catégorie (résineux, feuillage caduc, feuillage persistant). Chaque arbre a un état de disponibilité : *disponible* (visible et commandable), *épuisé* (visible, non commandable) ou *retiré du catalogue* (masqué).
4. **Fiche arbre** : présenter la photo, la description, le prix et le lieu de plantation lorsqu’il est renseigné. Choisir la quantité souhaitée (1 par défaut) avant d’ajouter l’arbre au panier.
5. **Panier** : un utilisateur doit créer un compte ou se connecter avant d’ajouter un arbre au panier. Le client connecté peut consulter le panier, voir les quantités, les prix unitaires et le total, modifier les quantités et retirer des articles.
6. **Compte client** : inscription, connexion, déconnexion, consultation et modification des informations, changement de mot de passe et suppression du compte.
7. **Commande et paiement** : depuis son panier, le client vérifie le récapitulatif puis, sur la page de paiement, choisit son mode de paiement (virement, carte bancaire, chèque, PayPal) et coche la case obligatoire « Je m’engage à effectuer mon paiement sous 10 jours, sinon ma commande sera annulée ». Rien n’est encaissé en ligne et aucune donnée bancaire n’est saisie : le client règle ensuite par le moyen choisi.
8. **Confirmation, emails et historique** : à l’enregistrement de la commande, une confirmation s’affiche et un **email de confirmation de commande** est envoyé automatiquement. Quand l’administrateur enregistre la réception du paiement, un **email de réception du paiement** est envoyé au client. Le client consulte ses commandes passées et leur statut.
9. **Gestion du catalogue** : un administrateur peut ajouter, modifier un arbre et changer son état de disponibilité. Un arbre déjà commandé n’est jamais supprimé : il passe à l’état *retiré du catalogue*.
10. **Gestion des comptes clients** : un administrateur peut consulter et gérer les comptes clients. Les droits et actions d’administration sont réservés à ce rôle.
11. **Suivi des commandes** : un administrateur consulte les commandes et change leur statut : *payée* à réception du paiement, *plantée*, ou *annulée* si le paiement n’est pas arrivé sous 10 jours.

#### Parcours principal du MVP

1. Le visiteur découvre Je s’appelle Graine, parcourt le catalogue et filtre les arbres par catégorie.
2. Il consulte la fiche d’un arbre, choisit la quantité souhaitée et clique sur « Ajouter au panier ».
3. S’il n’est pas connecté, le système lui demande de créer un compte ou de se connecter avant d’ajouter l’arbre.
4. Une fois connecté, le client ajoute l’arbre au panier dans la quantité choisie, consulte son contenu et peut ajuster les quantités ou retirer des articles.
5. Il vérifie le récapitulatif, passe à la page de paiement, choisit son mode de paiement, coche l’engagement de payer sous 10 jours et confirme la commande.
6. Le système enregistre la commande (en attente de paiement), affiche une confirmation et envoie un email de confirmation.
7. À réception du paiement, l’administrateur passe la commande à *payée* et le client reçoit un email. Sans paiement sous 10 jours, la commande est annulée.
8. Le client retrouve sa commande et son statut dans son historique.

Un arbre épuisé ou retiré du catalogue ne peut pas faire l’objet d’une nouvelle commande. Le prix payé est enregistré dans la commande ; le nom et le lieu de plantation sont lus dans l’arbre, qui n’est jamais supprimé une fois commandé : l’historique reste lisible.

### Évolutions potentielles

Ces fonctionnalités sont envisagées, mais ne sont pas nécessaires pour que le MVP soit utilisable :

- Paiement réel en ligne (carte, PayPal) sécurisé par un prestataire tel que Stripe.
- Annulation automatique des commandes non payées après 10 jours (tâche planifiée), au lieu d’une annulation par l’administrateur.
- Page des associations partenaires, newsletter et formulaire de contact.
- Sélection des arbres mis en avant par l’administrateur.
- Carte interactive permettant de visualiser les lieux de plantation des arbres achetés.
- Back-office étendu pour administrer les profils utilisateurs, les arbres et le suivi des commandes.
- Espace partenaire permettant aux associations de proposer des arbres ou des lots, avec validation par Je s’appelle Graine.
- Version anglaise en complément du français..

## 4\. Architecture et technologies

### Architecture proposée

L’application comprend un front-end, un back-end et une base de données, hébergés ensemble sur un **VPS** (serveur privé virtuel loué), chacun dans un conteneur Docker. Le front-end présente le site et envoie les demandes au back-end. Le back-end applique les règles de Je s’appelle Graine, lit ou enregistre les données dans la base et envoie les emails.

```
Visiteur dans son navigateur
        │ HTTPS (un seul nom de domaine)
        ▼
VPS — conteneurs Docker (Docker Compose)
  ├── Serveur web (HTTPS) : envoie /api/... à l’API, le reste au front-end
  ├── FRONT-END : Next.js / React
  ├── BACK-END : API REST Je s’appelle Graine
  │       │ réseau Docker interne
  │       ▼
  └── BASE DE DONNÉES : PostgreSQL (volume de données sauvegardé)

BACK-END ──SMTP──▶ Service d’envoi d’emails ──▶ boîte mail du client
```

&nbsp;

- **Front-end — Next.js et React, dans un conteneur sur le VPS :** affiche les pages publiques, le catalogue, le panier, les pages client et les pages d’administration. Il envoie les demandes de lecture ou de modification à **l’API REST Je s’appelle Graine**.
- **Back-end — API REST Je s’appelle Graine avec Node.js et Express :** reçoit les requêtes du front-end, valide les données, vérifie les droits, applique les règles métier et renvoie des réponses JSON. L’API est exécutée dans un conteneur Docker, en développement comme sur le VPS.
- **Services métier :** modules du back-end qui appliquent les règles du projet. Par exemple, le service d’authentification vérifie les identifiants et gère les sessions ; le service de commande vérifie la disponibilité des arbres et l’engagement de paiement avant d’enregistrer une commande, puis demande l’envoi de l’email de confirmation.
- **Envoi d’emails :** l’API envoie les emails automatiques (confirmation de commande, réception du paiement) en se connectant à un serveur d’envoi (SMTP) ; prestataire et bibliothèque à choisir (ex. Nodemailer côté Node.js).
- **DataMappers :** modules utilisés par les services métier pour accéder aux données. Ils isolent les requêtes SQL paramétrées du reste du back-end. Le DataMapper est l’option privilégiée ; un ORM tel que Sequelize reste une alternative \- **A valider avec l'équipe \!\!\!**
- **Base de données — PostgreSQL :** conserve les comptes, les offres d’arbres, les paniers et les commandes. PostgreSQL tourne dans un conteneur Docker, en local pendant le développement et sur le VPS. Sur le VPS, les données sont conservées dans un volume Docker et sauvegardées régulièrement. Seul le back-end se connecte à la base, par le réseau Docker interne ; la base n’est pas exposée sur Internet et ses identifiants ne sont pas exposés au navigateur ni au front-end.
- **Docker :** Docker Compose lance les mêmes conteneurs (front-end, API, PostgreSQL) en développement et sur le VPS, avec une configuration reproductible.

Dans cette architecture, les endpoints REST sont fournis par le back-end. Ce sont des routes de l’API Je s’appelle Graine, pas des Route Handlers Next.js. Le front-end et l’API sont servis sous le même nom de domaine (l’API sous `/api`), ce qui évite de partager le cookie de session entre deux domaines.

### Justification des choix

- **Next.js et React** sont retenus pour construire l’interface à partir de composants réutilisables et organiser les pages du site. Le rendu côté serveur peut être utilisé pour les pages publiques, comme le catalogue, tandis que les composants interactifs répondent aux besoins du panier et des filtres.
- **Une API REST distincte** sépare l’interface, les règles métier et l’accès aux données. Elle échange des données au format JSON avec le front-end et pourra être réutilisée par un autre client si le projet en a besoin.
- **Node.js et Express** sont retenus pour développer l’API REST en JavaScript, comme le front-end. Express fournit le routage et les middlewares nécessaires au traitement des requêtes HTTP. L’organisation du back-end séparera les routes, les contrôleurs, les services métier et les DataMappers.
- **PostgreSQL** est retenu pour stocker les données structurées et liées du projet, notamment les comptes, les arbres, les paniers et les commandes. Ses clés et contraintes permettent de garantir la cohérence des relations entre ces données.
- **Le DataMapper** est l’option privilégiée pour isoler les requêtes SQL paramétrées dans des modules dédiés et distinguer l’accès aux données des règles métier. Le recours à un ORM comme Sequelize reste à valider par l’équipe.
- **Docker** conteneurise le front-end, l’API et PostgreSQL : l’application s’exécute de la même façon sur les postes de développement et sur le VPS.
- **Husky** est retenu pour automatiser les vérifications définies par l’équipe avant les commits et détecter plus tôt les erreurs courantes. Les commandes associées seront documentées et maintenues rapides.
- **HTTPS et JSON** sont retenus pour les échanges entre le front-end et l’API : HTTPS protège les données pendant leur transmission et JSON sert de format commun aux requêtes et réponses de l’API.
- **Un VPS** est retenu pour héberger toute l’application : un seul serveur à administrer, le même environnement Docker qu’en développement, et le front-end et l’API sur le même domaine. En contrepartie, l’équipe gère elle-même les mises à jour, la sécurité (pare-feu, certificat HTTPS) et les sauvegardes de la base.
- **Un service d’envoi d’emails (SMTP)** est nécessaire pour que les emails automatiques arrivent bien dans la boîte de réception des clients, et non dans les indésirables. Le prestataire reste à choisir.

### Technologies retenues ou à confirmer

| Composant                       | Choix proposé                                                                | État                                                                                                        |
| :------------------------------ | :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| Site web                        | Next.js, React                                                               | Choix retenu                                                                                                |
| Hébergement                     | VPS : front-end, API et base de données                                      | Choix retenu ; fournisseur à choisir                                                                        |
| API                             | Node.js et Express ; API REST                                                | Choix retenu                                                                                                |
| Base de données                 | PostgreSQL dans un conteneur Docker (développement et VPS)                   | Choix retenu ; sauvegardes à mettre en place                                                                |
| Envoi d’emails                  | Serveur SMTP d’un prestataire, Nodemailer côté API                           | À choisir                                                                                                   |
| Accès aux données               | DataMappers avec requêtes paramétrées                                        | Option privilégiée et à valider                                                                             |
| Conteneurisation                | Docker et Docker Compose                                                     | Front-end, API et PostgreSQL conteneurisés, en développement et sur le VPS                                  |
| Versionnement                   | Git et GitHub                                                                | Suivre les modifications et faciliter le travail en équipe                                                  |
| Hooks Git                       | Husky                                                                        | Lancer automatiquement les vérifications prévues avant les commits ; commandes à définir                    |
| Protocole navigateur ↔ API      | HTTPS avec réponses JSON                                                     | Certificat HTTPS à mettre en place sur le VPS                                                               |

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
├── Récapitulatif de commande
├── Paiement (choix du mode et engagement de payer sous 10 jours)
├── Confirmation de commande
└── Mes commandes
    └── Détail d’une commande

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

| Méthode | Route                           | Fonction                                                         | Accès                       |
| :------ | :------------------------------ | :--------------------------------------------------------------- | :-------------------------- |
| GET     | `/`                             | Présenter Je s’appelle Graine et les arbres mis en avant                  | Public                      |
| GET     | `/qui-sommes-nous`              | Présenter Je s’appelle Graine et sa mission                               | Public                      |
| GET     | `/arbres`                       | Afficher les arbres disponibles ou épuisés                       | Public                      |
| GET     | `/arbres?categorie=:categorie`  | Filtrer les arbres par catégorie                                 | Public                      |
| GET     | `/arbres/:id`                   | Afficher la fiche d’un arbre, son prix et son lieu de plantation | Public                      |
| GET     | `/panier`                       | Consulter le panier et modifier les articles                     | Client connecté             |
| GET     | `/inscription`                  | Afficher le formulaire d’inscription                             | Public                      |
| GET     | `/connexion`                    | Afficher le formulaire de connexion                              | Public                      |
| GET     | `/mentions-legales`             | Consulter les mentions légales                                   | Public                      |
| GET     | `/politique-de-confidentialite` | Consulter la politique de confidentialité                        | Public                      |
| GET     | `/compte`                       | Consulter et gérer les informations du compte                    | Client connecté             |
| GET     | `/commande`                     | Afficher le récapitulatif avant le paiement                      | Client connecté             |
| GET     | `/commande/paiement`            | Choisir le mode de paiement et cocher l’engagement (10 jours)    | Client connecté             |
| GET     | `/commande/confirmation`        | Afficher la confirmation de la commande                          | Client connecté             |
| GET     | `/commandes`                    | Afficher les commandes du client connecté                        | Client connecté             |
| GET     | `/commandes/:id`                | Afficher le détail d’une commande                                | Propriétaire de la commande |
| GET     | `/admin/arbres`                 | Gérer le catalogue                                               | Administrateur              |
| GET     | `/admin/arbres/nouveau`         | Afficher le formulaire d’ajout d’un arbre                        | Administrateur              |
| GET     | `/admin/arbres/:id/modifier`    | Afficher le formulaire de modification                           | Administrateur              |
| GET     | `/admin/comptes`                | Afficher la liste des comptes clients                            | Administrateur              |
| GET     | `/admin/comptes/:id`            | Consulter un compte client                                       | Administrateur              |
| GET     | `/admin/comptes/:id/modifier`   | Gérer l’état d’un compte client                                  | Administrateur              |
| GET     | `/admin/commandes`              | Afficher toutes les commandes et leur statut                     | Administrateur              |
| GET     | `/admin/commandes/:id`          | Consulter une commande et changer son statut                     | Administrateur              |

&nbsp;

Les formulaires d’inscription, de connexion, de gestion du compte, de commande et d’administration transmettent leurs données à l’API REST. Le panier est accessible aux clients connectés. Lorsqu’un visiteur clique sur « Ajouter au panier », il doit d’abord créer un compte ou se connecter ; l’arbre est ajouté après cette étape.

### Endpoints de l’API REST

| Méthode | Endpoint                            | Fonction                                                  | Accès                       |
| :------ | :---------------------------------- | :-------------------------------------------------------- | :-------------------------- |
| GET     | `/api/trees`                       | Lister les arbres disponibles ou épuisés                  | Public                      |
| GET     | `/api/trees?category=:category`  | Filtrer ces arbres par catégorie                          | Public                      |
| GET     | `/api/trees/:id`                   | Consulter le détail d’un arbre (sauf retiré du catalogue) | Public                      |
| POST    | `/api/users`                 | Créer un compte client                                    | Public                      |
| POST    | `/api/sessions`                     | Vérifier les identifiants et ouvrir une session           | Public                      |
| DELETE  | `/api/sessions/current`             | Fermer la session du client                               | Client connecté             |
| GET     | `/api/users/me`              | Consulter les informations du compte connecté             | Client connecté             |
| PATCH   | `/api/users/me`              | Modifier les informations du compte connecté              | Client connecté             |
| PATCH   | `/api/users/me/password` | Modifier le mot de passe du compte connecté               | Client connecté             |
| DELETE  | `/api/users/me`              | Supprimer le compte du client connecté                    | Client connecté             |
| GET     | `/api/cart`                       | Consulter le panier du client connecté                    | Client connecté             |
| POST    | `/api/cart/items`              | Ajouter un arbre au panier avec la quantité choisie       | Client connecté             |
| PATCH   | `/api/cart/items/:id`          | Modifier la quantité d’un article du panier               | Client connecté             |
| DELETE  | `/api/cart/items/:id`          | Retirer un article du panier                              | Client connecté             |
| POST    | `/api/orders`                    | Créer la commande (mode de paiement + engagement 10 jours) et envoyer l’email de confirmation | Client connecté |
| GET     | `/api/orders`                    | Lister les commandes du client connecté                   | Client connecté             |
| GET     | `/api/orders/:id`                | Consulter une commande                                    | Propriétaire de la commande ou administrateur |
| GET     | `/api/admin/orders`              | Lister toutes les commandes (filtrables par statut)       | Administrateur              |
| PATCH   | `/api/admin/orders/:id/status`   | Changer le statut ; `paid` envoie l’email de réception du paiement | Administrateur     |
| POST    | `/api/trees`                       | Ajouter un arbre au catalogue                             | Administrateur              |
| PATCH   | `/api/trees/:id`                   | Modifier un arbre, dont son état de disponibilité         | Administrateur              |
| DELETE  | `/api/trees/:id`                   | Supprimer un arbre jamais commandé (sinon refus : le passer à « retiré ») | Administrateur  |
| GET     | `/api/availabilities`               | Lister les états de disponibilité (formulaire arbre)      | Administrateur              |
| GET     | `/api/users`                 | Lister les comptes clients                                | Administrateur              |
| GET     | `/api/users/:id`             | Consulter un compte client                                | Administrateur              |
| PATCH   | `/api/users/:id`             | Modifier l’état d’un compte client                        | Administrateur              |
| DELETE  | `/api/users/:id`             | Supprimer un compte client                                | Administrateur              |

&nbsp;

L’API répond en JSON. Les entrées sont validées côté serveur. Les endpoints privés contrôlent l’authentification et les droits, même si les pages du site masquent les actions non autorisées. L’authentification utilisera une session protégée par cookie `httpOnly` ; les détails de durée et de renouvellement de session restent à préciser. Le client ne peut consulter ou modifier que les informations de son propre compte. Après suppression du compte, sa session est invalidée. `POST /api/orders` refuse la commande si le mode de paiement n’est pas dans la liste prévue, si l’engagement de payer sous 10 jours n’est pas coché ou si un arbre du panier n’est pas disponible. Les commandes déjà passées sont conservées selon les règles de conservation définies pour le projet ; les données personnelles qui ne sont plus nécessaires devront être supprimées ou anonymisées.

## 9\. User stories

## Rôles

| Rôle         | Description                                                    |
| :----------- | :------------------------------------------------------------- |
| **Visiteur** | Personne non connectée qui découvre le site                    |
| **Client**   | Utilisateur inscrit et connecté qui achète des arbres          |
| **Admin**    | Membre de Je s’appelle Graine qui gère le catalogue et les utilisateurs |

&nbsp;

---

## Visiteur

| ID   | En tant que | Je veux                                                                                | Afin de                                                    | Priorité |
| :--- | :---------- | :------------------------------------------------------------------------------------- | :--------------------------------------------------------- | :------- |
| US01 | Visiteur    | voir une page d'accueil présentant Je s’appelle Graine et quelques arbres mis en avant          | comprendre la mission du site et avoir envie de participer | MVP      |
| US02 | Visiteur    | consulter le catalogue des arbres                                                      | voir tout ce qui est disponible à l'achat                  | MVP      |
| US03 | Visiteur    | filtrer le catalogue par catégorie (résineux, feuillage caduc, feuillage persistant)   | trouver rapidement le type d'arbre qui m'intéresse         | MVP      |
| US04 | Visiteur    | consulter la fiche détaillée d'un arbre (photo, description, prix, lieu de plantation) | décider en connaissance de cause avant d'acheter           | MVP      |
| US05 | Visiteur    | être invité à créer un compte ou à me connecter lorsque je clique sur « Ajouter au panier » | pouvoir ajouter l'arbre à mon panier et préparer ma commande | MVP      |
| US06 | Visiteur    | accéder au panier après avoir créé un compte ou m'être connecté                       | poursuivre ma commande                                      | MVP      |
| US07 | Visiteur    | créer un compte avec mon prénom, mon nom, mon email et mon mot de passe, choisir mon type de compte (particulier par défaut, association ou entreprise) et, si je choisis association ou entreprise, renseigner éventuellement le nom de ma structure | pouvoir acheter et suivre mes commandes avec un compte adapté à mon profil | MVP      |
| US08 | Visiteur    | consulter la page « Qui sommes-nous »                                                  | savoir qui est derrière Je s’appelle Graine et lui faire confiance  | MVP      |
| US09 | Visiteur    | consulter les mentions légales et la politique de confidentialité (RGPD)               | savoir comment mes données sont utilisées                  | MVP      |

&nbsp;

## Client

| ID   | En tant que | Je veux                                                                | Afin de                                                     | Priorité |
| :--- | :---------- | :--------------------------------------------------------------------- | :---------------------------------------------------------- | :------- |
| US10 | Client      | me connecter avec mon email et mon mot de passe                        | accéder à mon espace personnel                              | MVP      |
| US11 | Client      | me déconnecter                                                         | sécuriser mon compte sur un appareil partagé                | MVP      |
| US12 | Client      | voir le détail de mon panier (arbres, quantités, prix unitaire, total) | vérifier ma commande avant de confirmer la commande simulée | MVP      |
| US13 | Client      | modifier la quantité d'un arbre ou le retirer du panier                | ajuster ma commande                                         | MVP      |
| US13b | Client     | choisir la quantité d'un arbre sur sa fiche (1 par défaut) avant de l'ajouter au panier | acheter plusieurs arbres identiques en une seule fois       | MVP      |
| US14 | Client      | choisir mon mode de paiement (virement, carte, chèque, PayPal) et m’engager à payer sous 10 jours avant de confirmer ma commande | passer commande et régler par le moyen qui me convient | MVP      |
| US15 | Client      | recevoir un email de confirmation après ma commande                    | être sûr que ma commande a bien été prise en compte         | MVP      |
| US15b | Client     | recevoir un email quand mon paiement a été reçu                        | savoir que ma commande est validée                          | MVP      |
| US16 | Client      | consulter l'historique de mes commandes                                | retrouver mes achats passés                                 | MVP      |
| US17 | Client      | modifier mes informations personnelles (nom, adresse, email)           | garder un compte à jour                                     | MVP      |
| US18 | Client      | changer mon mot de passe                                               | sécuriser mon compte                                        | MVP      |
| US19 | Client      | supprimer mon compte                                                   | exercer mon droit à l'effacement (RGPD)                     | MVP      |

&nbsp;

## Admin

| ID   | En tant que | Je veux                                                                        | Afin de                                    | Priorité |
| :--- | :---------- | :----------------------------------------------------------------------------- | :----------------------------------------- | :------- |
| US20 | Admin       | me connecter à un espace d'administration protégé                              | être le seul à pouvoir gérer le site       | MVP      |
| US21 | Admin       | ajouter un arbre au catalogue (nom, catégorie, description, prix, image, lieu) | proposer de nouveaux arbres à la vente     | MVP      |
| US22 | Admin       | modifier un arbre existant                                                     | corriger ou mettre à jour ses informations | MVP      |
| US23 | Admin       | supprimer un arbre jamais commandé                                             | nettoyer le catalogue                      | MVP      |
| US23b | Admin      | changer la disponibilité d’un arbre (disponible, épuisé, retiré du catalogue)  | ne proposer à la vente que les arbres commandables, sans perdre l’historique | MVP      |
| US24 | Admin       | consulter et gérer la liste des utilisateurs                                   | modérer et assister les clients            | MVP      |
| US25 | Admin       | consulter les commandes et changer leur statut (payée à réception du paiement, plantée, annulée si non payée sous 10 jours) | suivre les paiements et tenir les clients informés | MVP      |

&nbsp;

## 10\. Risques et mesures de prévention

| Risque                                                                                                    | Conséquence possible                                                               | Mesure de prévention                                                                                                                        |
| :-------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| L’obligation de créer un compte ou de se connecter avant l’ajout au panier freine certains visiteurs | Abandon du parcours d’achat | Expliquer clairement pourquoi un compte est requis et rendre l’inscription et la connexion simples. |
| Un utilisateur consulte la commande d’un autre                                                            | Atteinte à la confidentialité                                                      | Vérifier côté API l’identité et le propriétaire de chaque commande.                                                                         |
| Suppression d’un compte entraînant la perte de données nécessaires ou la conservation de données inutiles | Historique de commande incomplet ou données personnelles conservées sans nécessité | Définir les règles de conservation et anonymiser les données personnelles qui ne sont plus nécessaires.                                     |
| Un arbre est modifié ou retiré après une commande                                                         | L’historique ne correspond plus à l’achat enregistré                               | Enregistrer le prix payé dans la commande ; ne jamais supprimer un arbre déjà commandé (état « retiré du catalogue »). Le nom et le lieu affichés dans l’historique sont ceux de l’arbre au moment de la consultation. |
| Le VPS tombe en panne, est mal sécurisé ou perd ses données                                               | Site indisponible, données perdues ou compromises                                  | Sauvegarder automatiquement la base hors du VPS, activer un pare-feu, appliquer les mises à jour de sécurité et servir le site en HTTPS. |
| La base locale et la base du VPS divergent                                                                | Comportements différents entre le développement et la production                   | Utiliser la même image PostgreSQL dans Docker Compose et appliquer les mêmes scripts SQL aux deux bases.                                   |
| Les emails automatiques n’arrivent pas ou sont classés comme indésirables                                 | Le client ne reçoit ni confirmation ni avis de paiement                            | Passer par un prestataire d’envoi reconnu, configurer le nom de domaine pour l’envoi d’emails, et garder la commande et son statut visibles dans l’espace client. |
| Des commandes restent impayées                                                                            | Arbres réservés sans paiement, suivi confus                                         | Engagement obligatoire de payer sous 10 jours, date limite visible, annulation par l’administrateur passé ce délai.                         |
| Les identifiants de connexion sont interceptés ou mal stockés                                             | Compromission des comptes                                                          | Utiliser HTTPS, hacher les mots de passe côté serveur et protéger les sessions par cookie `httpOnly`.                                       |
| Les images sont trop lourdes                                                                              | Pages lentes et consommation réseau excessive                                      | Redimensionner et compresser les images avant leur publication.                                                                             |
| Les tâches sont mal réparties                                                                             | Retards, oublis ou travail en double                                               | Désigner un responsable par fonctionnalité et signaler rapidement les blocages.                                                             |

&nbsp;

## 11\. Rôles de l’équipe


| Rôle | Responsable | Responsabilités principales |
| :--- | :--- | :--- |
| Product Owner | Shanna | Définit et priorise les besoins du produit. Tranche les questions liées au périmètre fonctionnel, aux objectifs et aux priorités de Je s’appelle Graine. |
| Scrum Master | Fabrice | Organise le fonctionnement de l’équipe et facilite sa collaboration. Tranche les questions d’organisation, aide à résoudre les blocages et veille au respect des pratiques de travail convenues. |
| Lead devs | Loic (Front) <br> Dimitry (Back) | Encadrent les décisions techniques et la cohérence de l’architecture. Tranchent les questions liées aux choix techniques, à l’organisation du code et aux pratiques de développement. |

&nbsp;
