# Cahier des charges — GreenRoots V1

**Date :** 2026-10-19  
**Statut :** proposition de cadrage **à valider par l’équipe**

## 1\. Présentation du projet

GreenRoots est une plateforme e-commerce qui permet de contribuer à la reforestation en achetant des arbres à planter. Le site présente la mission de GreenRoots, les arbres proposés et les informations disponibles sur chaque offre. Un client peut passer une commande\* et la retrouver dans son espace personnel.

La plateforme vise à réunir dans un même service la présentation du projet, la découverte des arbres, la gestion du catalogue et le suivi des commandes. À terme, GreenRoots pourra aussi accueillir des offres proposées par des associations partenaires.

\*La première version n’encaisse aucun paiement et ne collecte aucune donnée bancaire. Elle doit néanmoins permettre de parcourir un parcours d’achat complet avec une confirmation et une commande enregistrée.

## 2\. Besoins et objectifs

### Besoins

- Les visiteurs qui souhaitent soutenir la reforestation ont besoin de comprendre la démarche de GreenRoots et de découvrir les arbres proposés.
- Les visiteurs ont besoin d’informations suffisamment claires pour choisir un arbre avant de passer une commande.
- Les clients ont besoin de retrouver les commandes qu’ils ont passées sur la plateforme.
- L’administrateur a besoin d’ajouter, de modifier et de retirer les offres d’arbres sans intervenir directement dans la base de données.
- L' administrateur doit pouvoir gérer le catalogue sans donner ces droits aux clients.

### Objectifs

- Présenter GreenRoots et sa mission dès la page d’accueil.
- Permettre la consultation du catalogue et des fiches détaillées des arbres.
- Proposer la création d’un compte et l’authentification des clients.
- Enregistrer une commande pour un client connect (sans paiement réel).
- Permettre à chaque client de consulter uniquement son propre historique de commandes.
- Permettre aux administrateurs GreenRoots de gérer les offres du catalogue depuis des pages protégées par authentification.
- Concevoir une application utilisable sur mobile et ordinateur et pouvant évoluer vers un paiement réel et des partenaires.

## 3\. Fonctionnalités

### MVP — première version fonctionnelle

Le MVP couvre le parcours d’achat, les fonctions essentielles du compte et l’administration du catalogue et des comptes :

1. **Accueil** : présenter GreenRoots et mettre en avant quelques arbres.
2. **Pages de présentation et d’information** : proposer les pages « Qui sommes-nous », mentions légales et politique de confidentialité.
3. **Catalogue** : afficher les arbres disponibles et filtrer par catégorie (résineux, feuillage caduc, feuillage persistant).
4. **Fiche arbre** : présenter la photo, la description, le prix et le lieu de plantation lorsqu’il est renseigné.
5. **Panier** : un utilisateur doit créer un compte ou se connecter avant d’ajouter un arbre au panier. Le client connecté peut consulter le panier, voir les quantités, les prix unitaires et le total, modifier les quantités et retirer des articles.
6. **Compte client** : inscription, connexion, déconnexion, consultation et modification des informations, changement de mot de passe et suppression du compte.
7. **Commande** : le client connecté poursuit depuis son panier et confirme sa commande (sans encaissement ni saisie de données bancaires).
8. **Confirmation et historique** : confirmer l’enregistrement de la commande et permettre au client de consulter ses commandes passées.
9. **Gestion du catalogue** : un administrateur peut ajouter, modifier et retirer du catalogue un arbre.
10. **Gestion des comptes clients** : un administrateur peut consulter et gérer les comptes clients. Les droits et actions d’administration sont réservés à ce rôle.

#### Parcours principal du MVP

1. Le visiteur découvre GreenRoots, parcourt le catalogue et filtre les arbres par catégorie.
2. Il consulte la fiche d’un arbre et clique sur « Ajouter au panier ».
3. S’il n’est pas connecté, le système lui demande de créer un compte ou de se connecter avant d’ajouter l’arbre.
4. Une fois connecté, le client ajoute l’arbre au panier, consulte son contenu et peut ajuster les quantités ou retirer des articles.
5. Il vérifie le récapitulatif et confirme la commande.
6. Le système enregistre la commande sans effectuer de paiement et affiche une confirmation.
7. Le client retrouve sa commande dans son historique.

Un arbre retiré du catalogue ne peut pas faire l’objet d’une nouvelle commande, mais les informations et le prix enregistrés au moment de l’achat restent visibles dans l’historique.

### Évolutions potentielles

Ces fonctionnalités sont envisagées, mais ne sont pas nécessaires pour que le MVP soit utilisable :

- Paiement réel sécurisé par un prestataire tel que Stripe.
- Page des associations partenaires, newsletter et formulaire de contact.
- Sélection des arbres mis en avant par l’administrateur.
- Carte interactive permettant de visualiser les lieux de plantation des arbres achetés.
- Back-office étendu pour administrer les profils utilisateurs, les arbres et le suivi des commandes.
- Espace partenaire permettant aux associations de proposer des arbres ou des lots, avec validation par GreenRoots.
- Version anglaise en complément du français..

## 4\. Architecture et technologies

### Architecture proposée

L’application comprend un front-end, un back-end et une base de données, hébergés sur trois services distincts. Le front-end présente le site et envoie les demandes au back-end. Le back-end applique les règles de GreenRoots et lit ou enregistre les données dans la base.

```
Visiteur dans son navigateur
        │ charge les pages du site via HTTPS
        ▼
FRONT-END : Next.js / React
Hébergement : Vercel
        │ envoie et reçoit des données via l’API REST (HTTPS / JSON)
        ▼
BACK-END : API REST GreenRoots
Hébergement : serveur personnel de Dimitry
        │ lit et enregistre les données via une connexion PostgreSQL sécurisée
        ▼
BASE DE DONNÉES : PostgreSQL
Hébergement : Neon
```

&nbsp;

- **Front-end — Next.js et React, déployé sur Vercel :** affiche les pages publiques, le catalogue, le panier, les pages client et les pages d’administration. Il envoie les demandes de lecture ou de modification à **l’API REST GreenRoots**.
- **Back-end — API REST GreenRoots avec Node.js et Express :** reçoit les requêtes du front-end, valide les données, vérifie les droits, applique les règles métier et renvoie des réponses JSON. L’API sera exécutée dans un conteneur Docker en développement et déployée sur le serveur personnel de Dimitry.
- **Services métier :** modules du back-end qui appliquent les règles du projet. Par exemple, le service d’authentification vérifie les identifiants et gère les sessions ; le service de commande vérifie la disponibilité des arbres avant d’enregistrer une commande.
- **DataMappers :** modules utilisés par les services métier pour accéder aux données. Ils isolent les requêtes SQL paramétrées du reste du back-end. Le DataMapper est l’option privilégiée ; un ORM tel que Sequelize reste une alternative \- **A valider avec l'équipe \!\!\!**
- **Base de données — PostgreSQL :** conserve les comptes, les offres d’arbres, les paniers et les commandes. Pendant le développement, PostgreSQL tourne dans un conteneur Docker local. Pour l’environnement distant, PostgreSQL sera hébergée chez Neon. Seul le back-end se connecte à la base ; les identifiants de connexion ne sont pas exposés au navigateur ni au front-end.
- **Docker :** utilisé pendant le développement pour lancer l’API et une base PostgreSQL locale avec une configuration reproductible via Docker Compose. Sur le serveur de Dimitry, seul le conteneur de l’API sera déployé ; il se connectera à la base distante chez Neon. PostgreSQL locale reste réservée au développement.

Dans cette architecture, les endpoints REST sont fournis par le back-end hébergé sur le serveur de Dimitry. Ce sont des routes de l’API GreenRoots, pas des Route Handlers Next.js. Le front-end déployé sur Vercel communique avec l’API via HTTPS.

### Justification des choix

- **Next.js et React** sont retenus pour construire l’interface à partir de composants réutilisables et organiser les pages du site. Le rendu côté serveur peut être utilisé pour les pages publiques, comme le catalogue, tandis que les composants interactifs répondent aux besoins du panier et des filtres.
- **Vercel** est retenu pour déployer le front-end Next.js. Le front-end et l’API étant hébergés séparément, leurs URL et leurs paramètres de communication seront configurés dans les variables d’environnement.
- **Une API REST distincte** sépare l’interface, les règles métier et l’accès aux données. Elle échange des données au format JSON avec le front-end et pourra être réutilisée par un autre client si le projet en a besoin.
- **Node.js et Express** sont retenus pour développer l’API REST en JavaScript, comme le front-end. Express fournit le routage et les middlewares nécessaires au traitement des requêtes HTTP. L’organisation du back-end séparera les routes, les contrôleurs, les services métier et les DataMappers.
- **PostgreSQL** est retenu pour stocker les données structurées et liées du projet, notamment les comptes, les arbres, les paniers et les commandes. Ses clés et contraintes permettent de garantir la cohérence des relations entre ces données.
- **Neon** est retenu pour héberger la base PostgreSQL de l’environnement distant. La base sera ainsi accessible au back-end sans exposer ses identifiants au navigateur. La connexion sera configurée avant la mise en service.
- **Le DataMapper** est l’option privilégiée pour isoler les requêtes SQL paramétrées dans des modules dédiés et distinguer l’accès aux données des règles métier. Le recours à un ORM comme Sequelize reste à valider par l’équipe.
- **Docker** est utilisé en développement pour lancer PostgreSQL dans un environnement reproductible. Il permet également de conteneuriser l’API pour harmoniser son exécution entre les postes de développement et le serveur.
- **Husky** est retenu pour automatiser les vérifications définies par l’équipe avant les commits et détecter plus tôt les erreurs courantes. Les commandes associées seront documentées et maintenues rapides.
- **HTTPS et JSON** sont retenus pour les échanges entre le front-end et l’API : HTTPS protège les données pendant leur transmission et JSON sert de format commun aux requêtes et réponses de l’API.
- **Le serveur personnel de Dimitry** a été choisi pour héberger l’API en raison de sa facilité de gestion et de maintenance pour le projet.

### Technologies retenues ou à confirmer

| Composant                       | Choix proposé                                                                | État                                                                                                        |
| :------------------------------ | :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| Site web                        | Next.js, React                                                               | Choix retenu (déploiement sur Vercel                                                                        |
| Hébergement du front-end        | Vercel                                                                       | Choix retenu                                                                                                |
| API                             | Node.js et Express ; API REST sur le serveur personnel de Dimitry            | Choix retenu                                                                                                |
| Base de données                 | PostgreSQL ; conteneur Docker en développement et Neon pour la base distante | Choix retenu                                                                                                |
| Accès aux données               | DataMappers avec requêtes paramétrées                                        | Option privilégiée et à valider                                                                             |
| Conteneurisation                | Docker, éventuellement Docker Compose                                        | API conteneurisée en développement et sur le serveur ; PostgreSQL conteneurisée en développement uniquement |
| Versionnement                   | Git et GitHub                                                                | Suivre les modifications et faciliter le travail en équipe                                                  |
| Hooks Git                       | Husky                                                                        | Lancer automatiquement les vérifications prévues avant les commits ; commandes à définir                    |
| Protocole entre Vercel et l’API | HTTPS avec réponses JSON                                                     | À mettre en place en environnement accessible depuis Internet                                               |

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
├── Confirmation de commande simulée
└── Mes commandes
    └── Détail d’une commande

Espace administrateur (accès réservé)
├── Liste des arbres
├── Ajouter un arbre
├── Modifier un arbre
├── Retirer un arbre du catalogue
└── Gestion des comptes clients
    ├── Consulter les comptes
    └── Modifier l’état ou supprimer un compte
```

&nbsp;

## 8\. Routes prévues

Les routes des pages web sont servies par le site Next.js. Les routes `/api/...` sont servies par l’API REST hébergée sur le serveur de Dimitry. Les méthodes HTTP indiquent l’action réalisée ; les routes API sont organisées autour des ressources.

### Routes des pages web

| Méthode | Route                           | Fonction                                                         | Accès                       |
| :------ | :------------------------------ | :--------------------------------------------------------------- | :-------------------------- |
| GET     | `/`                             | Présenter GreenRoots et les arbres mis en avant                  | Public                      |
| GET     | `/qui-sommes-nous`              | Présenter GreenRoots et sa mission                               | Public                      |
| GET     | `/arbres`                       | Afficher les arbres disponibles                                  | Public                      |
| GET     | `/arbres?categorie=:categorie`  | Filtrer les arbres par catégorie                                 | Public                      |
| GET     | `/arbres/:id`                   | Afficher la fiche d’un arbre, son prix et son lieu de plantation | Public                      |
| GET     | `/panier`                       | Consulter le panier et modifier les articles                     | Client connecté             |
| GET     | `/inscription`                  | Afficher le formulaire d’inscription                             | Public                      |
| GET     | `/connexion`                    | Afficher le formulaire de connexion                              | Public                      |
| GET     | `/mentions-legales`             | Consulter les mentions légales                                   | Public                      |
| GET     | `/politique-de-confidentialite` | Consulter la politique de confidentialité                        | Public                      |
| GET     | `/compte`                       | Consulter et gérer les informations du compte                    | Client connecté             |
| GET     | `/commande`                     | Afficher le récapitulatif avant confirmation                     | Client connecté             |
| GET     | `/commandes`                    | Afficher les commandes du client connecté                        | Client connecté             |
| GET     | `/commandes/:id`                | Afficher le détail d’une commande                                | Propriétaire de la commande |
| GET     | `/admin/arbres`                 | Gérer le catalogue                                               | Administrateur              |
| GET     | `/admin/arbres/nouveau`         | Afficher le formulaire d’ajout d’un arbre                        | Administrateur              |
| GET     | `/admin/arbres/:id/modifier`    | Afficher le formulaire de modification                           | Administrateur              |
| GET     | `/admin/comptes`                | Afficher la liste des comptes clients                            | Administrateur              |
| GET     | `/admin/comptes/:id`            | Consulter un compte client                                       | Administrateur              |
| GET     | `/admin/comptes/:id/modifier`   | Gérer l’état d’un compte client                                  | Administrateur              |

&nbsp;

Les formulaires d’inscription, de connexion, de gestion du compte, de commande et d’administration transmettent leurs données à l’API REST. Le panier est accessible aux clients connectés. Lorsqu’un visiteur clique sur « Ajouter au panier », il doit d’abord créer un compte ou se connecter ; l’arbre est ajouté après cette étape.

### Endpoints de l’API REST

| Méthode | Endpoint                            | Fonction                                                  | Accès                       |
| :------ | :---------------------------------- | :-------------------------------------------------------- | :-------------------------- |
| GET     | `/api/arbres`                       | Lister les arbres publiés                                 | Public                      |
| GET     | `/api/arbres?categorie=:categorie`  | Filtrer les arbres publiés par catégorie                  | Public                      |
| GET     | `/api/arbres/:id`                   | Consulter le détail d’un arbre publié                     | Public                      |
| POST    | `/api/utilisateurs`                 | Créer un compte client                                    | Public                      |
| POST    | `/api/sessions`                     | Vérifier les identifiants et ouvrir une session           | Public                      |
| DELETE  | `/api/sessions/current`             | Fermer la session du client                               | Client connecté             |
| GET     | `/api/utilisateurs/me`              | Consulter les informations du compte connecté             | Client connecté             |
| PATCH   | `/api/utilisateurs/me`              | Modifier les informations du compte connecté              | Client connecté             |
| PATCH   | `/api/utilisateurs/me/mot-de-passe` | Modifier le mot de passe du compte connecté               | Client connecté             |
| DELETE  | `/api/utilisateurs/me`              | Supprimer le compte du client connecté                    | Client connecté             |
| GET     | `/api/panier`                       | Consulter le panier du client connecté                    | Client connecté             |
| POST    | `/api/panier/articles`              | Ajouter un arbre au panier                                | Client connecté             |
| PATCH   | `/api/panier/articles/:id`          | Modifier la quantité d’un article du panier               | Client connecté             |
| DELETE  | `/api/panier/articles/:id`          | Retirer un article du panier                              | Client connecté             |
| POST    | `/api/commandes`                    | Créer une commande simulée                                | Client connecté             |
| GET     | `/api/commandes`                    | Lister les commandes du client connecté                   | Client connecté             |
| GET     | `/api/commandes/:id`                | Consulter une commande                                    | Propriétaire de la commande |
| POST    | `/api/arbres`                       | Ajouter un arbre au catalogue                             | Administrateur              |
| PATCH   | `/api/arbres/:id`                   | Modifier ou retirer du catalogue un arbre                 | Administrateur              |
| DELETE  | `/api/arbres/:id`                   | Retirer une offre sans effacer l’historique des commandes | Administrateur              |
| GET     | `/api/utilisateurs`                 | Lister les comptes clients                                | Administrateur              |
| GET     | `/api/utilisateurs/:id`             | Consulter un compte client                                | Administrateur              |
| PATCH   | `/api/utilisateurs/:id`             | Modifier l’état d’un compte client                        | Administrateur              |
| DELETE  | `/api/utilisateurs/:id`             | Supprimer un compte client                                | Administrateur              |

&nbsp;

L’API répond en JSON. Les entrées sont validées côté serveur. Les endpoints privés contrôlent l’authentification et les droits, même si les pages du site masquent les actions non autorisées. L’authentification utilisera une session protégée par cookie `httpOnly` ; les détails de durée et de renouvellement de session restent à préciser. Le client ne peut consulter ou modifier que les informations de son propre compte. Après suppression du compte, sa session est invalidée. Les commandes déjà passées sont conservées selon les règles de conservation définies pour le projet ; les données personnelles qui ne sont plus nécessaires devront être supprimées ou anonymisées.

## 9\. User stories

## Rôles

| Rôle         | Description                                                    |
| :----------- | :------------------------------------------------------------- |
| **Visiteur** | Personne non connectée qui découvre le site                    |
| **Client**   | Utilisateur inscrit et connecté qui achète des arbres          |
| **Admin**    | Membre de GreenRoots qui gère le catalogue et les utilisateurs |

&nbsp;

---

## Visiteur

| ID   | En tant que | Je veux                                                                                | Afin de                                                    | Priorité |
| :--- | :---------- | :------------------------------------------------------------------------------------- | :--------------------------------------------------------- | :------- |
| US01 | Visiteur    | voir une page d'accueil présentant GreenRoots et quelques arbres mis en avant          | comprendre la mission du site et avoir envie de participer | MVP      |
| US02 | Visiteur    | consulter le catalogue des arbres                                                      | voir tout ce qui est disponible à l'achat                  | MVP      |
| US03 | Visiteur    | filtrer le catalogue par catégorie (résineux, feuillage caduc, feuillage persistant)   | trouver rapidement le type d'arbre qui m'intéresse         | MVP      |
| US04 | Visiteur    | consulter la fiche détaillée d'un arbre (photo, description, prix, lieu de plantation) | décider en connaissance de cause avant d'acheter           | MVP      |
| US05 | Visiteur    | être invité à créer un compte ou à me connecter lorsque je clique sur « Ajouter au panier » | pouvoir ajouter l'arbre à mon panier et préparer ma commande | MVP      |
| US06 | Visiteur    | accéder au panier après avoir créé un compte ou m'être connecté                       | poursuivre ma commande                                      | MVP      |
| US07 | Visiteur    | créer un compte (email \+ mot de passe)                                                | pouvoir acheter et suivre mes commandes                    | MVP      |
| US08 | Visiteur    | consulter la page « Qui sommes-nous »                                                  | savoir qui est derrière GreenRoots et lui faire confiance  | MVP      |
| US09 | Visiteur    | consulter les mentions légales et la politique de confidentialité (RGPD)               | savoir comment mes données sont utilisées                  | MVP      |

&nbsp;

## Client

| ID   | En tant que | Je veux                                                                | Afin de                                                     | Priorité |
| :--- | :---------- | :--------------------------------------------------------------------- | :---------------------------------------------------------- | :------- |
| US10 | Client      | me connecter avec mon email et mon mot de passe                        | accéder à mon espace personnel                              | MVP      |
| US11 | Client      | me déconnecter                                                         | sécuriser mon compte sur un appareil partagé                | MVP      |
| US12 | Client      | voir le détail de mon panier (arbres, quantités, prix unitaire, total) | vérifier ma commande avant de confirmer la commande simulée | MVP      |
| US13 | Client      | modifier la quantité d'un arbre ou le retirer du panier                | ajuster ma commande                                         | MVP      |
| US14 | Client      | valider mon panier via un faux tunnel de commande                      | enregistrer ma commande sans effectuer de paiement réel     | MVP      |
| US15 | Client      | recevoir une confirmation après ma commande                            | être sûr que ma commande a bien été prise en compte         | MVP      |
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
| US23 | Admin       | supprimer un arbre du catalogue                                                | retirer un arbre qui n'est plus disponible | MVP      |
| US24 | Admin       | consulter et gérer la liste des utilisateurs                                   | modérer et assister les clients            | MVP      |

&nbsp;

## 10\. Risques et mesures de prévention

| Risque                                                                                                    | Conséquence possible                                                               | Mesure de prévention                                                                                                                        |
| :-------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| L’obligation de créer un compte ou de se connecter avant l’ajout au panier freine certains visiteurs | Abandon du parcours d’achat | Expliquer clairement pourquoi un compte est requis et rendre l’inscription et la connexion simples. |
| Un utilisateur consulte la commande d’un autre                                                            | Atteinte à la confidentialité                                                      | Vérifier côté API l’identité et le propriétaire de chaque commande.                                                                         |
| Suppression d’un compte entraînant la perte de données nécessaires ou la conservation de données inutiles | Historique de commande incomplet ou données personnelles conservées sans nécessité | Définir les règles de conservation et anonymiser les données personnelles qui ne sont plus nécessaires.                                     |
| Un arbre est modifié ou retiré après une commande                                                         | L’historique ne correspond plus à l’achat enregistré                               | Conserver dans la commande les informations et le montant associés au moment de sa création.                                                |
| Les échanges entre le front-end Vercel et l’API sont bloqués ou la session n’est pas transmise            | Le client ne peut pas se connecter ou utiliser son compte                          | Configurer les origines CORS et les cookies pour le domaine Vercel et le domaine de l’API, puis vérifier le parcours en conditions réelles. |
| La base locale Docker et la base Neon divergent                                                           | Comportements différents entre le développement et l’environnement distant         | Utiliser la même version majeure de PostgreSQL et appliquer les mêmes migrations aux deux bases.                                            |
| Les identifiants de connexion sont interceptés ou mal stockés                                             | Compromission des comptes                                                          | Utiliser HTTPS, hacher les mots de passe côté serveur et protéger les sessions par cookie `httpOnly`.                                       |
| Les images sont trop lourdes                                                                              | Pages lentes et consommation réseau excessive                                      | Redimensionner et compresser les images avant leur publication.                                                                             |
| Les tâches sont mal réparties                                                                             | Retards, oublis ou travail en double                                               | Désigner un responsable par fonctionnalité et signaler rapidement les blocages.                                                             |

&nbsp;

## 11\. Rôles de l’équipe

| Rôle                                      | Responsable | Responsabilités principales                                                                                                                                                                      |
| :---------------------------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product Owner                             | Shanna   | Définit et priorise les besoins du produit. Tranche les questions liées au périmètre fonctionnel, aux objectifs et aux priorités de GreenRoots.                                                  |
| Scrum Master                              | Fabrice  | Organise le fonctionnement de l’équipe et facilite sa collaboration. Tranche les questions d’organisation, aide à résoudre les blocages et veille au respect des pratiques de travail convenues. |
| Lead devs | Dimitry/Loic  | Encadrent les décisions techniques et la cohérence de l’architecture. Tranchent les questions liées aux choix techniques, à l’organisation du code et aux pratiques de développement.            |

&nbsp;
