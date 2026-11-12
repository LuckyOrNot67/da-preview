// Données de démonstration, séparées du code. Annonceurs, montants, dates et atelier sont fictifs.
// Montants : exemples des maquettes, aucun prix validé (voir BRIEF, règle 6).

export const VEHICLES = {
  polo: { label: "Polo", name: "Volkswagen Polo", body: "Citadine", front: "img/car-polo-front.webp" },
  suv: { label: "SUV", name: "SUV compact", body: "SUV", front: "img/car-suv-front.webp" },
  caddy: { label: "Caddy", name: "Volkswagen Caddy", body: "Utilitaire", front: "img/car-caddy-front.webp" },
};

export const ROLES = {
  general: { particulier: "Particulier", independant: "Indépendant", societe: "Société avec flotte" },
  taxi: { taxi_independant: "Taxi indépendant", taxi_flotte: "Flotte de taxis" },
};

export const ANGLES = [
  ["avant", "Avant"],
  ["gauche", "Gauche"],
  ["arriere", "Arrière"],
  ["droite", "Droite"],
];

/** applyIn / applyFor : fenêtre de candidature relative à aujourd'hui, en jours. */
export const CAMPAIGNS = [
  {
    id: "studio-nord",
    advertiser: "Studio Nord",
    product: "Le Double Cheddar",
    tagline: "Deux steaks. Cheddar fondant.",
    about: "Studio Nord lance son nouveau burger à Bruxelles et cherche des voitures qui roulent dans la ville.",
    zone: "Bruxelles",
    months: 3,
    rate: 150,
    surfaces: "Portières et hayon",
    seats: 12,
    applyFor: 30,
    univers: ["general", "taxi"],
    vehicles: ["polo", "suv", "caddy"],
    poster: "img/poster-cheddar.webp",
    ad: "img/ad-cheddar.webp",
    adWide: "img/ad-cheddar-wide.webp",
    hero: "img/sn-polo-annonce.webp",
    // Visuels propres à la paire véhicule / campagne. null = visuel pas encore préparé.
    visuals: {
      polo: { avant: "img/car-polo-front.webp", gauche: "img/sn-polo-gauche.webp", arriere: "img/sn-polo-arriere.webp", droite: null, profil: "img/sn-polo-profil.webp" },
      suv: { avant: "img/car-suv-front.webp", gauche: null, arriere: null, droite: null },
      caddy: { avant: "img/car-caddy-front.webp", gauche: null, arriere: null, droite: null },
    },
  },
  {
    id: "maison-sillage",
    advertiser: "Maison Sillage",
    product: "Le Café Signature",
    tagline: "Torréfié à Bruxelles.",
    about: "Maison Sillage fait connaître son café de spécialité autour de ses deux adresses.",
    zone: "Bruxelles",
    months: 2,
    rate: 120,
    surfaces: "Portières",
    seats: 6,
    applyFor: 21,
    univers: ["general"],
    vehicles: ["polo", "suv"],
    poster: "img/poster-cafe.webp",
    ad: "img/ad-cafe.webp",
    adWide: "img/ad-cafe.webp",
    hero: null,
    visuals: {},
  },
  {
    id: "glacier-polaire",
    advertiser: "Glacier Polaire",
    product: "La Vanille Givrée",
    tagline: "Givrée, pas glacée.",
    about: "Glacier Polaire annonce sa glace de saison dans les communes autour de ses comptoirs.",
    zone: "Bruxelles",
    months: 1,
    rate: 130,
    surfaces: "Portières",
    seats: 8,
    applyFor: 14,
    univers: ["general", "taxi"],
    vehicles: ["polo", "suv", "caddy"],
    poster: "img/poster-glace.webp",
    ad: "img/ad-glace.webp",
    adWide: "img/ad-glace.webp",
    hero: null,
    visuals: {},
  },
  {
    id: "kanal-cycles",
    advertiser: "Kanal Cycles",
    product: "Roule électrique",
    tagline: "Bruxelles, sans effort.",
    about: "Kanal Cycles fait connaître ses vélos électriques le long du canal et dans le centre.",
    zone: "Bruxelles",
    months: 2,
    rate: 140,
    surfaces: "Portières et hayon",
    seats: 10,
    applyFor: 25,
    univers: ["general", "taxi"],
    vehicles: ["polo", "suv", "caddy"],
    poster: "img/poster-velo.webp",
    ad: "img/ad-velo.webp",
    adWide: "img/ad-velo.webp",
    hero: null,
    visuals: {},
  },
];

export const WORKSHOP = { name: "Atelier de démonstration", address: "Adresse fictive · 1000 Bruxelles", demo: true };

/** Créneaux déjà pris par d'autres conducteurs (indices dans la liste générée). */
export const TAKEN_SLOT_INDEXES = [1, 4, 5];

export const POSE_ODOMETER = 48200;

export const EXAMPLE_PROFILE = {
  firstName: "Sam",
  univers: "general",
  role: "particulier",
  vehicleId: "polo",
  year: 2021,
  color: "Blanc",
  kmMonth: 1200,
  communes: ["Bruxelles", "Ixelles", "Etterbeek"],
  home: "Ixelles",
  work: "",
  availability: "Semaine et samedi",
};

/** Modèles proposés pendant la frappe. visual : le visuel disponible pour ce modèle, sinon null. */
export const CATALOG = [
  { name: "Volkswagen Polo", vehicleId: "polo" },
  { name: "Volkswagen Caddy", vehicleId: "caddy" },
  { name: "Volkswagen Golf", vehicleId: "polo" },
  { name: "Volkswagen T-Roc", vehicleId: "suv" },
  { name: "BMW X1", vehicleId: "suv" },
  { name: "Peugeot 208", vehicleId: "polo" },
  { name: "Renault Clio", vehicleId: "polo" },
  { name: "Toyota Yaris", vehicleId: "polo" },
  { name: "Dacia Duster", vehicleId: "suv" },
  { name: "Citroën Berlingo", vehicleId: "caddy" },
];

/** Communes proposées pendant la frappe (Bruxelles et grandes villes). */
export const COMMUNES = [
  "Anderlecht", "Auderghem", "Berchem-Sainte-Agathe", "Bruxelles", "Etterbeek", "Evere", "Forest", "Ganshoren", "Ixelles", "Jette",
  "Koekelberg", "Molenbeek-Saint-Jean", "Saint-Gilles", "Saint-Josse-ten-Noode", "Schaerbeek", "Uccle", "Watermael-Boitsfort",
  "Woluwe-Saint-Lambert", "Woluwe-Saint-Pierre", "Anvers", "Gand", "Liège", "Charleroi", "Namur", "Louvain", "Mons", "Bruges",
  "Wavre", "Waterloo", "Nivelles", "Ottignies-Louvain-la-Neuve", "Hasselt", "Malines", "Courtrai",
];

/** Ateliers de pose de démonstration (fictifs). */
export const WORKSHOPS = [
  { id: "bxl", name: "Atelier démo · Bruxelles-Centre", area: "Bruxelles", address: "Adresse fictive · 1000 Bruxelles" },
  { id: "and", name: "Atelier démo · Anderlecht", area: "Anderlecht", address: "Adresse fictive · 1070 Anderlecht" },
];
