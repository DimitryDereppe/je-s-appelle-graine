// Données de la page /nos-forets : un objet par lieu de plantation.
// Source : Apothéose/divers/bdd arbres.md (« Conseils de mélange »),
// incendies vérifiés le 20/11/2026 (préfectures, ONF, DRAAF : liens dans la page).
// Les parts sont indicatives : le site ne bloque aucun achat.

export interface IForestSpecies {
  name: string; // essence, telle qu'elle s'appelle dans le catalogue
  share: number; // part conseillée, en %
  role: string; // pourquoi elle est dans le mélange
}

export interface IForest {
  location: string; // EXACTEMENT la valeur de tree.planting_location : sert au lien /arbres?lieu=
  fire: string; // l'incendie qui a touché le lieu
  intro?: string; // facultatif : ce qui est particulier à ce lieu
  species: IForestSpecies[]; // le total des parts doit faire 100
}

export const forests: IForest[] = [
  {
    location: "Forêt de Brocéliande — Paimpont (35)",
    fire: "Le 12 août 2022, un feu parti de Campénéac (Morbihan) a détruit environ 400 hectares de landes et de bois du massif de Brocéliande.",
    species: [
      {
        name: "Chêne pédonculé",
        share: 45,
        role: "Principale : l'arbre de la chênaie d'origine.",
      },
      {
        name: "Houx commun",
        share: 35,
        role: "Accompagnement : sous-bois persistant, abri pour les oiseaux en hiver.",
      },
      {
        name: "If commun",
        share: 20,
        role: "Accompagnement : longue durée de vie, ombre au sol.",
      },
    ],
  },
  {
    location: "Monts d'Arrée — Finistère (29)",
    fire: "Le 18 juillet 2022, un feu parti de Brasparts a brûlé environ 1 800 hectares, surtout des landes ; avec les reprises d'août, le total a dépassé 2 000 hectares.",
    intro:
      "La lande brûlée est laissée à sa régénération naturelle : c'est un milieu protégé, riche en bruyères et en oiseaux. Nous plantons en lisière, à la frontière entre la lande et les bois, pour faire une transition et freiner le feu.",
    species: [
      {
        name: "Bouleau verruqueux",
        share: 40,
        role: "Pionnière : repousse en premier sur le sol brûlé, l'essence typique des lisières.",
      },
      {
        name: "Sorbier des oiseleurs",
        share: 35,
        role: "Accompagnement : ses baies nourrissent les oiseaux de la lande, qui ramènent d'autres graines.",
      },
      {
        name: "Pin sylvestre",
        share: 25,
        role: "Principale, mais limitée : ses graines s'envolent et colonisent la lande.",
      },
    ],
  },
  {
    location: "Forêt des Landes de Gascogne — Landiras (33)",
    fire: "Le 12 juillet 2022, un feu parti de Landiras a parcouru environ 13 800 hectares, surtout des pins maritimes ; avec celui de La Teste-de-Buch, près de 21 000 hectares ont brûlé en Gironde.",
    species: [
      {
        name: "Pin maritime",
        share: 40,
        role: "Principale : l'essence du massif, mais limitée à 40 %.",
      },
      {
        name: "Chêne tauzin",
        share: 30,
        role: "Coupe-feu : planté en lisières et le long des pistes.",
      },
      {
        name: "Arbousier",
        share: 15,
        role: "Pionnière : repousse très vite de souche après le feu.",
      },
      {
        name: "Laurier noble",
        share: 15,
        role: "Accompagnement : sous-bois.",
      },
    ],
  },
  {
    location: "Massif des Maures — Gonfaron (83)",
    fire: "Le 16 août 2021, un feu parti de Gonfaron a parcouru près de 7 000 hectares de la plaine et du massif des Maures.",
    species: [
      {
        name: "Chêne-liège",
        share: 40,
        role: "Principale : son écorce de liège le protège du feu.",
      },
      {
        name: "Châtaignier",
        share: 25,
        role: "Principale : rejette de souche, sur les versants frais.",
      },
      {
        name: "Pin parasol",
        share: 20,
        role: "Accompagnement : en bouquets espacés, pour ne pas propager le feu.",
      },
      {
        name: "Filaire à larges feuilles",
        share: 15,
        role: "Accompagnement : sous-bois résistant à la sécheresse.",
      },
    ],
  },
  {
    location: "Massif des Corbières — Aude (11)",
    fire: "Le 5 août 2025, un feu parti de Ribaute a parcouru 16 000 à 17 000 hectares de garrigues, de forêts et de vignes, dont environ 11 000 détruits : le plus grand incendie en France depuis 1949.",
    species: [
      {
        name: "Chêne vert",
        share: 35,
        role: "Principale : le chêne des garrigues, repousse de souche.",
      },
      {
        name: "Chêne pubescent",
        share: 30,
        role: "Principale : supporte la chaleur et la sécheresse.",
      },
      {
        name: "Pin d'Alep",
        share: 20,
        role: "Pionnière : recolonise vite, mais limitée car très inflammable.",
      },
      {
        name: "Olivier sauvage",
        share: 15,
        role: "Accompagnement : sols secs et caillouteux.",
      },
    ],
  },
  {
    location: "Massif du Jura — Cernon (39)",
    fire: "Les 9 et 10 août 2022, un feu parti de Cernon et de Vescles a brûlé environ 700 hectares de forêt sur des pentes raides ; plus de 1 000 hectares ont brûlé dans le Jura cet été-là.",
    species: [
      {
        name: "Érable sycomore",
        share: 50,
        role: "Pionnière : pousse vite et tient le sol sur les pentes.",
      },
      {
        name: "Sapin pectiné",
        share: 35,
        role: "Principale : la sapinière d'origine.",
      },
      {
        name: "Épicéa commun",
        share: 15,
        role: "Accompagnement : limité, car fragile face aux sécheresses et aux scolytes (insectes ravageurs).",
      },
    ],
  },
];
