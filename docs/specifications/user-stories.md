# Je s’appelle Graine — User Stories

> Format : **En tant que** _rôle_, **je veux** _action_, **afin de** _bénéfice_.
> Priorité : **MVP** = indispensable pour que le produit fonctionne ; **Évo** = évolution potentielle.

## Rôles

| Rôle | Description |
|---|---|
| **Visiteur** | Personne non connectée qui découvre le site |
| **Client** | Utilisateur inscrit et connecté qui achète des arbres |
| **Admin** | Membre de Je s’appelle Graine qui gère le catalogue et les utilisateurs |
| **Partenaire** (Évo) | Association tierce qui propose ses propres lots d'arbres |

---

## Visiteur

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| US01 | Visiteur | voir une page d'accueil présentant Je s’appelle Graine et quelques arbres mis en avant | comprendre la mission du site et avoir envie de participer | MVP |
| US02 | Visiteur | consulter le catalogue des arbres | voir tout ce qui est disponible à l'achat | MVP |
| US03 | Visiteur | filtrer le catalogue par catégorie (résineux, feuillage caduc, feuillage persistant) | trouver rapidement le type d'arbre qui m'intéresse | MVP |
| US04 | Visiteur | consulter la fiche détaillée d'un arbre (photo, description, prix, lieu de plantation) | décider en connaissance de cause avant d'acheter | MVP |
| US05 | Visiteur | être redirigé vers l'inscription/connexion quand je clique sur « Ajouter au panier » | comprendre qu'un compte est nécessaire pour remplir un panier | MVP |
| US06 | Visiteur | revenir automatiquement sur la fiche de l'arbre après mon inscription/connexion | reprendre mon achat là où je l'avais laissé | Évo |
| US07 | Visiteur | créer un compte avec mon prénom, mon nom, mon email et mon mot de passe, choisir mon type de compte (particulier par défaut, association ou entreprise) et, si je choisis association ou entreprise, renseigner éventuellement le nom de ma structure | pouvoir acheter et suivre mes commandes avec un compte adapté à mon profil | MVP |
| US08 | Visiteur | consulter la page « Qui sommes-nous » | savoir qui est derrière Je s’appelle Graine et lui faire confiance | MVP |
| US09 | Visiteur | consulter les mentions légales et la politique de confidentialité (RGPD) | savoir comment mes données sont utilisées | MVP |
| US10 | Visiteur | voir les partenaires / associations soutenues | connaître les projets que je peux financer | Évo |
| US11 | Visiteur | m'abonner à la newsletter | être informé des nouvelles campagnes de plantation | Évo |
| US12 | Visiteur | envoyer un message via un formulaire de contact | poser une question à Je s’appelle Graine | Évo |
| US13 | Visiteur | choisir la langue du site (FR / EN) | naviguer dans ma langue | Évo |

## Client

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| US20 | Client | me connecter avec mon email et mon mot de passe | accéder à mon espace personnel | MVP |
| US21 | Client | me déconnecter | sécuriser mon compte sur un appareil partagé | MVP |
| US22 | Client | voir le détail de mon panier (arbres, quantités, prix unitaire, total) | vérifier ma commande avant de payer | MVP |
| US23 | Client | modifier la quantité d'un arbre ou le retirer du panier | ajuster ma commande | MVP |
| US23b | Client | choisir la quantité d'un arbre sur sa fiche (1 par défaut) avant de l'ajouter au panier | acheter plusieurs arbres identiques en une seule fois | MVP |
| US24 | Client | choisir mon mode de paiement (virement, carte, chèque, PayPal) et m'engager à payer sous 10 jours avant de confirmer ma commande | passer commande et régler par le moyen qui me convient | MVP |
| US25 | Client | recevoir un email de confirmation après ma commande | être sûr que ma commande a bien été prise en compte | MVP |
| US25b | Client | recevoir un email quand mon paiement a été reçu | savoir que ma commande est validée | MVP |
| US26 | Client | consulter l'historique de mes commandes | retrouver mes achats passés | MVP |
| US27 | Client | suivre le statut d'une commande (validée, arbre planté...) | savoir où en est la plantation de mes arbres | Évo  |
| US28 | Client | modifier mes informations personnelles (nom, adresse, email) | garder un compte à jour | MVP |
| US29 | Client | changer mon mot de passe | sécuriser mon compte | MVP |
| US30 | Client | supprimer mon compte | exercer mon droit à l'effacement (RGPD) | MVP |
| US31 | Client | choisir si j'achète un arbre proposé par Je s’appelle Graine ou par une association tierce | soutenir le projet qui me tient à cœur | Évo |
| US32 | Client | payer réellement par carte via un service sécurisé (Stripe) | acheter en toute sécurité | Évo |
| US33 | Client | voir sur une carte interactive où mes arbres ont été plantés | visualiser concrètement mon impact | Évo |
| US34 | Client | parrainer un ami ou une entreprise | les inciter à planter à leur tour | Évo |
| US35 | Client | gagner des badges selon mes contributions | être récompensé de mon engagement | Évo |
| US36 | Client | être notifié des événements (arbre planté, anniversaire d'un arbre, campagne) | rester impliqué dans le suivi | Évo |

## Admin

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| US40 | Admin | me connecter à un espace d'administration protégé | être le seul à pouvoir gérer le site | MVP |
| US41 | Admin | ajouter un arbre au catalogue (nom, catégorie, description, prix, image, lieu) | proposer de nouveaux arbres à la vente | MVP |
| US42 | Admin | modifier un arbre existant | corriger ou mettre à jour ses informations | MVP |
| US43 | Admin | supprimer un arbre jamais commandé | nettoyer le catalogue | MVP |
| US43b | Admin | changer la disponibilité d'un arbre (disponible, épuisé, retiré du catalogue) | ne proposer à la vente que les arbres commandables, sans perdre l'historique | MVP |
| US44 | Admin | choisir les arbres mis en avant sur la page d'accueil | valoriser certains arbres ou partenaires | Évo |
| US45 | Admin | consulter et gérer la liste des utilisateurs | modérer et assister les clients | MVP |
| US46 | Admin | consulter toutes les commandes et changer leur statut (payée à réception du paiement, plantée, annulée si non payée sous 10 jours) | suivre les paiements et tenir les clients informés | MVP |
| US47 | Admin | créer une campagne de plantation avec un objectif collectif | mobiliser la communauté sur un projet | Évo |

## Partenaire (Évo)

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| US50 | Partenaire | proposer un lot d'arbres à planter | financer mon propre projet de reforestation | Évo |
| US51 | Partenaire | suivre les ventes de mes lots | mesurer le soutien reçu | Évo |

---

## Points à trancher en équipe

- ~~**Panier visiteur** (US05) : stocké où tant que la personne n'est pas connectée ?~~ **Tranché le 2026-10-20** : pas de panier visiteur, le clic sur « Ajouter au panier » redirige vers l'inscription.
- ~~**« Gestion carte bleue »** (wireframe) : stocker une carte implique des obligations fortes (PCI-DSS).~~ **Tranché le 2026-10-21** : page de paiement avec choix du mode (virement, carte, chèque, PayPal) et engagement de payer sous 10 jours ; rien n'est encaissé en ligne. En Évo, c'est Stripe qui garde les cartes, pas notre BDD.
- **Suivi de commande** (US27) : qui fait évoluer le statut ? **Le 2026-10-21**, US46 passe en MVP (l'admin change le statut à réception du paiement) → US27 (le client suit le statut) peut aussi passer en MVP : à trancher.
