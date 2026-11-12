// App conducteur adsmove · version 3, d'après les retours de Lucas du 11 novembre.
// Fonctionne seule dans le navigateur. Les décisions d'AdsMove sont simulées dans le panneau à droite.
// Principes : pas de logo dans l'app, un grand titre par onglet, profil en haut à droite,
// une seule campagne à la fois, rien à faire défiler sans raison, feuilles du bas qu'on tire avec le doigt.
import * as L from "./logic.js";
import * as D from "./data.js";

const KEY = "adsmove-app-conducteur-v3";
const REAL_TODAY = L.toIso(new Date());
const $ = (sel, root = document) => root.querySelector(sel);

// ---------- État ----------
const fresh = () => ({ v: 3, lang: "fr", offset: 0, draft: {}, profile: null, network: null, apps: {}, contract: {}, booking: null, taken: null, runs: [], payments: [], reminderDays: [3, 7], endSeen: false, log: [] });
let S = load();
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    return raw && raw.v === 3 ? { ...fresh(), ...raw } : fresh();
  } catch {
    return fresh();
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch {
    toast("Impossible d'enregistrer dans ce navigateur.");
  }
}
const today = () => L.addDays(REAL_TODAY, S.offset);
const nowIso = () => `${today()}T${new Date().toTimeString().slice(0, 5)}`;
const ui = { filter: "toutes", q: "", workshop: null, day: null, zoom: null };

// ---------- Données dérivées ----------
const campaign = (id) => {
  const c = D.CAMPAIGNS.find((x) => x.id === id);
  return c && { ...c, applyUntil: L.addDays(REAL_TODAY, c.applyFor), seatsLeft: c.seats };
};
const campaigns = () => D.CAMPAIGNS.map((c) => campaign(c.id));
const vehicle = () => D.VEHICLES[S.profile?.vehicleId] ?? D.VEHICLES.polo;
const model = () => S.profile?.model || vehicle().name;
const short = () => model().split(" ").slice(-1)[0];
const visuals = (c) => c.visuals[S.profile?.vehicleId] ?? {};
const front = (c) => (c && visuals(c).avant) || vehicle().front;
const currentRun = () => S.runs.find((r) => r.status !== "terminee") ?? null;
const lastRun = () => S.runs[S.runs.length - 1] ?? null;
const activeApp = () => Object.entries(S.apps).find(([, a]) => ["en_attente", "complement", "acceptee"].includes(a.status)) ?? null;
/** Où en est le conducteur. Une seule campagne à la fois. */
function phase() {
  if (currentRun()) return "active";
  if (S.booking?.status === "confirme") return "rdv";
  const a = activeApp();
  if (a?.[1].status === "acceptee") return "etapes";
  if (a) return "candidature";
  if (lastRun()?.status === "terminee" && !S.endSeen) return "fin";
  if (refusedApp()) return "refus";
  return "liste";
}
const refusedApp = () => Object.entries(S.apps).find(([, a]) => a.status === "refusee" && !a.seen) ?? null;
const committed = () => !["liste", "fin", "refus"].includes(phase());
const workshop = (id) => D.WORKSHOPS.find((w) => w.id === id) ?? D.WORKSHOPS[0];
const HOURS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
function slots(ws) {
  // Créneaux proposés selon les disponibilités du conducteur : semaine, week-end ou les deux.
  const av = S.profile?.availability;
  const allow = av === "Week-end" ? (wd) => wd > 5 : av === "Semaine" ? (wd) => wd <= 5 : () => true;
  const base = () => L.makeSlots(L.addDays(REAL_TODAY, 3), { days: av === "Week-end" ? 6 : 10, hours: HOURS, allow });
  const takenFor = (w) => base().filter((_, i) => (i * 7 + w.id.length) % 3 === 0).map((s) => `${w.id}|${s.id}`);
  if (!S.taken || S.takenFor !== av) {
    S.taken = [...D.WORKSHOPS.flatMap(takenFor), ...(S.booking && S.booking.status !== "annule" ? [] : [])];
    S.takenFor = av;
    if (S.booking?.slotId) S.taken = S.taken.filter((x) => x !== S.booking.slotId).concat(S.booking.slotId);
    save();
  }
  return base().map((s) => ({ ...s, id: `${ws}|${s.id}` })).filter((s) => s.date > today());
}
const parseSlot = (id) => {
  const [ws, rest] = id.split("|");
  return { ws, date: rest.slice(0, 10), time: rest.slice(11) };
};
const approvedUntil = (run) => run.readings.filter((r) => r.status === "approved").map((r) => r.at).sort().pop() ?? null;
function money() {
  let estimated = 0, validated = 0;
  for (const run of S.runs) {
    const c = campaign(run.campaignId);
    const g = L.earnings({ rate: c.rate, poseOn: run.poseOn, deposeOn: run.deposeOn, today: today(), approvedUntil: approvedUntil(run) });
    estimated += g.estimated;
    validated += g.validated;
  }
  return { estimated, validated, paid: S.payments.reduce((t, p) => t + p.amount, 0) };
}
/** Activité façon relevé bancaire : pose, relevés validés, virements. */
function activity() {
  const items = [];
  for (const run of S.runs) {
    const c = campaign(run.campaignId);
    items.push({ at: run.poseOn, ic: "car", title: `Pose · ${c.advertiser}`, sub: "Début de la campagne", amount: null });
    let prev = 0;
    for (const r of run.readings.filter((x) => x.status === "approved").sort((a, b) => (a.at < b.at ? -1 : 1))) {
      const g = L.earnings({ rate: c.rate, poseOn: run.poseOn, deposeOn: run.deposeOn, today: r.at, approvedUntil: r.at }).validated;
      if (g - prev > 0) items.push({ at: r.at, ic: "check", title: "Relevé validé", sub: `${r.odometer.toLocaleString("fr-BE")} km`, amount: g - prev, kind: "validé" });
      prev = g;
    }
    if (run.status === "terminee") items.push({ at: run.deposeOn, ic: "flag", title: `Fin · ${c.advertiser}`, sub: "Dépose effectuée", amount: null });
  }
  for (const p of S.payments) items.push({ at: p.at, ic: "bank", title: "Virement envoyé", sub: p.label, amount: p.amount, kind: "envoyé" });
  items.sort((a, b) => (a.at < b.at ? 1 : -1));
  // L'app ne voit pas ton compte en banque : elle montre ce qu'AdsMove doit encore envoyer, puis ce qui est envoyé.
  const m = money();
  if (m.validated - m.paid > 0) items.unshift({ at: today(), ic: "clock", title: "Virement en attente", sub: "AdsMove l'envoie après validation", amount: m.validated - m.paid, kind: "en attente" });
  return items;
}
function lastReading(run) {
  const r = run.readings.filter((x) => x.status !== "rejected").at(-1);
  return r ? { odometer: r.odometer, at: r.at } : { odometer: run.startOdometer, at: run.poseOn };
}
function nextReminder(run) {
  if (!run || run.status !== "active") return null;
  return L.nextReminder(S.reminderDays, today(), run.readings.at(-1)?.at ?? null, true);
}
const kmValidated = (run) => (run ? run.readings.filter((r) => r.status === "approved").reduce((t, r) => t + r.km, 0) : 0);

// ---------- Langue : libellés traduits à l'affichage (les textes avec des chiffres ou des noms restent en français pour l'instant) ----------
const LANGS = { fr: "Français", nl: "Nederlands", en: "English" };
const LOCALE = { fr: "fr-BE", nl: "nl-BE", en: "en-GB" };
const lang = () => S.lang ?? "fr";
const T = {
  "Accueil": ["Home", "Home"], "Campagnes": ["Campagnes", "Campaigns"], "Ma campagne": ["Mijn campagne", "My campaign"], "Gains": ["Verdiensten", "Earnings"],
  "Profil": ["Profiel", "Profile"], "Paramètres": ["Instellingen", "Settings"], "Langue": ["Taal", "Language"], "Mes données": ["Mijn gegevens", "My data"],
  "Ma voiture": ["Mijn auto", "My car"], "Mes communes": ["Mijn gemeenten", "My areas"], "Cumul estimé": ["Geschat totaal", "Estimated total"],
  "Validé": ["Gevalideerd", "Validated"], "Envoyé": ["Verzonden", "Sent"], "En attente": ["In afwachting", "Pending"], "Ton parcours": ["Jouw traject", "Your journey"],
  "Compte": ["Account", "Account"], "Campagne": ["Campagne", "Campaign"], "Pose": ["Plaatsing", "Fitting"], "En route": ["Onderweg", "On the road"],
  "Pas encore de campagne": ["Nog geen campagne", "No campaign yet"], "Prête pour une campagne": ["Klaar voor een campagne", "Ready for a campaign"],
  "Campagne en cours": ["Campagne loopt", "Campaign running"], "Candidature envoyée": ["Aanvraag verzonden", "Application sent"], "Tu es retenu": ["Je bent gekozen", "You're selected"],
  "Ta voiture": ["Jouw auto", "Your car"], "Habillée": ["Bestickerd", "Wrapped"], "Toutes": ["Alle", "All"], "Bruxelles": ["Brussel", "Brussels"],
  "Participer": ["Deelnemen", "Join"], "Rémunération": ["Vergoeding", "Pay"], "par mois": ["per maand", "per month"], "mois": ["maanden", "months"], "places": ["plaatsen", "spots"],
  "Continuer": ["Doorgaan", "Continue"], "Créer mon compte": ["Account aanmaken", "Create my account"], "Tu roules déjà.": ["Je rijdt al.", "You already drive."],
  "Inscription": ["Registratie", "Sign up"], "Qui es-tu ?": ["Wie ben je?", "Who are you?"], "Prénom": ["Voornaam", "First name"], "Nom": ["Naam", "Last name"],
  "Es-tu un particulier ?": ["Ben je een particulier?", "Are you a private driver?"], "Oui, particulier": ["Ja, particulier", "Yes, private"], "Non, professionnel": ["Nee, professioneel", "No, professional"],
  "Tes zones": ["Jouw zones", "Your areas"], "Quand es-tu disponible ?": ["Wanneer ben je beschikbaar?", "When are you available?"], "Semaine": ["Week", "Weekdays"], "Week-end": ["Weekend", "Weekend"], "Les deux": ["Beide", "Both"],
  "Envoyer mon inscription": ["Registratie versturen", "Send my sign-up"], "Compte créé.": ["Account aangemaakt.", "Account created."], "Aller à l'accueil": ["Naar home", "Go to home"],
  "Activité": ["Activiteit", "Activity"], "Comment c'est calculé": ["Hoe het berekend wordt", "How it's calculated"], "Mes relevés": ["Mijn meterstanden", "My readings"],
  "Relevé": ["Meterstand", "Reading"], "Tu gagnes": ["Je verdient", "You earn"], "Prochain relevé": ["Volgende meterstand", "Next reading"], "En cours": ["Loopt", "Running"],
  "Envoyer le relevé": ["Meterstand versturen", "Send reading"], "C'est envoyé.": ["Verzonden.", "Sent."], "Voir ma campagne": ["Mijn campagne bekijken", "See my campaign"],
  "Modifier": ["Wijzigen", "Edit"], "Enregistrer": ["Opslaan", "Save"], "Zone": ["Zone", "Area"], "Surfaces habillées": ["Bestickerde vlakken", "Wrapped surfaces"],
  "Candidatures": ["Aanvragen", "Applications"], "Suivi": ["Opvolging", "Tracking"], "Glisser pour participer": ["Schuif om deel te nemen", "Slide to join"],
  "Glisser pour réserver": ["Schuif om te reserveren", "Slide to book"], "Glisser pour signer": ["Schuif om te tekenen", "Slide to sign"], "Ma candidature": ["Mijn aanvraag", "My application"],
  "Mes informations": ["Mijn gegevens", "My details"], "Ma pose": ["Mijn plaatsing", "My fitting"], "Mon contrat": ["Mijn contract", "My contract"], "Atelier": ["Werkplaats", "Workshop"], "Jour": ["Dag", "Day"],
  "Signer mon contrat": ["Mijn contract tekenen", "Sign my contract"], "Créneau réservé": ["Tijdslot gereserveerd", "Slot booked"], "Fin de campagne": ["Einde campagne", "Campaign end"],
  "Détails du rendez-vous": ["Details van de afspraak", "Appointment details"], "Annuler ma candidature": ["Mijn aanvraag annuleren", "Cancel my application"], "Visuels de ma campagne": ["Visuals van mijn campagne", "My campaign visuals"],
};
function translate(root) {
  const i = { nl: 0, en: 1 }[lang()];
  if (i == null || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const key = n.nodeValue.trim();
    if (T[key]) n.nodeValue = n.nodeValue.replace(key, T[key][i]);
  }
  root.querySelectorAll("[placeholder]").forEach((el) => T[el.placeholder] && (el.placeholder = T[el.placeholder][i]));
}
/** Petit chargement entre deux étapes. */
function loading(text, next) {
  const el = Object.assign(document.createElement("div"), { className: "loader", innerHTML: `<span class="pi"></span><b>${esc(text)}</b><u><s></s></u>` });
  $("#app").append(el);
  setTimeout(() => {
    next();
    el.classList.add("off");
    setTimeout(() => el.remove(), 350);
  }, reduced() ? 300 : 1100);
}
/** Petit chargement au changement de langue. */
function translating(next) {
  const el = Object.assign(document.createElement("div"), { className: "loader", innerHTML: `<span class="pi"></span><b>${{ fr: "Traduction en cours…", nl: "Vertaling bezig…", en: "Translating…" }[lang()]}</b><u><s></s></u>` });
  $("#app").append(el);
  setTimeout(() => {
    next();
    el.classList.add("off");
    setTimeout(() => el.remove(), 350);
  }, reduced() ? 300 : 1100);
}

// ---------- Format (sans « nov. · ») ----------
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
const eur = (n) => `${Math.round(n).toLocaleString("fr-BE")} €`;
const rate = (c) => `${c.rate} € par mois`;
const fmt = (iso, opts) => L.parseIso(iso).toLocaleDateString(LOCALE[lang()], { timeZone: "UTC", ...opts });
const day = (iso) => fmt(iso, { day: "numeric", month: "short" }).replace(".", "");
const dateLong = (iso) => fmt(iso, { weekday: "long", day: "numeric", month: "long" });
const dayMonth = (iso) => fmt(iso, { day: "numeric", month: "long" });
const hour = (t) => `${Number(t.slice(0, 2))} h${t.slice(3) === "00" ? "" : t.slice(3)}`;
const months = (n) => `${n} mois`;
const img = (src, alt = "", cls = "") => (src ? `<img class="${cls}" src="${src}" alt="${esc(alt)}">` : "");
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- Icônes ----------
const I = {
  home: '<path d="M4.5 10.5 12 4.5l7.5 6V19a1 1 0 0 1-1 1h-4v-5.5h-5V20h-4a1 1 0 0 1-1-1z"/>',
  car: '<path d="M3 15.5v-2.8c0-.6.4-1.1 1-1.3l2.2-.7 2.3-3a2 2 0 0 1 1.6-.7h4.6a2 2 0 0 1 1.5.7l2.6 3 1.5.4c.6.2 1 .7 1 1.3v3.1c0 .6-.4 1-1 1h-1"/><path d="M8.6 16.5h6.8"/><circle cx="6.5" cy="16.5" r="2"/><circle cx="17.5" cy="16.5" r="2"/>',
  euro: '<circle cx="12" cy="12" r="8"/><path d="M15 8.8a3.6 3.6 0 1 0 0 6.4"/><path d="M8 11h5M8 13.2h5"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5"/>',
  back: '<path d="m15 5-7 7 7 7"/>', next: '<path d="m9 5 7 7-7 7"/>', x: '<path d="m6 6 12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  cam: '<path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  gauge: '<path d="M4.5 16.5a8 8 0 1 1 15 0"/><path d="m12 13 3.5-4"/>',
  shield: '<path d="M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  doc: '<path d="M7 3.5h7l4 4V20.5H7z"/><path d="M14 3.5v4h4M9.5 12h6M9.5 15.5h6"/>',
  dl: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
  bank: '<path d="M4 10h16L12 4.5z"/><path d="M6 10v7M10 10v7M14 10v7M18 10v7M4 19.5h16"/>',
  flag: '<path d="M6 20V4.5M6 5h11l-2 3.5 2 3.5H6"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h6"/>',
  info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8v.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  pen: '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="m13 7 4 4"/>',
  msg: '<path d="M4.5 6.5h15v10h-9l-4 3.5v-3.5h-2z"/>',
};
const icon = (name, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[name] ?? ""}</svg>`;

// ---------- Morceaux d'interface ----------
const PI = '<span class="pi" aria-hidden="true"></span>';
const btn = (label, attrs = "", cls = "") => `<button class="btn ${cls}" ${attrs}>${label}</button>`;
const link = (label, href, cls = "") => `<a class="btn ${cls}" href="${href}">${label}</a>`;
const arr = `<span class="arr">${icon("arrow")}</span>`;
const fine = (t) => `<p class="fine">${t}</p>`;
const podium = (src, alt = "", cls = "") => `<div class="podium ${cls}">${src ? img(src, alt) : `<div class="empty-v">${PI}<span>Visuel en préparation</span></div>`}<i class="disc" aria-hidden="true"></i></div>`;
const row = ({ href, act, ic, small, strong, sub, right, thumb, attrs = "" }) => {
  const inner = `${thumb ?? (ic ? `<span class="ri">${icon(ic)}</span>` : "")}<span class="rt">${small ? `<small>${small}</small>` : ""}<strong>${strong}</strong>${sub ? `<span class="sub">${sub}</span>` : ""}</span>${right ?? (href || act ? icon("next", "chev") : "")}`;
  if (href) return `<a class="row" href="${href}" ${attrs}>${inner}</a>`;
  if (act) return `<button class="row" data-act="${act}" ${attrs}>${inner}</button>`;
  return `<div class="row" ${attrs}>${inner}</div>`;
};
const badge = (t, on = false) => `<span class="badge ${on ? "on" : ""}">${t}</span>`;
const slider = (label, act, attrs = "") => `<div class="slide" data-slide="${act}" ${attrs}><span class="slide-l">${label}</span><button class="knob" aria-label="${label} (Entrée pour valider)">${icon("arrow")}</button></div>`;
const step = ({ n, state, title, sub, action = "" }) => `<div class="step ${state === "done" ? "ok" : state}"><span class="sn">${state === "done" ? icon("check") : state === "lock" ? icon("lock") : n}</span><span class="rt"><strong>${title}</strong>${sub ? `<span class="sub">${sub}</span>` : ""}${action}</span></div>`;
const campHero = (c, low = "") => `<div class="camp-hero ${low}">${img(c.ad, "")}<span class="cp-in"><b>${esc(c.product)}</b><span>${esc(c.advertiser)} · ${esc(c.zone)} · ${months(c.months)} · ${rate(c)}</span></span></div>`;
const poster = (src, body) => `<div class="welcome poster tabbed"><div class="wl-img">${img(src, "")}</div><div class="wl-in">${body}</div></div>`;
const posterView = (key, title, src, body) => ({ key, kind: "root", tab: "campagnes", title, fixed: true, dark: true, cls: "poster-page", html: poster(src, body) });
const pstep = ({ n, state, ic, title, sub, attrs = "" }) => `<button class="pstep ${state === "done" ? "ok" : state}" ${state === "lock" || !attrs ? "disabled" : attrs}><span class="sn">${ic ? icon(ic) : state === "done" ? icon("check") : state === "lock" ? icon("lock") : n}</span><span class="rt"><strong>${title}</strong><span class="sub">${sub}</span></span>${state === "lock" || !attrs ? "" : icon("next", "chev")}</button>`;
const campHead = (c) => `<div class="mini">${img(c.ad, "")}<span class="rt"><small>${esc(c.advertiser)}</small><strong>${esc(c.product)}</strong><span class="sub">${esc(c.zone)} · ${months(c.months)} · ${rate(c)}</span></span></div>`;

// ---------- Écrans ----------
// kind : root (onglet, grand titre, avatar en haut à droite, menu du bas), page (retour en haut à gauche),
// bare (plein écran), detail (image en haut, fiche qu'on tire vers le haut).
const screens = {
  bienvenue() {
    return {
      key: "bienvenue", kind: "bare", dark: true,
      html: `<div class="welcome">
        <div class="wl-img">${img("img/welcome.webp", "Voiture habillée pour une campagne, à Bruxelles")}</div>
        <div class="wl-in">
          <h1 class="disp xl">Tu roules déjà.</h1>
          <p class="lead">Une pub sur ta voiture, une rémunération selon les conditions de chaque campagne. Tes trajets restent les tiens.</p>
          ${link(`Créer mon compte${arr}`, "#/inscription/1", "light")}
          <button class="txt" data-act="example">Essayer avec un profil d'exemple</button>
        </div>
      </div>`,
    };
  },

  inscription(stepN) {
    const d = S.draft;
    const pro = d.particulier === false;
    const total = pro ? 4 : 3;
    const eye = (n) => `<p class="eye">Étape ${n} sur ${total}</p>`;
    const proRoles = [["independant", "Indépendant", "user"], ["societe", "Société avec flotte", "grid"], ["taxi_independant", "Taxi indépendant", "car"], ["taxi_flotte", "Taxi avec flotte", "car"]];
    if (stepN === "pro") {
      if (!pro) return redirect("#/inscription/1");
      return {
        key: "inscription-pro", kind: "page", title: "Inscription",
        html: `${eye(2)}<h1 class="disp">Ton activité</h1>
        <form class="form" id="f-pro" data-form="pro">
          <div class="tiles4">${proRoles.map(([v, l, ic]) => `<label class="opt"><input type="radio" name="role" value="${v}" ${d.role === v || (!proRoles.some(([x]) => x === d.role) && v === "independant") ? "checked" : ""}><span>${icon(ic)}<b>${l}</b></span></label>`).join("")}</div>
          <div class="group">
            <label class="fld"><span class="ri">${icon("grid")}</span><span class="fl"><small>Nom de ta société</small><input id="f-company" name="company" required maxlength="80" autocomplete="organization" enterkeyhint="next" placeholder="Ex. Taxis Durand" value="${esc(d.company)}"></span></label>
            <label class="fld"><span class="ri">${icon("msg")}</span><span class="fl"><small>E-mail</small><input id="f-mail" name="email" type="email" required autocomplete="email" enterkeyhint="done" placeholder="toi@exemple.be" value="${esc(d.email)}"></span></label>
          </div>
          <div class="hint-card">${icon("shield")}<span>AdsMove te recontacte par e-mail pour vérifier ton compte professionnel.</span></div>
        </form>`,
        bar: btn(`Continuer${arr}`, 'type="submit" form="f-pro"'),
      };
    }
    const n = Math.min(3, Math.max(1, Number(stepN) || 1));
    if (n > 1 && pro && !d.emailVerified) return redirect("#/inscription/pro");
    if (n === 1) {
      return {
        key: "inscription-1", kind: "page", title: "Inscription",
        html: `${eye(1)}<h1 class="disp">Qui es-tu ?</h1>
        <form class="form" id="f-ins1" data-form="ins1">
          <div class="group">
            <label class="fld"><span class="ri">${icon("user")}</span><span class="fl"><small>Prénom</small><input id="f-first" name="firstName" required maxlength="40" autocomplete="given-name" enterkeyhint="next" value="${esc(d.firstName)}" placeholder="Ton prénom"></span></label>
            <label class="fld"><span class="ri">${icon("user")}</span><span class="fl"><small>Nom</small><input id="f-last" name="lastName" required maxlength="40" autocomplete="family-name" enterkeyhint="done" value="${esc(d.lastName)}" placeholder="Ton nom"></span></label>
          </div>
          <p class="q">Es-tu un particulier ?</p>
          <div class="seg"><label><input type="radio" name="part" value="oui" data-act="part" ${pro ? "" : "checked"}><span>Oui, particulier</span></label><label><input type="radio" name="part" value="non" data-act="part" ${pro ? "checked" : ""}><span>Non, professionnel</span></label></div>
          <p class="q">Langue de l'app</p>
          <div class="seg">${Object.entries(LANGS).map(([k, l]) => `<label><input type="radio" name="lang" value="${k}" ${lang() === k ? "checked" : ""}><span>${l}</span></label>`).join("")}</div>
        </form>`,
        bar: btn(`Continuer${arr}`, 'type="submit" form="f-ins1"'),
      };
    }
    if (n === 2) {
      const picked = d.model ? D.CATALOG.find((x) => x.name === d.model) : null;
      const vis = picked ? D.VEHICLES[picked.vehicleId] : null;
      return {
        key: "inscription-2", kind: "page", title: "Inscription",
        html: `${eye(pro ? 3 : 2)}<h1 class="disp">Ta voiture</h1>
        <form class="form" id="f-ins2" data-form="ins2">
          <div class="group ac-wrap">
            <label class="fld"><span class="ri">${icon("search")}</span><span class="fl"><small>Marque et modèle</small><input id="f-model" name="model" data-ac="car" autocomplete="off" enterkeyhint="search" placeholder="Ex. Volkswagen Polo" value="${esc(d.model)}"></span></label>
            <ul class="ac" id="ac-car" role="listbox"></ul>
          </div>
          ${picked ? `<div class="ready">${podium(vis.front, picked.name, "short")}<span class="rd-t"><small>Ta voiture est prête</small><b>${esc(picked.name)}</b></span></div>
          <div class="group two">
            <label class="fld"><span class="fl"><small>Année</small><input id="f-year" name="year" inputmode="numeric" pattern="[0-9]{4}" required value="${esc(d.year)}" placeholder="2021"></span></label>
            <label class="fld"><span class="fl"><small>Km par mois</small><input id="f-km" name="kmMonth" inputmode="numeric" pattern="[0-9]{2,5}" required value="${esc(d.kmMonth)}" placeholder="1200"></span></label>
          </div>` : `<div class="hint-card">${icon("info")}<span>Tape ta marque ou ton modèle, puis choisis ta voiture dans la liste.</span></div>`}
        </form>`,
        bar: picked ? btn(`Continuer${arr}`, 'type="submit" form="f-ins2"') : btn("Continuer", "disabled"),
      };
    }
    const communes = d.communes ?? [];
    return {
      key: "inscription-3", kind: "page", title: "Inscription",
      html: `${eye(total)}<h1 class="disp">Tes zones</h1>
      <form class="form" id="f-ins3" data-form="ins3">
        <div class="group ac-wrap">
          <label class="fld"><span class="ri">${icon("pin")}</span><span class="fl"><small>Communes où tu roules souvent</small><input id="f-commune" data-ac="commune" autocomplete="off" enterkeyhint="done" placeholder="Tape une commune"></span></label>
          <ul class="ac" id="ac-commune" role="listbox"></ul>
        </div>
        <div class="chips">${communes.length ? communes.map((x) => `<button type="button" class="chip on" data-act="rm-commune" data-v="${esc(x)}">${esc(x)} ${icon("x")}</button>`).join("") : `<span class="fine">Ajoute au moins une commune.</span>`}</div>
        <p class="q">Quand es-tu disponible ?</p>
        <div class="seg">${["Semaine", "Week-end", "Les deux"].map((x) => `<label><input type="radio" name="availability" value="${x}" data-act="avail" ${(d.availability ?? "Les deux") === x ? "checked" : ""}><span>${x}</span></label>`).join("")}</div>
        <label class="check"><input id="f-consent" type="checkbox" name="consent" required data-act="consent" ${d.consent ? "checked" : ""}><span>J'accepte qu'AdsMove utilise ces informations pour étudier mon inscription. Aucune localisation n'est collectée.</span></label>
      </form>`,
      bar: btn(`Envoyer mon inscription${arr}`, `type="submit" form="f-ins3" ${d.consent && communes.length ? "" : "disabled"}`),
    };
  },

  bienvenu() {
    const pro = Boolean(S.profile?.company);
    return {
      key: "inscription-envoyee", kind: "bare", dark: true,
      html: `<div class="welcome poster">
        <div class="wl-img">${img("img/created.webp", "")}</div>
        <div class="wl-in">
          <span class="tick">${icon("check")}</span>
          <p class="eye">Bienvenue, ${esc(S.profile?.firstName)}</p>
          <h1 class="disp xl">Compte créé.</h1>
          <p class="lead">${pro ? "AdsMove te recontacte par e-mail pour vérifier ton compte. Tu peux déjà regarder les campagnes." : "Ton compte est actif. Tu peux choisir ta première campagne."}</p>
          ${link(`Aller à l'accueil${arr}`, "#/", "light")}
        </div>
      </div>`,
    };
  },

  accueil() {
    const ph = phase();
    const m = money();
    const run = currentRun();
    const a = activeApp();
    const c = run ? campaign(run.campaignId) : a ? campaign(a[0]) : S.booking?.status === "confirme" ? campaign(S.booking.campaignId) : null;
    const dressed = ["active", "rdv"].includes(ph);
    let state = { t: "Pas encore de campagne", s: "Prête pour une campagne" };
    if (ph === "candidature") state = { t: "Candidature envoyée", s: `${esc(c.advertiser)} · réponse sous 24 à 48 h` };
    if (ph === "etapes") state = { t: "Tu es retenu", s: `${esc(c.advertiser)} · prépare ta pose` };
    if (ph === "rdv") { const s = parseSlot(S.booking.slotId); state = { t: `Pose le ${dayMonth(s.date)}`, s: `${hour(s.time)} · ${esc(workshop(s.ws).name)}` }; }
    if (ph === "active") { const g = L.earnings({ rate: c.rate, poseOn: run.poseOn, deposeOn: run.deposeOn, today: today(), approvedUntil: null }); state = { t: "Campagne en cours", s: `${esc(c.advertiser)} · jour ${g.activeDays} sur ${g.totalDays}` }; }
    if (ph === "fin") state = { t: "Campagne terminée", s: "Merci ! Une nouvelle campagne t'attend." };
    return {
      key: `accueil-${ph}`, kind: "root", tab: "accueil", title: `Bonjour ${esc(S.profile.firstName)}`, fixed: true, dark: true,
      html: `<div class="hero-card home">
          <span class="hc-top">${badge(dressed ? "Habillée" : "Ta voiture", dressed)}<span class="hc-model">${esc(model())}</span></span>
          ${podium(dressed ? front(c) : vehicle().front, `Ta ${short()}`)}
          <span class="hc-state"><b>${state.t}</b><span>${state.s}</span></span>
        </div>
        <div class="money">
          <div class="m-main"><small>Cumul estimé</small><b class="num">${eur(m.estimated)}</b></div>
          <div class="m-side"><span><small>Validé</small><b>${eur(m.validated)}</b></span><span><small>Envoyé</small><b>${eur(m.paid)}</b></span></div>
        </div>`,
    };
  },

  campagnes() {
    const ph = phase();
    if (ph === "candidature") return tabCandidature();
    if (ph === "etapes") return tabEtapes();
    if (ph === "rdv") return tabRdv();
    if (ph === "active") return tabActive();
    if (ph === "fin") return tabFin();
    if (ph === "refus") return tabRefus();
    const q = ui.q.trim().toLowerCase();
    const list = campaigns().filter((c) => S.apps[c.id]?.status !== "terminee" && (ui.filter === "toutes" || (ui.filter === "bxl" && c.zone === "Bruxelles") || (ui.filter === "car" && c.vehicles.includes(S.profile.vehicleId))) && (!q || `${c.advertiser} ${c.product} ${c.zone}`.toLowerCase().includes(q)));
    return {
      key: "campagnes-liste", kind: "root", tab: "campagnes", title: "Campagnes", fixed: true,
      html: `<div class="list-tools">
        <label class="search">${icon("search")}<input id="f-q" data-filter="q" placeholder="Marque, produit, commune" value="${esc(ui.q)}" autocomplete="off" enterkeyhint="search"></label>
        <div class="chips nowrap">${[["toutes", "Toutes"], ["bxl", "Bruxelles"], ["car", `Pour ma ${esc(short())}`]].map(([k, l]) => `<button class="chip ${ui.filter === k ? "on" : ""}" data-act="filter" data-v="${k}">${l}</button>`).join("")}</div>
      </div>
      ${list.length ? `<div class="clist" data-clist><div class="cl-stage">${list.map((c) => {
        const check = L.canApply({ profile: S.profile, campaign: c, application: S.apps[c.id], today: today(), busy: committed() });
        if (S.apps[c.id]?.status === "refusee") check.reason = "Candidature non retenue.";
        return `<a class="ccard ${check.ok ? "" : "off"}" href="#/campagne/${c.id}" data-zoom="${c.id}"><span class="cc-img">${img(c.ad, `Publicité ${c.product}`)}</span>
          <span class="cc-t"><small>${esc(c.advertiser)}</small><strong>${esc(c.product)}</strong><span class="sub">${check.ok ? `${esc(c.zone)} · ${months(c.months)}` : esc(check.reason)}</span></span>
          <b class="price">${c.rate}&#8239;€<span>par mois</span></b></a>`;
      }).join("")}</div>${list.map(() => `<i class="cl-snap"></i>`).join("")}</div>` : `<div class="hint-card">${icon("search")}<span>Aucune campagne ne correspond. Essaie un autre filtre.</span></div>`}`,
    };
  },

  campagne(id) {
    const c = campaign(id);
    if (!c) return notFound();
    const v = visuals(c);
    const app = S.apps[id];
    const check = L.canApply({ profile: S.profile, campaign: c, application: app, today: today(), busy: committed() });
    const views = [[c.ad, "La pub", "ad"], ...D.ANGLES.map(([k, l]) => [v[k], `${l} · ta ${esc(short())}`, k])].filter(([src]) => src);
    const action = check.ok ? btn(`Participer${arr}`, `data-act="sheet" data-sheet="participer" data-id="${id}"`) : app && app.status !== "retiree" ? link(`Voir ma campagne${arr}`, "#/campagnes") : btn("Indisponible", "disabled");
    return {
      key: "campagne-detail", kind: "detail", title: esc(c.advertiser),
      hero: `<div class="gal" data-gal>${views.map(([src, l, k]) => `<figure class="${k === "avant" ? "blk" : ""}">${img(src, l)}<figcaption>${l}</figcaption></figure>`).join("")}</div>
        <div class="gal-dots">${views.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>`,
      html: `<p class="eye">${esc(c.advertiser)}</p>
        <h1 class="disp">${esc(c.product)}</h1>
        <div class="facts"><div><b>${c.rate}&#8239;€</b><span>par mois</span></div><div><b>${c.months}</b><span>mois</span></div><div><b>${c.seats}</b><span>places</span></div></div>
        <p class="lead"><i>${esc(c.tagline)}</i> ${esc(c.about)}</p>
        ${!check.ok ? `<div class="hint-card">${icon("info")}<span>${esc(check.reason)}</span></div>` : ""}
        <div class="card">
          ${row({ ic: "pin", small: "Zone", strong: esc(c.zone) })}
          ${row({ ic: "car", small: "Surfaces habillées", strong: esc(c.surfaces) })}
          ${row({ ic: "clock", small: "Candidatures", strong: `Jusqu'au ${dayMonth(c.applyUntil)}` })}
          ${row({ ic: "gauge", small: "Suivi", strong: "Compteur et communes, sans GPS" })}
        </div>
        ${fine(`Montant d'exemple, proratisé selon le contrat. Visuels indicatifs, créés par IA.`)}`,
      bar: `<div class="bar-price"><small>Rémunération</small><b>${c.rate}&#8239;€<span> / mois</span></b></div>${action}`,
    };
  },

  envoye(id) {
    const c = campaign(id);
    if (!c || !S.apps[id]) return redirect("#/campagnes");
    return {
      key: "candidature-envoyee", kind: "bare", dark: true,
      html: `<div class="welcome poster">
        <div class="wl-img">${img(c.poster ?? c.ad, `Publicité ${c.product}`)}</div>
        <div class="wl-in">
          <span class="tick">${icon("check")}</span>
          <h1 class="disp xl">C'est envoyé.</h1>
          <p class="lead">AdsMove te répond sous 24 à 48&#8239;h. Délai indicatif.</p>
          <p class="fine">${esc(c.advertiser)} · ${esc(c.product)} · ${rate(c)}</p>
          ${link(`Voir ma campagne${arr}`, "#/campagnes", "light")}
        </div>
      </div>`,
    };
  },

  infos() {
    return redirect("#/campagnes");
  },

  pose() {
    return redirect("#/campagnes");
  },

  reserve() {
    const b = S.booking;
    if (!b) return redirect("#/campagnes");
    const s = parseSlot(b.slotId);
    const c = campaign(b.campaignId);
    return {
      key: "creneau-reserve", kind: "bare", dark: true,
      html: `<div class="welcome poster">
        <div class="wl-img">${img(c.poster ?? c.ad, "")}</div>
        <div class="wl-in">
          <p class="eye">Créneau réservé</p>
          <h1 class="disp xl">${dayMonth(s.date)}</h1>
          <p class="when">${cap(fmt(s.date, { weekday: "long" }))} à ${hour(s.time)}</p>
          <p class="fine">${esc(workshop(s.ws).name)} · ${esc(workshop(s.ws).address)}</p>
          ${btn(`Signer mon contrat${arr}`, `data-act="sheet" data-sheet="contrat" data-id="${c.id}"`, "light")}
          <p class="fine ctr">Dernière étape. AdsMove contresigne ensuite et ta pose est confirmée.</p>
        </div>
      </div>`,
    };
  },

  releve() {
    return redirect("#/campagnes");
  },

  "releve-ok"() {
    return redirect("#/campagnes");
  },

  gains() {
    const m = money();
    const items = activity();
    // Courbe fine du cumul estimé sur 8 semaines.
    const estAt = (iso) => S.runs.reduce((t, run) => t + L.earnings({ rate: campaign(run.campaignId).rate, poseOn: run.poseOn, deposeOn: run.deposeOn, today: iso, approvedUntil: null }).estimated, 0);
    const pts = Array.from({ length: 9 }, (_, i) => estAt(L.addDays(today(), -7 * (8 - i))));
    const max = Math.max(1, ...pts);
    const xy = pts.map((v, i) => [6 + (i * 288) / 8, 64 - (v / max) * 54]);
    const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return {
      key: "gains", kind: "root", tab: "gains", title: "Gains", fixed: true,
      html: `<div class="balance">
          <small>Cumul estimé</small><b class="num">${eur(m.estimated)}</b>
          <svg class="spark" viewBox="0 0 300 72" preserveAspectRatio="none" aria-hidden="true"><polygon points="6,70 ${line} 294,70" class="sp-a"/><polyline points="${line}" class="sp-l"/><circle cx="${xy[8][0]}" cy="${xy[8][1].toFixed(1)}" r="4" class="sp-d"/></svg>
          <div class="sp-x"><span>Il y a 8 semaines</span><span>Aujourd'hui</span></div>
          <div class="trio"><span><small>Validé</small><b>${eur(m.validated)}</b></span><span><small>Envoyé</small><b>${eur(m.paid)}</b></span><span><small>En attente</small><b>${eur(Math.max(0, m.validated - m.paid))}</b></span></div>
        </div>
        <div class="sec-row"><h3 class="sec">Activité</h3><button class="txt sm" data-act="sheet" data-sheet="calcul">Comment c'est calculé</button></div>
        ${items.length ? `<div class="card scroll-y">${items.map(actRow).join("")}</div>` : `<div class="hint-card">${icon("info")}<span>Ton activité apparaît ici dès la pose : relevés validés et virements.</span></div>`}`,
    };
  },

  profil(sub) {
    if (sub) return redirect("#/profil");
    const p = S.profile;
    const role = Object.values(D.ROLES).reduce((a, x) => ({ ...a, ...x }), {})[p.role];
    const cid = currentRun()?.campaignId ?? activeApp()?.[0] ?? null;
    const done = S.runs.filter((r) => r.status === "terminee").length;
    const sh = (name) => ({ act: "sheet", attrs: `data-sheet="${name}"` });
    return {
      key: "profil", kind: "page", title: "Profil",
      html: `<div class="me-head"><span class="avatar">${esc(p.firstName[0] ?? "")}</span><span class="rt"><strong class="disp sm">${esc(p.firstName)} ${esc(p.lastName ?? "")}</strong><span class="sub">${role}${p.company ? ` · ${esc(p.company)}` : ""}</span>${S.network === "accepte" ? "" : badge("Vérification en cours")}</span></div>
        <h3 class="sec">Moi</h3>
        <div class="card">${row({ ...sh("pIdentite"), ic: "user", small: "Nom", strong: `${esc(p.firstName)} ${esc(p.lastName ?? "")}` })}${p.company ? row({ ic: "grid", small: "Société", strong: esc(p.company), sub: esc(p.proEmail ?? "") }) : ""}</div>
        <h3 class="sec">Ma voiture</h3>
        <div class="card">${row({ ...sh("pVoiture"), ic: "car", small: "Modèle", strong: esc(model()), sub: `${esc(p.year)} · ${esc(p.kmMonth)} km par mois` })}</div>
        <h3 class="sec">Mes zones</h3>
        <div class="card">${row({ ...sh("pCommunes"), ic: "pin", small: "Communes", strong: esc(p.communes.join(", ")) })}${row({ ...sh("pDispo"), ic: "clock", small: "Disponibilités", strong: esc(p.availability || "—") })}</div>
        <h3 class="sec">Mes campagnes</h3>
        <div class="card">${row({ href: "#/historique", ic: "flag", strong: "Historique", sub: done ? `${done} campagne${done > 1 ? "s" : ""} terminée${done > 1 ? "s" : ""}` : "Aucune campagne terminée" })}${cid ? row({ href: `#/campagne/${cid}`, ic: "grid", strong: "Visuels de ma campagne" }) : ""}</div>
        <h3 class="sec">Paramètres</h3>
        <div class="card">${row({ ...sh("langue"), ic: "msg", small: "Langue", strong: LANGS[lang()] })}${row({ href: "#/donnees", ic: "doc", strong: "Mes données" })}</div>
        <button class="txt demo-link" data-act="demo-open">Ouvrir la simulation AdsMove</button>`,
    };
  },

  historique() {
    const done = S.runs.filter((r) => r.status === "terminee").reverse();
    return {
      key: "historique", kind: "page", title: "Historique",
      html: done.length ? done.map((run) => {
        const c = campaign(run.campaignId);
        const g = L.earnings({ rate: c.rate, poseOn: run.poseOn, deposeOn: run.deposeOn, today: run.deposeOn, approvedUntil: approvedUntil(run) });
        const km = kmValidated(run);
        return `<div class="camp-hero act">${img(c.ad, "")}<span class="cp-in"><b>${esc(c.product)}</b><span>${esc(c.advertiser)} · ${esc(c.zone)}</span></span></div>
          <div class="facts"><div><b>${eur(g.validated)}</b><span>gagnés</span></div><div><b>${g.totalDays}</b><span>jours</span></div><div><b>${km.toLocaleString(LOCALE[lang()])}</b><span>km validés</span></div></div>
          <div class="card">${row({ ic: "cal", small: "Pose", strong: cap(dateLong(run.poseOn)) })}${row({ ic: "flag", small: "Dépose", strong: cap(dateLong(run.deposeOn)) })}${row({ ic: "euro", small: "Par jour roulé", strong: `${(g.totalDays ? g.validated / g.totalDays : 0).toLocaleString(LOCALE[lang()], { maximumFractionDigits: 2 })} €`, sub: `${g.totalDays ? Math.round(km / g.totalDays) : 0} km par jour en moyenne` })}${row({ ic: "bank", small: "Versement", strong: run.settled ? "Émis" : "En préparation" })}</div>
          <h3 class="sec">Relevés</h3>
          <div class="card">${run.readings.slice().reverse().map((r) => row({ ic: "gauge", strong: `${r.odometer.toLocaleString("fr-BE")} km`, sub: `${cap(dayMonth(r.at))} · +${r.km.toLocaleString("fr-BE")} km`, right: `<span class="fine">${{ submitted: "Envoyé", approved: "Validé", rejected: "Refusé" }[r.status]}</span>` })).join("")}</div>`;
      }).join("") : `<div class="hint-card">${icon("flag")}<span>Tes campagnes terminées apparaîtront ici, avec tes relevés et tes gains.</span></div>`,
    };
  },

  donnees() {
    return {
      key: "donnees", kind: "page", title: "Mes données",
      html: `<div class="card">${row({ ic: "user", strong: "Profil", sub: "Nom, statut, disponibilités" })}${row({ ic: "car", strong: "Voiture", sub: "Modèle, année, km déclarés" })}${row({ ic: "gauge", strong: "Relevés", sub: "Compteur et photos" })}${row({ ic: "pin", strong: "Communes", sub: "Déclarées par toi" })}</div>
        <div class="hint-card">${icon("shield")}<span>Aucune localisation. Dans cette démo, tout reste dans ce navigateur.</span></div>
        <button class="txt danger" data-act="reset">Supprimer mon compte et mes données</button>`,
      bar: btn(`${icon("dl")} Télécharger mes données`, 'data-act="export"', "line"),
    };
  },
};

// ---------- Onglet Campagne selon la situation ----------
function tabCandidature() {
  const [id, app] = activeApp();
  const c = campaign(id);
  const compl = app.status === "complement";
  if (!compl)
    return posterView("campagne-attente", "Ma candidature", c.poster ?? c.ad, `${badge("En attente")}
      <h1 class="disp xl">En attente de validation.</h1>
      <p class="lead">AdsMove te répond sous 24 à 48&#8239;h. Délai indicatif.</p>
      <span class="wait" aria-hidden="true"><i></i><i></i><i></i></span>
      <button class="txt sm" data-act="sheet" data-sheet="retirer" data-id="${id}">Annuler ma candidature</button>`);
  return {
    key: `campagne-${compl ? "complement" : "attente"}`, kind: "root", tab: "campagnes", title: "Ma candidature", fixed: true,
    html: `<div class="cand-hero">${img(c.hero && S.profile.vehicleId === "polo" ? c.hero : c.ad, "")}<span class="ch-in">${badge(compl ? "Complément demandé" : "En attente", true)}<b>${esc(c.product)}</b><span>${esc(c.advertiser)} · ${rate(c)}</span></span></div>
      ${compl ? `<div class="chat">
          <div class="msg in"><span class="avatar xs">${PI}</span><div><small>AdsMove</small><p>${esc(app.note ?? "Il nous manque une information.")}</p></div></div>
          ${app.reply ? `<div class="msg out"><div>${app.complementThumb ? `<img src="${app.complementThumb}" alt="">` : ""}<p>${esc(app.reply)}</p><small>Envoyé</small></div></div>` : ""}
        </div>
        <form class="reply" id="f-comp-form" data-form="complement" data-id="${id}">
          <label class="clip" aria-label="Joindre une photo (facultatif)">${icon("cam")}<input id="f-comp" type="file" name="photo" accept="image/*"></label>
          <input id="f-reply" name="reply" placeholder="Ta réponse" autocomplete="off" enterkeyhint="send">
          <button class="send" aria-label="Envoyer">${icon("arrow")}</button>
        </form>`
      : `<div class="next-steps">
          ${step({ n: 1, state: "done", title: "Candidature envoyée", sub: cap(dateLong(app.sentAt.slice(0, 10))) })}
          ${step({ n: 2, state: "now", title: "Réponse d'AdsMove", sub: "Sous 24 à 48 h. Tu reçois une notification." })}
          ${step({ n: 3, state: "lock", title: "Préparer ta pose", sub: "Informations, créneau, contrat" })}
        </div>`}
      <button class="txt sm" data-act="sheet" data-sheet="retirer" data-id="${id}">Annuler ma candidature</button>`,
  };
}
function tabRefus() {
  const [id, app] = refusedApp();
  const c = campaign(id);
  return posterView("campagne-refusee", "Ma candidature", c.poster ?? c.ad, `<span class="tick no">${icon("x")}</span>
    <h1 class="disp xl">Pas cette fois.</h1>
    <p class="lead">AdsMove n'a pas retenu ta candidature pour ${esc(c.product)}.</p>
    ${app.note ? `<p class="fine">${esc(app.note)}</p>` : ""}
    ${btn(`OK${arr}`, `data-act="refus-seen" data-id="${id}"`, "light")}`);
}
function tabEtapes() {
  const [id] = activeApp();
  const c = campaign(id);
  const k = S.contract[id] ?? {};
  const b = S.booking?.campaignId === id && S.booking.status === "reserve" ? parseSlot(S.booking.slotId) : null;
  const left = [!k.infos, !b, !k.signed].filter(Boolean).length;
  const sh = (name) => `data-act="sheet" data-sheet="${name}" data-id="${id}"`;
  return posterView("campagne-etapes", "Ma campagne", c.poster ?? c.ad, `${badge("Retenu", true)}
    <h1 class="disp xl">C'est bon pour toi.</h1>
    <p class="lead">${left ? `Encore ${left} étape${left > 1 ? "s" : ""} pour fixer ta pose.` : "Il ne manque que la signature d'AdsMove."}</p>
    <div class="psteps">
      ${pstep({ n: 1, state: k.infos ? "done" : "now", title: "Mes informations", sub: k.infos ? "Validées" : "Vérifie ta voiture et tes communes", attrs: k.infos ? "" : sh("infos") })}
      ${pstep({ n: 2, state: b ? "done" : k.infos ? "now" : "lock", title: "Ma pose", sub: b ? `${cap(dateLong(b.date))} à ${hour(b.time)}` : "Atelier, jour et heure", attrs: k.signed ? "" : sh("pose") })}
      ${pstep({ n: 3, state: k.signed ? "done" : b ? "now" : "lock", title: "Mon contrat", sub: k.signed ? "Signé · AdsMove le contresigne" : "À signer après le choix du créneau", attrs: k.signed ? "" : sh("contrat") })}
    </div>
    <button class="txt sm" data-act="sheet" data-sheet="retirer" data-id="${id}">Annuler ma participation</button>`);
}
function tabRdv() {
  const s = parseSlot(S.booking.slotId);
  const c = campaign(S.booking.campaignId);
  const w = workshop(s.ws);
  return posterView("campagne-rdv", "Ma campagne", c.poster ?? c.ad, `${badge("Pose confirmée", true)}
    <h1 class="disp xl">${dayMonth(s.date)}</h1>
    <p class="when">${cap(fmt(s.date, { weekday: "long" }))} à ${hour(s.time)} · dans ${Math.max(0, L.diffDays(today(), s.date))} jours</p>
    <div class="psteps">${pstep({ state: "now", ic: "pin", title: esc(w.name), sub: esc(w.address), attrs: 'data-act="sheet" data-sheet="rdv"' })}</div>`);
}
function tabActive() {
  const run = currentRun();
  const c = campaign(run.campaignId);
  const g = L.earnings({ rate: c.rate, poseOn: run.poseOn, deposeOn: run.deposeOn, today: today(), approvedUntil: approvedUntil(run) });
  const next = nextReminder(run);
  const due = today() >= run.deposeOn;
  return {
    key: "campagne-active", kind: "root", tab: "campagnes", title: "Ma campagne",
    html: `<div class="camp-hero act">${img(c.ad, "")}
        <span class="cp-in"><span class="cp-top"><b>${esc(c.product)}</b>${badge("En cours", true)}</span><span>${esc(c.advertiser)} · ${esc(c.zone)}</span>
          <span class="lv-prog"><i style="--w:${Math.round((g.activeDays / g.totalDays) * 100)}%"></i></span>
          <span class="lv-dates"><span><small>Pose</small><b>${day(run.poseOn)}</b></span><span class="mid">Jour ${g.activeDays} sur ${g.totalDays}</span><span><small>Fin</small><b>${day(run.deposeOn)}</b></span></span>
        </span>
      </div>
      <div class="todo">
        <span class="ri">${icon("gauge")}</span>
        <span class="rt"><small>${due ? "Fin de campagne" : next === today() ? "Aujourd'hui" : "Prochain relevé"}</small><strong>${due ? "Dépose à organiser" : next ? cap(dateLong(next)) : "—"}</strong></span>
        ${due ? "" : btn("Relevé", 'data-act="sheet" data-sheet="releve"', "sm")}
      </div>
      <h3 class="sec">Mes relevés</h3>
      ${run.readings.length ? `<div class="card">${run.readings.slice().reverse().map((r) => row({ ic: "gauge", strong: `${r.odometer.toLocaleString("fr-BE")} km`, sub: `${cap(dayMonth(r.at))} · +${r.km.toLocaleString("fr-BE")} km${r.communes.length ? ` · ${esc(r.communes.join(", "))}` : ""}`, right: `<span class="fine">${{ submitted: "Envoyé", approved: "Validé", rejected: "Refusé" }[r.status]}</span>` })).join("")}</div>` : `<div class="hint-card">${icon("gauge")}<span>Ton premier relevé apparaîtra ici. Un relevé, c'est juste le kilométrage de ton compteur.</span></div>`}`,
  };
}
function tabFin() {
  const run = lastRun();
  const c = campaign(run.campaignId);
  const g = L.earnings({ rate: c.rate, poseOn: run.poseOn, deposeOn: run.deposeOn, today: today(), approvedUntil: approvedUntil(run) });
  return posterView("campagne-terminee", "Ma campagne", c.poster ?? c.ad, `${badge(run.settled ? "Versement émis" : "Versement en préparation", run.settled)}
    <h1 class="disp xl">Campagne terminée.</h1>
    <p class="lead">${run.settled ? "Le versement est émis. Tu le reçois selon les délais de ta banque." : "Le versement sera fait d'ici un à deux jours. On t'informe dès qu'il est émis."}</p>
    <p class="fine">${eur(g.validated)} gagnés · ${g.totalDays} jours · ${kmValidated(run).toLocaleString(LOCALE[lang()])} km validés</p>
    ${btn(`Choisir une nouvelle campagne${arr}`, 'data-act="end-seen"', "light")}`);
}

const actRow = (a) => row({ ic: a.ic, strong: a.title, sub: `${day(a.at)} · ${esc(a.sub)}`, right: a.amount != null ? `<b class="amt">${a.kind === "envoyé" ? "+" : ""}${eur(a.amount)}<small>${a.kind}</small></b>` : "" });

// ---------- Feuilles du bas : contenu court, rien à faire défiler, on les tire vers le bas pour fermer ----------
const sheets = {
  participer(id) {
    const c = campaign(id);
    return `<div class="sh-camp">${img(c.hero && S.profile.vehicleId === "polo" ? c.hero : c.ad, "")}<span class="rt"><small>${esc(c.advertiser)}</small><strong>${esc(c.product)}</strong><span class="sub">Sur ta ${esc(short())} · ${esc(c.surfaces)}</span></span></div>
      <div class="facts sh"><div><b>${c.rate}&#8239;€</b><span>par mois</span></div><div><b>${c.months}</b><span>mois</span></div><div><b>${esc(c.zone)}</b><span>zone</span></div></div>
      ${fine("AdsMove confirme ta candidature. Envoyer ne vaut ni acceptation ni contrat.")}
      ${slider("Glisser pour participer", "apply", `data-id="${id}"`)}`;
  },
  retirer(id) {
    const c = campaign(id);
    return `<h2 class="sh-t">Annuler ?</h2>
      <p class="lead">${esc(c.advertiser)} · ${esc(c.product)}. Tu pourras ensuite choisir une autre campagne.</p>
      ${btn("Oui, annuler", `data-act="withdraw" data-id="${id}"`)}${btn("Non, garder", 'data-act="close-sheet"', "line")}`;
  },
  heures(id) {
    const all = slots(ui.workshop).filter((s) => s.date === ui.day);
    return `<h2 class="sh-t">${cap(dateLong(ui.day))}</h2><p class="fine">${esc(workshop(ui.workshop).name)}</p>
      <div class="hours">${all.map((s) => {
        const taken = S.taken.includes(s.id) && S.booking?.slotId !== s.id;
        return `<button class="hr ${taken ? "taken" : ""}" ${taken ? "disabled" : `data-act="sheet" data-sheet="creneau" data-id="${id}" data-v="${s.id}"`}><b>${hour(s.time)}</b><span>${taken ? "Complet" : "Libre"}</span></button>`;
      }).join("")}</div>
      <button class="txt sm" data-act="sheet" data-sheet="pose" data-id="${id}">Autre jour ou autre atelier</button>`;
  },
  creneau(id, slotId) {
    const s = parseSlot(slotId);
    const c = campaign(id);
    const w = workshop(s.ws);
    return `<div class="sh-camp">${img(c.ad, "")}<span class="rt"><small>Pose · ${esc(c.advertiser)}</small><strong>${dayMonth(s.date)}</strong><span class="sub">${cap(fmt(s.date, { weekday: "long" }))} à ${hour(s.time)}</span></span></div>
      <div class="card flat">${row({ ic: "pin", small: "Adresse de l'atelier", strong: esc(w.name), sub: esc(w.address) })}</div>
      ${btn(`Réserver ce créneau${arr}`, `data-act="book" data-id="${id}" data-slot="${slotId}"`)}
      <button class="txt sm" data-act="sheet" data-sheet="heures" data-id="${id}">Autre heure</button>`;
  },
  langue() {
    return `<h2 class="sh-t">Langue</h2>
      <div class="stack">${Object.entries(LANGS).map(([k, l]) => `<button class="opt-row ${lang() === k ? "sel" : ""}" data-act="set-lang" data-v="${k}"><span class="rt"><strong>${l}</strong></span><span class="radio"></span></button>`).join("")}</div>`;
  },
  contrat(id) {
    const c = campaign(id);
    const b = parseSlot(S.booking.slotId);
    return `<h2 class="sh-t">Ton contrat</h2>
      <div class="ticket"><small>Contrat de campagne · exemple</small><b>${esc(c.advertiser)} · ${esc(c.product)}</b><i class="cut"></i>
        <div class="tk-g"><span><small>Rémunération</small><b>${rate(c)}</b></span><span><small>Durée</small><b>${months(c.months)}</b></span><span><small>Pose</small><b>${day(b.date)} à ${hour(b.time)}</b></span><span><small>Voiture</small><b>${esc(model())}</b></span><span class="wide"><small>Atelier</small><b>${esc(workshop(b.ws).name)}</b></span></div></div>
      ${fine("Démo : aucun contrat réel. AdsMove contresigne ensuite.")}
      ${slider("Glisser pour signer", "sign", `data-id="${id}"`)}`;
  },
  rdv() {
    const b = S.booking;
    const s = parseSlot(b.slotId);
    const w = workshop(s.ws);
    return `<h2 class="sh-t">Ta pose</h2>
      <div class="ticket"><span class="tk-d">${cap(dateLong(s.date))}</span><span class="tk-h">à ${hour(s.time)}</span><i class="cut"></i>
        <div class="tk-row">${icon("pin")}<span><b>${esc(w.name)}</b><br><span class="sub">${esc(w.address)}</span></span></div></div>
      <a class="btn line" href="https://www.openstreetmap.org/search?query=${encodeURIComponent(w.address)}" target="_blank" rel="noopener">${icon("route")} Itinéraire</a>
      <button class="txt sm danger" data-act="cancel-booking">Annuler la pose</button>`;
  },
  releve() {
    const run = currentRun();
    if (!run || run.status !== "active") return "";
    const prev = lastReading(run);
    const sel = new Set(S.draft.zones ?? []);
    const options = L.cleanCommunes([...(S.profile.communes ?? []), ...sel]);
    return `<h2 class="sh-t">Relevé</h2>
      <p class="fine">Dernier relevé · ${dayMonth(prev.at)} · ${prev.odometer.toLocaleString("fr-BE")} km</p>
      <form class="form" id="f-reading" data-form="reading">
        <div class="group"><label class="fld big"><span class="ri">${icon("gauge")}</span><span class="fl"><small>Compteur aujourd'hui, en km</small><input id="f-odo" name="odometer" inputmode="numeric" pattern="[0-9]+" required autocomplete="off" enterkeyhint="done" placeholder="${(prev.odometer + 1).toLocaleString("fr-BE")}"></span></label></div>
        <p class="q">Communes traversées</p>
        <div class="chips">${options.map((o) => `<button type="button" class="chip ${sel.has(o) ? "on" : ""}" data-act="zone" data-v="${esc(o)}">${esc(o)}</button>`).join("")}</div>
        <div class="group ac-wrap"><label class="fld"><span class="ri">${icon("plus")}</span><span class="fl"><small>Autre commune</small><input id="f-other" data-ac="zone" autocomplete="off" enterkeyhint="done" placeholder="Tape une commune"></span></label><ul class="ac" id="ac-zone" role="listbox"></ul></div>
        ${btn(`Envoyer le relevé${arr}`, 'type="submit"')}
      </form>`;
  },
  releveOk() {
    const r = currentRun()?.readings.at(-1);
    if (!r) return "";
    return `<div class="sh-done"><span class="tick">${icon("check")}</span><p class="eye">Relevé envoyé</p><b class="num xl">+${r.km.toLocaleString(LOCALE[lang()])}<span> km</span></b></div>
      <div class="card flat">${row({ ic: "gauge", strong: `${r.odometer.toLocaleString(LOCALE[lang()])} km`, sub: esc(r.communes.join(", ") || "Aucune commune déclarée") })}</div>
      ${btn("Fermer", 'data-act="close-sheet"', "line")}`;
  },
  infos(id) {
    const p = S.profile;
    return `<h2 class="sh-t">C'est bien toi ?</h2>
      <div class="card flat">${row({ ic: "user", small: "Nom", strong: `${esc(p.firstName)} ${esc(p.lastName ?? "")}` })}${row({ ic: "car", small: "Voiture", strong: esc(model()), sub: `${esc(p.year)} · ${esc(p.kmMonth)} km par mois` })}${row({ ic: "pin", small: "Communes", strong: esc(p.communes.join(", ")) })}${row({ ic: "clock", small: "Disponibilités", strong: esc(p.availability || "—") })}</div>
      ${btn(`C'est correct${arr}`, `data-act="infos" data-id="${id}"`)}
      <a class="txt sm" href="#/profil">Modifier mes informations</a>`;
  },
  pose(id) {
    ui.workshop ??= D.WORKSHOPS[0].id;
    const all = slots(ui.workshop);
    const dates = [...new Set(all.map((s) => s.date))].slice(0, 5);
    const free = (d) => all.filter((s) => s.date === d && !S.taken.includes(s.id)).length;
    if (!dates.includes(ui.day)) ui.day = dates.find((d) => free(d)) ?? dates[0];
    return `<h2 class="sh-t">Ma pose</h2>
      <p class="q">Atelier</p>
      <div class="ws-list">${D.WORKSHOPS.map((w) => `<label class="opt-row"><input type="radio" name="ws" value="${w.id}" data-act="ws" ${ui.workshop === w.id ? "checked" : ""}><span class="ri">${icon("pin")}</span><span class="rt"><strong>${esc(w.name)}</strong><span class="sub">${esc(w.address)}</span></span><span class="radio"></span></label>`).join("")}</div>
      <p class="q">Jour <span class="fine">· ${cap(fmt(ui.day, { month: "long" }))}</span></p>
      <div class="days">${dates.map((d) => `<button class="${d === ui.day ? "on" : ""} ${free(d) ? "" : "full"}" data-act="day" data-v="${d}"><small>${fmt(d, { weekday: "short" }).replace(".", "")}</small><b>${fmt(d, { day: "numeric" })}</b><i>${free(d) ? `${free(d)} libres` : "Complet"}</i></button>`).join("")}</div>
      ${free(ui.day) ? btn(`Voir les heures du ${dayMonth(ui.day)}${arr}`, `data-act="sheet" data-sheet="heures" data-id="${id}"`) : btn("Aucune heure libre ce jour-là", "disabled")}
      ${fine("Démo : ateliers et adresses fictifs.")}`;
  },
  versement() {
    const pay = S.payments.at(-1);
    if (!pay) return "";
    return `<div class="sh-done"><span class="tick">${icon("bank")}</span><p class="eye">Versement émis</p><b class="num xl">+${eur(pay.amount)}</b></div>
      <p class="lead ctr">Tu le reçois selon les délais de ta banque.</p>
      ${btn("OK", 'data-act="close-sheet"')}`;
  },
  pIdentite() {
    const p = S.profile;
    return `<h2 class="sh-t">Mon nom</h2>
      <form class="form" data-form="p-identite">
        <div class="group"><label class="fld"><span class="ri">${icon("user")}</span><span class="fl"><small>Prénom</small><input id="e-first" name="firstName" required maxlength="40" autocomplete="given-name" value="${esc(p.firstName)}"></span></label><label class="fld"><span class="ri">${icon("user")}</span><span class="fl"><small>Nom</small><input id="e-last" name="lastName" maxlength="40" autocomplete="family-name" value="${esc(p.lastName ?? "")}"></span></label></div>
        ${btn(`Enregistrer${arr}`, 'type="submit"')}
      </form>`;
  },
  pVoiture() {
    const p = S.profile;
    return `<h2 class="sh-t">Ma voiture</h2>
      <form class="form" data-form="p-voiture">
        <div class="group"><label class="fld"><span class="ri">${icon("car")}</span><span class="fl"><small>Marque et modèle</small><input id="e-model" name="model" list="dl-cars" required autocomplete="off" value="${esc(model())}"></span></label></div>
        <datalist id="dl-cars">${D.CATALOG.map((x) => `<option value="${esc(x.name)}">`).join("")}</datalist>
        <div class="group two">
          <label class="fld"><span class="fl"><small>Année</small><input id="e-year" name="year" inputmode="numeric" pattern="[0-9]{4}" required value="${esc(p.year)}"></span></label>
          <label class="fld"><span class="fl"><small>Km par mois</small><input id="e-km" name="kmMonth" inputmode="numeric" pattern="[0-9]{2,5}" required value="${esc(p.kmMonth)}"></span></label>
        </div>
        ${btn(`Enregistrer${arr}`, 'type="submit"')}
      </form>`;
  },
  pCommunes() {
    const p = S.profile;
    return `<h2 class="sh-t">Mes communes</h2>
      <div class="chips">${p.communes.map((x) => `<button type="button" class="chip on" data-act="rm-pcommune" data-v="${esc(x)}">${esc(x)} ${icon("x")}</button>`).join("")}</div>
      <form class="form" data-form="p-commune">
        <div class="group"><label class="fld"><span class="ri">${icon("plus")}</span><span class="fl"><small>Ajouter une commune</small><input id="e-commune" name="commune" list="dl-communes" required autocomplete="off" placeholder="Tape une commune"></span></label></div>
        <datalist id="dl-communes">${D.COMMUNES.filter((x) => !p.communes.includes(x)).map((x) => `<option value="${esc(x)}">`).join("")}</datalist>
        ${btn("Ajouter", 'type="submit"', "line")}
      </form>
      ${btn("Terminé", 'data-act="close-sheet"')}`;
  },
  pDispo() {
    const cur = S.profile.availability;
    return `<h2 class="sh-t">Mes disponibilités</h2>
      <div class="stack">${["Semaine", "Week-end", "Les deux"].map((l) => `<button class="opt-row ${cur === l ? "sel" : ""}" data-act="set-avail" data-v="${l}"><span class="rt"><strong>${l}</strong></span><span class="radio"></span></button>`).join("")}</div>`;
  },
  calcul() {
    const m = money();
    return `<h2 class="sh-t">Comment c'est calculé</h2>
      <div class="eq"><span><b>Forfait mensuel</b><small>de la campagne</small></span><span>×</span><span><b>Jours roulés</b><small>÷ 30</small></span></div>
      <div class="card flat">${row({ ic: "clock", strong: "Estimé", sub: "Jours écoulés depuis la pose", right: `<b>${eur(m.estimated)}</b>` })}${row({ ic: "check", strong: "Validé", sub: "Couvert par tes relevés validés", right: `<b>${eur(m.validated)}</b>` })}${row({ ic: "bank", strong: "Versé", sub: "Virements reçus", right: `<b>${eur(m.paid)}</b>` })}</div>
      ${fine("Exemple de règle. La règle réelle est celle de ton contrat.")}`;
  },
};
let sheetState = null;
function openSheet(name, id, v) {
  const html = sheets[name]?.(id, v);
  if (!html) return;
  sheetState = { name, id, v };
  const el = $("#sheet");
  const panel = el.querySelector(".sh-panel");
  el.querySelector(".sh-body").innerHTML = html;
  panel.style.transform = "";
  translate(panel);
  el.hidden = false;
  $("#app").classList.add("sheet-on");
  requestAnimationFrame(() => el.classList.add("on"));
  initSliders(el);
}
function closeSheet() {
  const el = $("#sheet");
  if (!el || el.hidden) return;
  el.classList.remove("on");
  $("#app").classList.remove("sheet-on");
  el.querySelector(".sh-panel").style.transform = "";
  sheetState = null;
  setTimeout(() => !sheetState && (el.hidden = true), 320);
}
/** Feuille : on la tire vers le bas pour la fermer, elle revient si on la lâche trop tôt. */
function initSheetDrag() {
  const el = $("#sheet");
  const panel = el.querySelector(".sh-panel");
  let y0 = null, dy = 0, t0 = 0;
  panel.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, a, input, label, .slide")) return;
    y0 = e.clientY;
    t0 = performance.now();
    dy = 0;
    panel.setPointerCapture?.(e.pointerId);
    panel.classList.add("drag");
  });
  panel.addEventListener("pointermove", (e) => {
    if (y0 == null) return;
    dy = e.clientY - y0;
    const y = dy > 0 ? dy : dy / 6; // résiste vers le haut
    panel.style.transform = `translateY(${y}px)`;
    el.querySelector(".sh-bg").style.opacity = String(Math.max(0, 1 - Math.max(0, dy) / 400));
  });
  const end = () => {
    if (y0 == null) return;
    y0 = null;
    panel.classList.remove("drag");
    el.querySelector(".sh-bg").style.opacity = "";
    const fast = dy / Math.max(1, performance.now() - t0) > 0.6;
    if (dy > 110 || (fast && dy > 30)) closeSheet();
    else panel.style.transform = "";
  };
  panel.addEventListener("pointerup", end);
  panel.addEventListener("pointercancel", end);
}

const notFound = () => ({ key: "introuvable", kind: "page", title: "", html: `<h1 class="disp">Page introuvable</h1>${link("Retour à l'accueil", "#/")}` });
const redirect = (hash) => ({ redirect: hash });

// ---------- Actions ----------
function armed(el, label) {
  if (el.dataset.armed) return true;
  const old = el.innerHTML;
  el.dataset.armed = "1";
  el.textContent = label;
  setTimeout(() => {
    if (el.isConnected) {
      delete el.dataset.armed;
      el.innerHTML = old;
    }
  }, 4000);
  return false;
}
const blur = () => document.activeElement?.blur?.();

function act(name, el) {
  const id = el?.dataset.id;
  const v = el?.dataset.v;
  const at = nowIso();
  switch (name) {
    case "example":
      S.profile = { ...D.EXAMPLE_PROFILE, lastName: "Exemple", model: "Volkswagen Polo", availability: "Les deux", consentAt: at };
      S.network = "accepte";
      save();
      return go("#/");
    case "part":
      S.draft.particulier = el.value === "oui";
      return save();
    case "consent": {
      S.draft.consent = el.checked;
      save();
      const send = el.closest(".page").querySelector(".bar button");
      if (send) send.disabled = !(el.checked && (S.draft.communes ?? []).length);
      return;
    }
    case "avail":
      S.draft.availability = el.value;
      return save();
    case "sheet":
      blur();
      return openSheet(el.dataset.sheet, id, v);
    case "close-sheet":
      return closeSheet();
    case "apply": {
      const c = campaign(id);
      const check = L.canApply({ profile: S.profile, campaign: c, application: S.apps[id], today: today(), busy: committed() });
      if (!check.ok) return toast(check.reason);
      S.apps[id] = L.transition(S.apps[id], "envoyer", at);
      save();
      closeSheet();
      return go(`#/envoye/${id}`);
    }
    case "withdraw": {
      const app = S.apps[id];
      if (app.status === "acceptee") {
        // Annulation après acceptation : on libère le créneau éventuel.
        if (S.booking?.campaignId === id) S.taken = S.taken.filter((x) => x !== S.booking.slotId);
        S.booking = null;
        S.contract[id] = {};
        S.apps[id] = { ...app, status: "retiree", history: [...app.history, { status: "retiree", at }] };
      } else S.apps[id] = L.transition(app, "retirer", at);
      save();
      closeSheet();
      toast("C'est annulé. Tu peux choisir une autre campagne.");
      return go("#/campagnes");
    }
    case "infos":
      S.contract[id] = { ...S.contract[id], infos: true };
      save();
      closeSheet();
      return render();
    case "refus-seen":
      S.apps[id] = { ...S.apps[id], seen: true };
      save();
      return render();
    case "set-avail":
      S.profile.availability = v;
      S.taken = null;
      save();
      closeSheet();
      return render();
    case "book": {
      const prev = S.booking?.slotId ?? null;
      const res = L.book(S.taken, el.dataset.slot, prev);
      if (!res.ok) return toast(res.error);
      S.taken = res.taken;
      S.booking = { campaignId: id, slotId: el.dataset.slot, status: "reserve", at };
      save();
      closeSheet();
      return go("#/reserve");
    }
    case "sign":
      S.contract[id] = { ...S.contract[id], signed: true };
      save();
      closeSheet();
      return go("#/campagnes");
    case "cancel-booking":
      if (!armed(el, "Appuie encore pour annuler")) return;
      S.taken = S.taken.filter((x) => x !== S.booking.slotId);
      S.booking = null;
      S.contract[activeApp()?.[0] ?? ""] = { infos: true };
      save();
      closeSheet();
      toast("Pose annulée. Choisis un autre créneau.");
      return go("#/campagnes");
    case "set-lang":
      closeSheet();
      if (v === lang()) return;
      S.lang = v;
      save();
      return translating(render);
    case "end-seen":
      S.endSeen = true;
      save();
      return render();
    case "filter":
      ui.filter = v;
      return render();
    case "ws":
      ui.workshop = el.value;
      ui.day = null;
      return openSheet("pose", sheetState?.id);
    case "day":
      ui.day = v;
      return openSheet("pose", sheetState?.id);
    case "pick-car": {
      const item = D.CATALOG.find((x) => x.name === v);
      S.draft = { ...S.draft, model: item.name, vehicleId: item.vehicleId };
      save();
      blur();
      return render();
    }
    case "pick-car-edit":
      $("#e-model").value = v;
      blur();
      return hideAc();
    case "pick-commune":
      S.draft.communes = L.cleanCommunes([...(S.draft.communes ?? []), v]);
      save();
      blur();
      return render();
    case "rm-commune":
      S.draft.communes = (S.draft.communes ?? []).filter((x) => x !== v);
      save();
      return render();
    case "pick-pcommune":
      S.profile.communes = L.cleanCommunes([...S.profile.communes, v]);
      save();
      blur();
      return render();
    case "rm-pcommune":
      if (S.profile.communes.length < 2) return toast("Garde au moins une commune.");
      S.profile.communes = S.profile.communes.filter((x) => x !== v);
      save();
      render();
      return sheetState?.name === "pCommunes" ? openSheet("pCommunes") : undefined;
      // (la feuille des communes reste ouverte)
    case "zone": {
      // Sur place, pour ne pas effacer le kilométrage déjà tapé.
      const z = new Set(S.draft.zones ?? []);
      if (z.has(v)) z.delete(v);
      else z.add(v);
      S.draft.zones = [...z];
      save();
      return el.classList.toggle("on", z.has(v));
    }
    case "pick-zone": {
      S.draft.zones = L.cleanCommunes([...(S.draft.zones ?? []), v]);
      save();
      blur();
      hideAc();
      const input = $("#f-other");
      if (input) input.value = "";
      const chips = (el.closest("#sheet") ?? el.closest(".page"))?.querySelector(".form .chips");
      chips?.insertAdjacentHTML("beforeend", `<button type="button" class="chip on" data-act="zone" data-v="${esc(v)}">${esc(v)}</button>`);
      return;
    }
    case "export": {
      const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "adsmove-mes-donnees.json" });
      a.click();
      return URL.revokeObjectURL(a.href);
    }
    case "reset":
      if (!armed(el, "Appuie encore pour tout supprimer")) return;
      S = fresh();
      save();
      return go("#/");
    case "back":
      return back();
    case "demo-open":
      return document.body.classList.toggle("demo-open");
    case "fb":
      return feedback(el);
    default:
      return demo(name, el);
  }
}

async function submit(form) {
  const fd = new FormData(form);
  const kind = form.dataset.form;
  const at = nowIso();
  blur();
  if (kind === "ins1") {
    S.draft = { ...S.draft, firstName: String(fd.get("firstName")).trim(), lastName: String(fd.get("lastName")).trim(), particulier: fd.get("part") !== "non" };
    if (S.draft.particulier) S.draft.role = "particulier";
    const next = S.draft.particulier || S.draft.emailVerified ? "#/inscription/2" : "#/inscription/pro";
    const chosen = String(fd.get("lang") || "fr");
    if (chosen !== lang()) {
      S.lang = chosen;
      save();
      return translating(() => go(next));
    }
    save();
    return go(next);
  }
  if (kind === "pro") {
    S.draft = { ...S.draft, role: String(fd.get("role")), company: String(fd.get("company")).trim(), email: String(fd.get("email")).trim(), emailVerified: true };
    save();
    return go("#/inscription/2");
  }
  if (kind === "ins2") {
    S.draft = { ...S.draft, year: Number(fd.get("year")), kmMonth: Number(fd.get("kmMonth")) };
    save();
    return go("#/inscription/3");
  }
  if (kind === "ins3") {
    const d = S.draft;
    if (!d.communes?.length) return toast("Ajoute au moins une commune.");
    const univers = Object.keys(D.ROLES).find((u) => d.role in D.ROLES[u]) ?? "general";
    S.profile = { firstName: d.firstName, lastName: d.lastName, role: d.role, univers, company: d.particulier === false ? d.company ?? null : null, proEmail: d.email ?? null, model: d.model, vehicleId: d.vehicleId, year: d.year, kmMonth: d.kmMonth, color: "", communes: d.communes, home: "", work: "", availability: String(fd.get("availability")), consentAt: at };
    S.network = d.particulier === false ? "en_verification" : "accepte";
    S.draft = {};
    save();
    return loading("Création de ton profil…", () => go("#/bienvenu"));
  }
  if (kind === "p-identite") {
    S.profile = { ...S.profile, firstName: String(fd.get("firstName")).trim(), lastName: String(fd.get("lastName")).trim() };
    save();
    closeSheet();
    return render();
  }
  if (kind === "p-voiture") {
    const modelName = String(fd.get("model")).trim();
    const item = D.CATALOG.find((x) => x.name.toLowerCase() === modelName.toLowerCase());
    S.profile = { ...S.profile, model: item?.name ?? modelName, vehicleId: item?.vehicleId ?? S.profile.vehicleId, year: Number(fd.get("year")), kmMonth: Number(fd.get("kmMonth")) };
    save();
    closeSheet();
    return render();
  }
  if (kind === "p-commune") {
    const name = String(fd.get("commune")).trim();
    if (!name) return;
    S.profile.communes = L.cleanCommunes([...S.profile.communes, name]);
    save();
    render();
    return openSheet("pCommunes");
  }
  if (kind === "edit") {
    const modelName = String(fd.get("model")).trim();
    const item = D.CATALOG.find((x) => x.name.toLowerCase() === modelName.toLowerCase());
    S.profile = { ...S.profile, firstName: String(fd.get("firstName")).trim(), lastName: String(fd.get("lastName")).trim(), model: item?.name ?? modelName, vehicleId: item?.vehicleId ?? S.profile.vehicleId, year: Number(fd.get("year")), kmMonth: Number(fd.get("kmMonth")) };
    save();
    toast("Profil enregistré.");
    return back();
  }
  if (kind === "complement") {
    const id = form.dataset.id;
    const thumb = await thumbnail(fd.get("photo"));
    const reply = String(fd.get("reply") ?? "").trim() || (thumb ? "Photo jointe." : "Voilà, c'est fait.");
    S.apps[id] = { ...L.transition(S.apps[id], "completer", at, "Complément envoyé"), complementThumb: thumb, reply };
    save();
    toast("Réponse envoyée à AdsMove.");
    return render();
  }
  if (kind === "reading") {
    const run = currentRun();
    const raw = String(fd.get("odometer")).replace(/\D/g, "");
    const check = L.checkReading(lastReading(run), raw ? Number(raw) : NaN, today());
    if (!check.ok) return toast(check.error);
    run.readings.push({ at: today(), odometer: Number(raw), km: check.km, communes: L.cleanCommunes(S.draft.zones ?? []), thumb: null, flags: check.flags, status: "submitted" });
    S.draft.zones = [];
    save();
    render();
    return openSheet("releveOk");
  }
}

function thumbnail(file) {
  return new Promise((resolve) => {
    if (!(file instanceof File) || !file.size) return resolve(null);
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 200 / Math.max(im.width, im.height));
      const cv = Object.assign(document.createElement("canvas"), { width: Math.round(im.width * k), height: Math.round(im.height * k) });
      cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      resolve(cv.toDataURL("image/jpeg", 0.6));
    };
    im.onerror = () => (URL.revokeObjectURL(url), resolve(null));
    im.src = url;
  });
}

// ---------- Saisie assistée : on choisit, le clavier se ferme ----------
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function showAc(input) {
  const kind = input.dataset.ac;
  const list = $(`#ac-${kind}`);
  if (!list) return;
  const q = norm(input.value.trim());
  let items = [];
  if (kind.startsWith("car")) items = D.CATALOG.filter((x) => (!q || norm(x.name).includes(q)) && x.name !== input.value).map((x) => [x.name, D.VEHICLES[x.vehicleId].body]);
  else {
    const have = new Set(kind === "commune" ? S.draft.communes ?? [] : kind === "pcommune" ? S.profile.communes : S.draft.zones ?? []);
    items = D.COMMUNES.filter((x) => q && norm(x).includes(q) && !have.has(x)).map((x) => [x, ""]);
  }
  items = items.slice(0, 4);
  const pick = { car: "pick-car", "car-edit": "pick-car-edit", commune: "pick-commune", pcommune: "pick-pcommune", zone: "pick-zone" }[kind];
  list.innerHTML = items.map(([v, s]) => `<li><button type="button" data-act="${pick}" data-v="${esc(v)}">${icon(kind.startsWith("car") ? "car" : "pin")}<span>${esc(v)}</span>${s ? `<small>${s}</small>` : ""}</button></li>`).join("") || (q ? `<li class="none">Aucun résultat.</li>` : "");
  list.classList.toggle("on", Boolean(list.innerHTML));
}
function hideAc() {
  document.querySelectorAll(".ac.on").forEach((l) => l.classList.remove("on"));
}

// ---------- Glisser pour valider ----------
function initSliders(root) {
  root.querySelectorAll("[data-slide]").forEach((track) => {
    const knob = track.querySelector(".knob");
    let x0 = null, max = 0, dx = 0;
    const done = () => {
      track.classList.add("slid");
      knob.style.transform = `translateX(${max}px)`;
      setTimeout(() => act(track.dataset.slide, track), 200);
    };
    knob.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      x0 = e.clientX;
      max = track.clientWidth - knob.offsetWidth - 8;
      knob.setPointerCapture?.(e.pointerId);
      track.classList.add("drag");
    });
    knob.addEventListener("pointermove", (e) => {
      if (x0 == null) return;
      dx = Math.max(0, Math.min(max, e.clientX - x0));
      knob.style.transform = `translateX(${dx}px)`;
      track.style.setProperty("--p", String(dx / max));
    });
    const end = () => {
      if (x0 == null) return;
      x0 = null;
      track.classList.remove("drag");
      if (dx >= max * 0.85) return done();
      dx = 0;
      knob.style.transform = "";
      track.style.setProperty("--p", "0");
    };
    knob.addEventListener("pointerup", end);
    knob.addEventListener("pointercancel", end);
    knob.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        max = track.clientWidth - knob.offsetWidth - 8;
        done();
      }
    });
  });
}

// ---------- Simulation des actions AdsMove (démo uniquement) ----------
function demo(name, el) {
  const id = el?.dataset.id;
  const at = nowIso();
  const run = currentRun();
  const log = (msg) => (S.log.unshift(`${day(today())} · ${msg}`), (S.log = S.log.slice(0, 10)));
  switch (name) {
    case "d-day": S.offset += 1; log("+1 jour"); break;
    case "d-week": S.offset += 7; log("+1 semaine"); break;
    case "d-network": S.network = "accepte"; log("Inscription validée"); break;
    case "d-accept": S.apps[id] = L.transition(S.apps[id], "accepter", at); log(`${campaign(id).advertiser} : acceptée`); break;
    case "d-complement": S.apps[id] = L.transition(S.apps[id], "demander_complement", at, "Peux-tu nous envoyer une photo du côté gauche de ta voiture, en plein jour ?"); log("Complément demandé"); break;
    case "d-refuse": S.apps[id] = L.transition(S.apps[id], "refuser", at, "La campagne cherche des voitures dans d'autres communes."); log("Candidature refusée"); break;
    case "d-countersign": S.contract[id] = { ...S.contract[id], countersigned: true }; S.booking = { ...S.booking, status: "confirme" }; log("Contrat contresigné, pose confirmée"); break;
    case "d-pose": {
      const s = parseSlot(S.booking.slotId);
      const c = campaign(S.booking.campaignId);
      S.offset = Math.max(S.offset, L.diffDays(REAL_TODAY, s.date));
      S.runs.push({ campaignId: c.id, poseOn: s.date, deposeOn: L.addMonths(s.date, c.months), startOdometer: D.POSE_ODOMETER, readings: [], status: "active" });
      S.booking = { ...S.booking, status: "posee" };
      S.endSeen = false;
      log(`Pose effectuée (compteur ${D.POSE_ODOMETER.toLocaleString("fr-BE")} km)`);
      break;
    }
    case "d-approve": run.readings.forEach((r) => r.status === "submitted" && (r.status = "approved")); log("Relevés validés"); break;
    case "d-reject": { const r = run.readings.findLast((x) => x.status === "submitted"); if (r) r.status = "rejected"; log("Dernier relevé refusé"); break; }
    case "d-to-depose": S.offset = Math.max(S.offset, L.diffDays(REAL_TODAY, run.deposeOn)); log("Date de fin de campagne"); break;
    case "d-depose": {
      run.status = "terminee";
      run.readings.forEach((r) => r.status === "submitted" && (r.status = "approved"));
      run.readings.push({ at: today(), odometer: lastReading(run).odometer, km: 0, communes: [], thumb: null, flags: ["releve_poseur"], status: "approved" });
      S.apps[run.campaignId] = { ...S.apps[run.campaignId], status: "terminee" };
      log("Dépose effectuée");
      break;
    }
    case "d-pay": {
      const m = money();
      const due = m.validated - m.paid;
      if (due > 0) S.payments.push({ at: today(), amount: due, label: "Par AdsMove, sur ton compte" });
      const last = lastRun();
      if (last?.status === "terminee" && money().validated - money().paid <= 0) last.settled = true;
      log(`Versement de ${eur(due)}`);
      break;
    }
    case "d-reset": S = fresh(); break;
    default: return;
  }
  save();
  render();
  if (name === "d-pay") openSheet("versement");
}

function demoPanel() {
  const run = currentRun();
  const b = (label, actName, attrs = "", cls = "") => `<button class="dbtn ${cls}" data-act="${actName}" ${attrs}>${label}</button>`;
  const rows = [];
  if (S.profile && S.network !== "accepte") rows.push(["Réseau", b("Valider l'inscription", "d-network")]);
  const a = activeApp();
  if (a) {
    const [id, app] = a;
    const c = campaign(id);
    if (app.status === "en_attente") rows.push([c.advertiser, S.network === "accepte" ? b("Accepter", "d-accept", `data-id="${id}"`) + b("Complément", "d-complement", `data-id="${id}"`, "o") + b("Refuser", "d-refuse", `data-id="${id}"`, "o") : `<small>Valide d'abord l'inscription.</small>`]);
    if (app.status === "acceptee" && S.contract[id]?.signed && S.booking?.status === "reserve") rows.push(["Contrat", b("AdsMove contresigne", "d-countersign", `data-id="${id}"`)]);
  }
  if (S.booking?.status === "confirme") rows.push(["Pose", b("Faire la pose", "d-pose")]);
  if (run?.status === "active") {
    if (run.readings.some((r) => r.status === "submitted")) rows.push(["Relevés", b("Valider", "d-approve") + b("Refuser le dernier", "d-reject", "", "o")]);
    rows.push(["Fin", today() >= run.deposeOn ? b("Dépose effectuée", "d-depose") : b("Aller à la fin", "d-to-depose", "", "o")]);
  }
  const m = money();
  if (m.validated - m.paid > 0) rows.push(["Paiement", b(`Verser ${eur(m.validated - m.paid)}`, "d-pay")]);
  const key = stack.at(-1)?.view.key ?? "";
  const f = FB.data[key] ?? {};
  return `<div class="demo-in">
    <div class="demo-head"><strong>Simulation AdsMove</strong><button class="dclose" data-act="demo-open" aria-label="Fermer">${icon("x")}</button></div>
    <p class="intro">Ces boutons jouent le rôle d'AdsMove. Ils n'existent pas dans l'app réelle.</p>
    <div class="drow"><span>Date</span><div><b>${dateLong(today())}</b>${b("+1 jour", "d-day", "", "o")}${b("+1 semaine", "d-week", "", "o")}</div></div>
    ${rows.map(([k, v]) => `<div class="drow"><span>${esc(k)}</span><div>${v}</div></div>`).join("") || `<p class="intro">Rien à décider pour l'instant.</p>`}
    ${S.log.length ? `<ul class="dlog">${S.log.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : ""}
    <div class="drow"><span></span><div>${b("Repartir de zéro", "d-reset", "", "o")}</div></div>
    <div class="fbk">
      <strong>Ton avis sur cet écran</strong>
      <span class="fine">Écran : ${esc(key)}. Je lis tes avis directement, puis je les efface une fois traités.</span>
      <div class="fb-v"><button class="dbtn ${f.vote === "like" ? "" : "o"}" data-act="fb" data-v="like" data-key="${esc(key)}">J'aime</button><button class="dbtn ${f.vote === "dislike" ? "" : "o"}" data-act="fb" data-v="dislike" data-key="${esc(key)}">J'aime pas</button></div>
      <textarea id="fb-c" data-key="${esc(key)}" placeholder="Ce qui va, ce qui ne va pas">${esc(f.comment ?? "")}</textarea>
      <span class="fine" id="fb-st">${FB.note}</span>
    </div>
  </div>`;
}

// ---------- Avis écran par écran, enregistrés pour que je les lise ----------
const FB = { db: null, data: {}, note: "" };
async function fbSave(key, patch) {
  FB.data[key] = { ...(FB.data[key] ?? {}), ...patch, at: new Date().toISOString() };
  try { localStorage.setItem("adsmove-avis-v2", JSON.stringify(FB.data)); } catch {}
  if (!FB.db) { FB.note = "Enregistré dans ce navigateur."; return paintFbNote(); }
  try { await FB.db.doc(`avis/${key}`).set(FB.data[key]); FB.note = "Enregistré."; } catch { FB.note = "Pas enregistré, réessaie."; }
  paintFbNote();
}
const paintFbNote = () => { const n = $("#fb-st"); if (n) n.textContent = FB.note; };
function feedback(el) {
  const key = el.dataset.key;
  fbSave(key, { vote: FB.data[key]?.vote === el.dataset.v ? null : el.dataset.v });
  $("#demo").innerHTML = demoPanel();
}
async function fbConnect() {
  try { Object.assign(FB.data, JSON.parse(localStorage.getItem("adsmove-avis-v2") || "{}")); } catch {}
  FB.db = (await (window.claude?.use ? window.claude.use("db").catch(() => null) : null)) ?? null;
  FB.note = FB.db ? "Tes avis me parviennent." : "Avis gardés dans ce navigateur.";
  if (FB.db) FB.db.collection("avis").onSnapshot((snap) => { FB.data = Object.fromEntries(snap.docs.map((d) => [d.id, { ...d.data() }])); if (!$("#fb-c")?.matches(":focus")) $("#demo").innerHTML = demoPanel(); }, () => {});
  $("#demo").innerHTML = demoPanel();
}

// ---------- Navigation ----------
let stack = [];
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}
function route() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  if (!S.profile && parts[0] !== "inscription") return screens.bienvenue();
  const [name, ...args] = parts;
  if (!name) return screens.accueil();
  const fn = screens[name];
  return fn ? fn(...args) : notFound();
}
function resolve() {
  let view = route();
  for (let i = 0; view.redirect && i < 3; i++) {
    history.replaceState(null, "", view.redirect);
    view = route();
  }
  return view;
}
function pageHtml(view) {
  if (view.kind === "bare") return `<div class="body">${view.html}</div>`;
  if (view.kind === "detail")
    return `<div class="hero-zone">${view.hero}</div><button class="rnd float" data-act="back" aria-label="Retour">${icon("back")}</button>
      <div class="dscroll" data-dscroll><i class="ds-space"></i><div class="panel"><button class="pn-grip" data-grip aria-label="Agrandir ou réduire la fiche"></button><div class="pn-body">${view.html}</div></div></div>${view.bar ? `<div class="bar">${view.bar}</div>` : ""}`;
  const head = view.kind === "root"
    ? `<header class="ph root"><h1 class="title">${view.title}</h1><a class="avatar sm" href="#/profil" aria-label="Mon profil">${esc(S.profile?.firstName?.[0] ?? "")}</a></header>`
    : `<header class="ph"><button class="rnd" data-act="back" aria-label="Retour">${icon("back")}</button><span class="ph-t">${view.title ?? ""}</span><span></span></header>`;
  return `${head}<div class="body ${view.fixed ? "fixed" : ""}">${view.html}</div>${view.bar ? `<div class="bar">${view.bar}</div>` : ""}`;
}
function build(view) {
  const el = document.createElement("section");
  el.className = `page k-${view.kind} ${view.dark ? "dark" : ""} ${view.cls ?? ""}`;
  el.innerHTML = pageHtml(view);
  translate(el);
  return el;
}
function layout() {
  const n = stack.length;
  stack.forEach(({ el }, i) => {
    el.style.zIndex = String(i + 1);
    el.classList.toggle("under", n - 1 - i === 1 && stack.at(-1).view.kind !== "detail");
    el.classList.toggle("buried", n - 1 - i > 1);
  });
  const top = stack.at(-1);
  const view = top?.view;
  $("#app").classList.toggle("with-tabs", Boolean(view && view.kind === "root"));
  $("#app").classList.toggle("dark-tabs", Boolean(view && view.kind === "root" && view.dark));
  $(".phone")?.classList.toggle("light", Boolean(view && !view.dark && view.kind !== "detail"));
  const tabs = [["accueil", "#/", "home", "Accueil"], ["campagnes", "#/campagnes", "car", committed() ? "Ma campagne" : "Campagnes"], ["gains", "#/gains", "euro", "Gains"]];
  $("#tabs").innerHTML = tabs.map(([k, href, ic, label]) => `<a href="${href}" class="${view?.tab === k ? "on" : ""}" ${view?.tab === k ? 'aria-current="page"' : ""}>${icon(ic)}<span>${label}</span></a>`).join("");
  translate($("#tabs"));
  if (!$("#fb-c")?.matches(":focus")) $("#demo").innerHTML = demoPanel();
  document.title = `${(view?.title || "").replace(/<[^>]+>/g, "") || "App"} · adsmove`;
  if (top) {
    initList(top.el);
    initDetail(top.el);
  }
}
function navigate() {
  closeSheet();
  hideAc();
  const view = resolve();
  const hash = location.hash || "#/";
  const pages = $("#pages");
  const at = stack.findIndex((p) => p.hash === hash);
  if (at >= 0 && at < stack.length - 1) {
    const leaving = stack.slice(at + 1);
    stack = stack.slice(0, at + 1);
    const target = stack[at];
    const el = build(view);
    target.el.replaceWith(el);
    Object.assign(target, { el, view });
    layout();
    for (const p of leaving) {
      p.el.classList.add(p.view.kind === "detail" ? "fade-out" : "leave");
      setTimeout(() => p.el.remove(), reduced() ? 0 : 380);
    }
    return;
  }
  if (at === stack.length - 1 && at >= 0) return render();
  const el = build(view);
  const top = stack.at(-1);
  if (!["page", "detail"].includes(view.kind) || !stack.length || top?.view.kind === "bare") {
    const old = stack;
    stack = [{ hash, el, view }];
    el.classList.add("fresh");
    pages.append(el);
    layout();
    old.forEach((p) => p.el.remove());
    return;
  }
  stack.push({ hash, el, view });
  const cls = view.kind === "detail" ? "rise" : "enter";
  el.classList.add(cls);
  pages.append(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove(cls)));
  layout();
}
function render() {
  const top = stack.at(-1);
  const hash = location.hash || "#/";
  if (!top || top.hash !== hash) return navigate();
  const view = resolve();
  if ((location.hash || "#/") !== hash) return navigate();
  const body = top.el.querySelector(".body, .pn-body");
  const sc = body?.scrollTop ?? 0;
  const list = top.el.querySelector("[data-clist]")?.scrollTop ?? 0;
  const focusId = document.activeElement?.id;
  const el = build(view);
  top.el.replaceWith(el);
  Object.assign(top, { el, view });
  layout();
  const nb = el.querySelector(".body, .pn-body");
  if (nb) nb.scrollTop = sc;
  const nl = el.querySelector("[data-clist]");
  if (nl) nl.scrollTop = list;
  const f = focusId && document.getElementById(focusId);
  if (f && f.matches("#f-q")) {
    f.focus();
    f.setSelectionRange?.(f.value.length, f.value.length);
  }
  if (sheetState) openSheet(sheetState.name, sheetState.id, sheetState.v);
}
function back() {
  if (stack.length > 1) go(stack[stack.length - 2].hash);
  else go("#/");
}

/** Liste des campagnes : la carte du haut est grande ; en montant, la petite du dessous grandit et prend sa place. */
function initList(root) {
  const list = root.querySelector("[data-clist]");
  if (!list) return;
  const cards = [...list.querySelectorAll(".ccard")];
  const snaps = [...list.querySelectorAll(".cl-snap")];
  const STEP = 210, BIG = 286, SMALL = 96, GAP = 12;
  snaps.at(-1).style.height = `${list.clientHeight}px`;
  const update = () => {
    const f = Math.max(0, Math.min(cards.length - 1, list.scrollTop / STEP));
    const k = Math.floor(f), t = f - k;
    let y = 0;
    cards.forEach((card, i) => {
      let p = 0, top = y, op = 1;
      if (i < k) { p = 1; top = -(BIG + GAP); op = 0; }
      else if (i === k) { p = 1; top = -t * (BIG + GAP); op = 1 - t * 0.85; y = top + BIG + GAP; }
      else if (i === k + 1) { p = t; y += SMALL + t * (BIG - SMALL) + GAP; }
      else y += SMALL + GAP;
      card.style.setProperty("--p", p.toFixed(3));
      card.style.setProperty("--o", (p < 0.5 ? Math.max(0, 1 - p * 7) : Math.max(0, (p - 0.82) * 5.6)).toFixed(2)); // le texte s'efface en changeant de place
      card.style.transform = `translateY(${top.toFixed(1)}px)`;
      card.style.opacity = op.toFixed(2);
      card.style.visibility = i < k ? "hidden" : "";
    });
  };
  list.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  update();
}

/** Fiche d'une campagne : images qui glissent, fiche à deux crans façon Apple (repos, ouvert), jamais plus bas que le repos. */
function initDetail(root) {
  const gal = root.querySelector("[data-gal]");
  if (gal) {
    const dots = root.querySelectorAll(".gal-dots i");
    gal.addEventListener("scroll", () => { const i = Math.round(gal.scrollLeft / gal.clientWidth); dots.forEach((d, j) => d.classList.toggle("on", j === i)); }, { passive: true });
  }
  const sc = root.querySelector("[data-dscroll]");
  if (!sc) return;
  const body = sc.querySelector(".pn-body");
  const max = () => sc.scrollHeight - sc.clientHeight;
  const sync = () => {
    const open = sc.scrollTop >= max() - 2;
    sc.classList.toggle("open", open);
    if (!open && body.scrollTop) body.scrollTop = 0;
  };
  sc.addEventListener("scroll", sync, { passive: true });
  sc.querySelector("[data-grip]").addEventListener("click", () => sc.scrollTo({ top: sc.classList.contains("open") ? 0 : max(), behavior: reduced() ? "auto" : "smooth" }));
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("on"), 2600);
}
function clock() {
  const el = $("#clock");
  if (el) el.textContent = new Date().toLocaleTimeString("fr-BE", { hour: "numeric", minute: "2-digit" });
}

document.addEventListener("click", (e) => {
  if (e.target.matches(".sh-bg")) return closeSheet();
  if (!e.target.closest(".ac-wrap")) hideAc();
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled || el.matches("[data-slide]")) return;
  if (el.matches('input[type="radio"], input[type="checkbox"]')) return act(el.dataset.act, el);
  e.preventDefault();
  try {
    act(el.dataset.act, el);
  } catch (err) {
    toast(err.message);
  }
});
document.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-form]");
  if (!form) return;
  e.preventDefault();
  submit(form).catch((err) => toast(err.message));
});
document.addEventListener("input", (e) => {
  if (e.target.matches("[data-ac]")) return showAc(e.target);
  if (e.target.matches('[data-filter="q"]')) {
    ui.q = e.target.value;
    clearTimeout(ui.t);
    ui.t = setTimeout(render, 300);
  }
  if (e.target.matches("#fb-c")) {
    clearTimeout(ui.fbt);
    FB.note = "…";
    paintFbNote();
    ui.fbt = setTimeout(() => fbSave(e.target.dataset.key, { comment: e.target.value.trim() }), 900);
  }
});
document.addEventListener("focusin", (e) => e.target.matches?.("[data-ac]") && showAc(e.target));
document.addEventListener("change", (e) => {
  if (e.target.matches("[data-reminder]")) {
    S.reminderDays = [...document.querySelectorAll("[data-reminder]:checked")].map((x) => Number(x.value));
    save();
    toast(S.reminderDays.length ? "Rappels enregistrés." : "Aucun rappel : pense à tes relevés.");
  }
  if (e.target.matches('input[type="file"]')) {
    const label = e.target.closest(".file")?.querySelector("span");
    if (label && e.target.files[0]) label.textContent = "Photo ajoutée";
    e.target.closest(".clip")?.classList.add("on");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSheet();
  if (e.key === "Enter" && e.target.matches?.("[data-ac]")) {
    e.preventDefault();
    $(`#ac-${e.target.dataset.ac} button`)?.click();
  }
});
window.addEventListener("hashchange", navigate);
window.addEventListener("storage", (e) => e.key === KEY && ((S = load()), render()));
// Images préchargées : elles s'affichent tout de suite dans les fiches et les feuilles.
for (const c of D.CAMPAIGNS) [c.ad, c.adWide, c.hero, ...Object.values(c.visuals).flatMap((v) => Object.values(v))].filter(Boolean).forEach((src) => (new Image().src = src));
D.CAMPAIGNS.forEach((c) => c.poster && (new Image().src = c.poster));
["img/welcome.webp", "img/created.webp"].forEach((src) => (new Image().src = src));
Object.values(D.VEHICLES).forEach((v) => (new Image().src = v.front));
initSheetDrag();
navigate();
fbConnect();
clock();
setInterval(clock, 30_000);
setTimeout(() => $("#splash")?.classList.add("off"), reduced() ? 0 : 900);
