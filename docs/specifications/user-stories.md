# Je s’appelle Graine — User Stories

> Format : **En tant que** _rôle_, **je veux** _action_, **afin de** _bénéfice_.
> Priorité : **MVP** = indispensable pour que le produit fonctionne ; **Évo** = évolution potentielle.

## Rôles

| Rôle | Description |
|---|---|
| **Visiteur** | Personne non connectée qui découvre le site |
| **Client** | Utilisateur inscrit et connecté qui achète des arbres |
| **Admin** | Membre de Je s’appelle Graine qui gère le catalogue, les commandes et les utilisateurs |
| **Administrateur des ventes** (Évo) | Membre de Je s’appelle Graine qui gère les commandes et le catalogue, sans accès aux comptes ni à la partie technique |
| **Partenaire** (Évo) | Association tierce qui propose ses propres lots d'arbres |

---

## Visiteur

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| US01 | Visiteur | voir une page d'accueil présentant Je s’appelle Graine et les 3 derniers arbres ajoutés au catalogue | comprendre la mission du site et avoir envie de participer | MVP |
| US02 | Visiteur | consulter le catalogue des arbres | voir tout ce qui est disponible à l'achat | MVP |
| US03 | Visiteur | filtrer le catalogue par catégorie (résineux, feuillage caduc, feuillage persistant) | trouver rapidement le type d'arbre qui m'intéresse | MVP |
| US03b | Visiteur | rechercher un arbre par son nom, même partiel et sans tenir compte des majuscules (ex. « chêne » trouve « Chêne pédonculé ») | trouver directement l'arbre que je cherche | MVP |
| US03c | Visiteur | combiner la recherche par nom et le filtre par catégorie | affiner ma recherche | MVP |
| US03d | Visiteur | voir un message clair quand aucun arbre ne correspond à ma recherche, avec un lien pour réafficher tout le catalogue | ne pas croire que le catalogue est vide | MVP |
| US03e | Visiteur | filtrer le catalogue par lieu de plantation | soutenir la reforestation d'une région qui me tient à cœur | Évo |
| US03f | Visiteur | filtrer le catalogue par fourchette de prix (minimum et maximum) | rester dans mon budget | Évo |
| US03g | Visiteur | trier le catalogue par prix croissant ou décroissant | repérer rapidement les arbres les plus abordables | Évo |
| US03h | Visiteur | combiner tous les critères (nom, catégorie, lieu, prix, tri) et les réinitialiser en un clic | trouver l'arbre idéal sans recommencer à chaque fois | Évo |
| US04 | Visiteur | consulter la fiche détaillée d'un arbre (photo, description, prix TTC, lieu de plantation) | décider en connaissance de cause avant d'acheter | MVP |
| US05 | Visiteur | être redirigé vers la page de connexion, avec un lien pour créer un compte si je n'en ai pas, quand je clique sur « Ajouter au panier » | comprendre qu'un compte est nécessaire pour remplir un panier | MVP |
| US05b | Visiteur | accéder au panier après avoir créé un compte ou m'être connecté | poursuivre ma commande | MVP |
| US06 | Visiteur | revenir automatiquement sur la fiche de l'arbre après mon inscription/connexion | reprendre mon achat là où je l'avais laissé | Évo |
| US07 | Visiteur | créer un compte avec mon prénom, mon nom, mon email et mon mot de passe (au moins 12 caractères), choisir mon type de compte (particulier par défaut, association ou entreprise) et, si je choisis association ou entreprise, renseigner éventuellement le nom de ma structure | pouvoir acheter et suivre mes commandes avec un compte adapté à mon profil | MVP |
| US08 | Visiteur | consulter la page « Qui sommes-nous » | savoir qui est derrière Je s’appelle Graine et lui faire confiance | MVP |
| US09 | Visiteur | consulter les mentions légales et la politique de confidentialité (RGPD) | savoir comment mes données sont utilisées | MVP |
| US10 | Visiteur | voir les partenaires / associations soutenues | connaître les projets que je peux financer | Évo |
| US11 | Visiteur | m'abonner à la newsletter | être informé des nouvelles campagnes de plantation | Évo |
| US12 | Visiteur | envoyer un message via un formulaire de contact | poser une question à Je s’appelle Graine | Évo |
| US13 | Visiteur | choisir la langue du site (FR / EN) | naviguer dans ma langue | Évo |
| US14 | Visiteur | consulter les conditions générales de vente (CGV) | connaître les règles de la vente avant d'acheter | Évo |

## Client

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| US20 | Client | me connecter avec mon email et mon mot de passe | accéder à mon espace personnel | MVP |
| US21 | Client | me déconnecter | sécuriser mon compte sur un appareil partagé | MVP |
| US22 | Client | voir le détail de mon panier (arbres, quantités, prix unitaire, total) | vérifier ma commande avant de payer | MVP |
| US23 | Client | modifier la quantité d'un arbre ou le retirer du panier | ajuster ma commande | MVP |
| US23b | Client | choisir la quantité d'un arbre sur sa fiche (1 par défaut) avant de l'ajouter au panier | acheter plusieurs arbres identiques en une seule fois | MVP |
| US23c | Client | ajouter un arbre au panier directement depuis sa vignette (accueil, catalogue), en quantité 1 | ajouter rapidement un arbre sans ouvrir sa fiche, puis ajuster la quantité dans le panier | MVP |
| US24 | Client | choisir mon mode de paiement (virement ou chèque) et m'engager à payer sous 10 jours avant de confirmer ma commande | passer commande et régler par le moyen qui me convient | MVP |
| US25 | Client | recevoir un email de confirmation avec la référence de ma commande et les instructions de paiement | être sûr que ma commande a bien été prise en compte | MVP |
| US25b | Client | recevoir un email quand mon paiement a été reçu | savoir que ma commande est validée | MVP |
| US25c | Client | recevoir un email si ma commande est annulée faute de paiement | savoir que je n'ai plus rien à payer | MVP |
| US26 | Client | consulter l'historique de mes commandes | retrouver mes achats passés | MVP |
| US26b | Client | annuler une commande tant qu'elle est en attente de paiement | annuler un achat que je ne souhaite plus faire | MVP |
| US27 | Client | suivre le statut d'une commande (en attente, payée, plantée, annulée) | savoir où en est la plantation de mes arbres | MVP |
| US28 | Client | modifier toutes mes informations (prénom, nom, adresse, email, type de compte, structure), sauf mon rôle | garder un compte à jour | MVP |
| US29 | Client | changer mon mot de passe (au moins 12 caractères) | sécuriser mon compte | MVP |
| US30 | Client | supprimer mon compte | exercer mon droit à l'effacement (RGPD) | MVP |
| US31 | Client | choisir si j'achète un arbre proposé par Je s’appelle Graine ou par une association tierce | soutenir le projet qui me tient à cœur | Évo |
| US32 | Client | payer en ligne par carte bancaire ou par PayPal via un service sécurisé (Stripe) | acheter en toute sécurité | Évo |
| US33 | Client | voir sur une carte interactive où mes arbres ont été plantés | visualiser concrètement mon impact | Évo |
| US34 | Client | parrainer un ami ou une entreprise | les inciter à planter à leur tour | Évo |
| US35 | Client | gagner des badges selon mes contributions | être récompensé de mon engagement | Évo |
| US36 | Client | être notifié des événements (arbre planté, anniversaire d'un arbre, campagne) | rester impliqué dans le suivi | Évo |
| US37 | Client | réinitialiser mon mot de passe par un lien reçu par email si je l'ai oublié | retrouver l'accès à mon compte et à mes commandes | Évo |
| US38 | Client | accepter les CGV avant de confirmer ma commande | savoir à quelles conditions j'achète | Évo |

## Admin

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| US40 | Admin | me connecter à un espace d'administration protégé | être le seul à pouvoir gérer le site | MVP |
| US41 | Admin | ajouter un arbre au catalogue (nom, catégorie, description, prix TTC, chemin de la photo, lieu) | proposer de nouveaux arbres à la vente | MVP |
| US42 | Admin | modifier un arbre existant | corriger ou mettre à jour ses informations | MVP |
| US43 | Admin | supprimer un arbre jamais commandé | nettoyer le catalogue | MVP |
| US43b | Admin | changer la disponibilité d'un arbre (disponible, épuisé, retiré du catalogue) | ne proposer à la vente que les arbres commandables, sans perdre l'historique | MVP |
| US44 | Admin | choisir les arbres mis en avant sur la page d'accueil | valoriser certains arbres ou partenaires | Évo |
| US45 | Admin | consulter et gérer la liste des utilisateurs | modérer et assister les clients | MVP |
| US46 | Admin | consulter toutes les commandes et changer leur statut (payée à réception du paiement, plantée, annulée si non payée sous 10 jours), la date de chaque changement étant enregistrée et les commandes en retard de paiement mises en évidence | suivre les paiements et tenir les clients informés | MVP |
| US47 | Admin | créer une campagne de plantation avec un objectif collectif | mobiliser la communauté sur un projet | Évo |
| US48 | Admin | envoyer la photo d'un arbre depuis l'espace administrateur | ne plus dépendre d'un fichier ajouté à la main dans le projet | Évo |
| US49 | Admin | attribuer le rôle d'administrateur des ventes à un compte | déléguer la gestion des ventes en gardant seul l'accès aux comptes et à la partie technique | Évo |

## Administrateur des ventes (Évo)

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| US55 | Administrateur des ventes | consulter les commandes et changer leur statut (payée, plantée, annulée) | suivre les ventes sans avoir accès aux comptes ni à la partie technique | Évo |
| US56 | Administrateur des ventes | gérer le catalogue (ajouter, modifier un arbre, changer sa disponibilité) | tenir l'offre à jour | Évo |

## Partenaire (Évo)

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| US50 | Partenaire | proposer un lot d'arbres à planter | financer mon propre projet de reforestation | Évo |
| US51 | Partenaire | suivre les ventes de mes lots | mesurer le soutien reçu | Évo |

---

## Points à trancher en équipe

- ~~**Panier visiteur** (US05) : stocké où tant que la personne n'est pas connectée ?~~ **Tranché le 2026-10-20** : pas de panier visiteur, le clic sur « Ajouter au panier » redirige vers l'inscription. **Précisé le 2026-10-21** : la redirection se fait vers la page de connexion, qui propose aussi de créer un compte, car le visiteur est peut-être déjà client.
- ~~**« Gestion carte bleue »** (wireframe) : stocker une carte implique des obligations fortes (PCI-DSS).~~ **Tranché le 2026-10-21** : page de paiement avec choix du mode (virement, carte, chèque, PayPal) et engagement de payer sous 10 jours ; rien n'est encaissé en ligne. En Évo, c'est Stripe qui garde les cartes, pas notre BDD. **Précisé le 2026-10-22** : la carte bancaire est retirée des modes de paiement du MVP (aucun moyen de payer par carte hors ligne) ; elle arrivera avec Stripe. PayPal est aussi retiré du MVP et arrivera avec le paiement en ligne : le MVP accepte le virement et le chèque.
- ~~**Suivi de commande** (US27) : qui fait évoluer le statut ? **Le 2026-10-21**, US46 passe en MVP (l'admin change le statut à réception du paiement) → US27 (le client suit le statut) peut aussi passer en MVP : à trancher.~~ **Tranché le 2026-10-21** : US27 passe en MVP. Le client voit le statut de ses commandes dans son historique, comme le prévoit le cahier des charges ; l'admin le fait évoluer (US46).
- ~~**Recherche par nom** (US03b) : la recherche ignore les majuscules, mais pas les accents (« chene » ne trouve pas « Chêne »).~~ **Tranché le 2026-10-21** : accents gérés dès le MVP avec l'extension PostgreSQL `unaccent` (`CREATE EXTENSION IF NOT EXISTS unaccent;`), appliquée des deux côtés de la comparaison : `unaccent(name) ILIKE unaccent('%' || $1 || '%')`. Pas de nouvelle colonne, le MCD ne change pas.
- ~~**Filtre par lieu** (US03e, Évo) : texte libre dans `tree` ou table des lieux ?~~ **Tranché le 2026-10-21** : le lieu est défini par l'arbre (`tree.planting_location`), pas de table des lieux, le MCD ne change pas. La liste du filtre reprend les lieux des arbres visibles ; l'admin saisit donc toujours un même lieu de la même façon. Un arbre sans lieu n'apparaît pas quand ce filtre est utilisé.
