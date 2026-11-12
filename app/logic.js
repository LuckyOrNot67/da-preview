// Règles de l'app conducteur, sans accès au navigateur : testées avec Vitest.
const DAY = 86_400_000;
export const MAX_KM_PER_DAY = 800;

// ---------- Dates (chaînes AAAA-MM-JJ, en UTC pour éviter les décalages) ----------
export const toIso = (d) => d.toISOString().slice(0, 10);
export const parseIso = (iso) => new Date(`${iso}T00:00:00Z`);
export const addDays = (iso, n) => toIso(new Date(parseIso(iso).getTime() + n * DAY));
export const diffDays = (from, to) => Math.round((parseIso(to).getTime() - parseIso(from).getTime()) / DAY);
export const isoWeekday = (iso) => parseIso(iso).getUTCDay() || 7;
export function addMonths(iso, n) {
  const d = parseIso(iso);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return toIso(d);
}

// ---------- Relevés de compteur (mêmes règles que le CRM : src/lib/km.ts) ----------
export function checkReading(previous, odometer, atIso) {
  if (!Number.isInteger(odometer) || odometer < 0) return { ok: false, error: "Indique le compteur en kilomètres entiers." };
  if (!previous) return { ok: true, km: 0, flags: ["premier_releve"] };
  if (odometer < previous.odometer) return { ok: false, error: `Le compteur ne peut pas être inférieur au dernier relevé (${previous.odometer.toLocaleString("fr-BE")} km).` };
  const km = odometer - previous.odometer;
  const days = Math.max(1, diffDays(previous.at, atIso));
  return { ok: true, km, flags: km > days * MAX_KM_PER_DAY ? ["kilometrage_eleve"] : [] };
}

export function cleanCommunes(values) {
  const seen = new Map();
  for (const value of values) {
    const name = String(value).trim().replace(/\s+/g, " ").slice(0, 60);
    const key = name.toLocaleLowerCase("fr");
    if (name && !seen.has(key)) seen.set(key, name);
  }
  return [...seen.values()];
}

/** Prochain jour de rappel à partir d'aujourd'hui. Aucun rappel hors campagne active. */
export function nextReminder(days, todayIso, lastSubmittedIso, active) {
  if (!active || !days.length) return null;
  for (let i = 0; i < 8; i++) {
    const d = addDays(todayIso, i);
    if (days.includes(isoWeekday(d)) && d !== lastSubmittedIso) return d;
  }
  return null;
}

// ---------- Gains : estimé, validé et versé restent distincts ----------
/**
 * Hypothèse de démo, à remplacer par le contrat : forfait mensuel proratisé au jour (mois = 30 jours),
 * plafonné à la durée de la campagne.
 * - estimé : jours écoulés depuis la pose ;
 * - validé : jours couverts jusqu'au dernier relevé validé par AdsMove ;
 * - versé : virements effectués.
 */
export function earnings({ rate, poseOn, deposeOn, today, approvedUntil, payments = [] }) {
  if (!poseOn) return { estimated: 0, validated: 0, paid: sum(payments), activeDays: 0, totalDays: 0 };
  const totalDays = Math.max(0, diffDays(poseOn, deposeOn));
  const clamp = (iso) => Math.min(totalDays, Math.max(0, diffDays(poseOn, iso)));
  const activeDays = clamp(today);
  const validatedDays = approvedUntil ? Math.min(activeDays, clamp(approvedUntil)) : 0;
  const amount = (days) => Math.floor((rate * days) / 30);
  return { estimated: amount(activeDays), validated: amount(validatedDays), paid: sum(payments), activeDays, validatedDays, totalDays };
}
const sum = (payments) => payments.reduce((t, p) => t + p.amount, 0);

// ---------- Candidatures ----------
export const APPLICATION_STATUS = {
  en_attente: "En attente",
  complement: "Complément demandé",
  acceptee: "Acceptée",
  refusee: "Refusée",
  retiree: "Retirée",
};

const TRANSITIONS = {
  envoyer: { from: [null, "retiree"], to: "en_attente" },
  completer: { from: ["complement"], to: "en_attente" },
  demander_complement: { from: ["en_attente"], to: "complement" },
  accepter: { from: ["en_attente"], to: "acceptee" },
  refuser: { from: ["en_attente", "complement"], to: "refusee" },
  retirer: { from: ["en_attente", "complement"], to: "retiree" },
};

/** Change le statut d'une candidature. Une seule candidature par campagne : la reprise réutilise la même fiche. */
export function transition(app, action, at, note = null) {
  const rule = TRANSITIONS[action];
  if (!rule) throw new Error(`Action inconnue : ${action}`);
  const current = app?.status ?? null;
  if (!rule.from.includes(current)) throw new Error(`Impossible de « ${action} » depuis « ${current ?? "aucune"} ».`);
  const history = [...(app?.history ?? []), { status: rule.to, at, note }];
  return { ...(app ?? { sentAt: at }), status: rule.to, note, history };
}

export function canApply({ profile, campaign, application, today, busy }) {
  if (!profile) return { ok: false, reason: "Crée d'abord ton profil conducteur." };
  if (application && application.status !== "retiree") return { ok: false, reason: "Candidature déjà envoyée.", existing: true };
  if (campaign.applyUntil < today) return { ok: false, reason: "Cette campagne n'accepte plus de candidatures." };
  if (campaign.seatsLeft <= 0) return { ok: false, reason: "Cette campagne est complète." };
  if (!campaign.univers.includes(profile.univers)) return { ok: false, reason: "Cette campagne ne concerne pas ton univers." };
  if (!campaign.vehicles.includes(profile.vehicleId)) return { ok: false, reason: "Ton véhicule n'est pas compatible avec cette campagne." };
  if (busy) return { ok: false, reason: "Tu as déjà une campagne en cours." };
  return { ok: true };
}

// ---------- Créneaux de pose : jamais deux réservations sur le même créneau ----------
export function makeSlots(fromIso, { days = 10, hours = ["10:00", "14:00"], allow = (weekday) => weekday <= 5 } = {}) {
  const slots = [];
  for (let i = 0; slots.length < days * hours.length && i < days * 4; i++) {
    const d = addDays(fromIso, i);
    if (!allow(isoWeekday(d))) continue;
    for (const h of hours) slots.push({ id: `${d}T${h}`, date: d, time: h });
  }
  return slots;
}

export function book(taken, slotId, previousSlotId = null) {
  if (taken.includes(slotId)) return { ok: false, error: "Ce créneau vient d'être pris. Choisis-en un autre." };
  return { ok: true, taken: [...taken.filter((id) => id !== previousSlotId), slotId] };
}
