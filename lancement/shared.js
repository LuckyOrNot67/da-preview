// Formulaires de lancement adsmove : profils, questions, validation et e-mail d'invitation.
// Ce fichier sert à la fois aux pages (navigateur) et au serveur (routes /api/lancement).

/** Types de champ : text, email, tel, number, choice (un choix), multi (plusieurs choix), area (texte libre). */
const identite = (vous) => [
  { id: "firstName", label: "Prénom", type: "text", required: true, max: 60, autocomplete: "given-name" },
  { id: "lastName", label: "Nom", type: "text", required: true, max: 60, autocomplete: "family-name" },
  { id: "email", label: "E-mail", type: "email", required: true, max: 120, autocomplete: "email" },
  { id: "phone", label: "Téléphone", type: "tel", required: true, max: 30, autocomplete: "tel", hint: vous ? "Pour vous rappeler si besoin." : "Pour te rappeler si besoin." },
];
const voiture = [
  { id: "carModel", label: "Marque et modèle", type: "text", required: true, max: 80, placeholder: "Ex. Volkswagen Polo" },
  { id: "carYear", label: "Année", type: "number", required: true, min: 1995, max: 2100, placeholder: "Ex. 2021" },
  { id: "kmMonth", label: "Kilomètres par mois, à peu près", type: "number", required: true, min: 0, max: 30000, placeholder: "Ex. 1200" },
];
const zones = (vous) => [
  { id: "homeCommune", label: vous ? "Commune du siège" : "Ta commune", type: "text", required: true, max: 80, placeholder: "Ex. Ixelles" },
  { id: "communes", label: vous ? "Communes où vos véhicules roulent le plus" : "Communes où tu roules le plus", type: "text", required: true, max: 200, placeholder: "Ex. Bruxelles, Etterbeek, Uccle", hint: "Déclarées par toi. Aucune localisation n'est collectée.".replace("par toi", vous ? "par vous" : "par toi") },
];
const message = (vous) => ({ id: "message", label: vous ? "Un mot à ajouter ?" : "Un mot à ajouter ?", type: "area", required: false, max: 600 });

export const PROFILES = {
  particulier: {
    label: "Particulier",
    vous: false,
    title: "Ta voiture, parmi les premières.",
    lead: "adsmove se lance. Inscris-toi : on te recontacte dès qu'une campagne correspond à ta voiture et à tes trajets.",
    groups: [
      { title: "Toi", fields: identite(false) },
      { title: "Ta voiture", fields: voiture },
      { title: "Tes zones", fields: [...zones(false), { id: "availability", label: "Pour la pose, tu es plutôt disponible", type: "choice", required: true, options: ["En semaine", "Le week-end", "Les deux"] }] },
      { title: "Pour finir", fields: [message(false)] },
    ],
  },
  independant: {
    label: "Indépendant",
    vous: false,
    title: "Ton véhicule de travail, parmi les premiers.",
    lead: "adsmove se lance. Inscris ton activité : on te recontacte dès qu'une campagne correspond à ton véhicule et à tes trajets.",
    groups: [
      { title: "Toi", fields: identite(false) },
      { title: "Ton activité", fields: [
        { id: "company", label: "Nom de ton activité ou de ta société", type: "text", required: true, max: 100 },
        { id: "sector", label: "Ton métier", type: "text", required: true, max: 100, placeholder: "Ex. plombier, livreur, infirmière à domicile" },
      ] },
      { title: "Ton véhicule", fields: [{ id: "vehicleType", label: "Type de véhicule", type: "choice", required: true, options: ["Voiture", "Utilitaire"] }, ...voiture] },
      { title: "Tes zones", fields: zones(false) },
      { title: "Pour finir", fields: [message(false)] },
    ],
  },
  "taxi-independant": {
    label: "Taxi indépendant",
    vous: false,
    title: "Ton taxi, parmi les premiers.",
    lead: "adsmove se lance. Inscris ton taxi : on te recontacte dès qu'une campagne correspond à tes zones.",
    groups: [
      { title: "Toi", fields: identite(false) },
      { title: "Ton taxi", fields: [
        { id: "company", label: "Nom d'exploitation", type: "text", required: false, max: 100 },
        { id: "licenceCommune", label: "Commune ou région de ta licence", type: "text", required: true, max: 80, placeholder: "Ex. Région de Bruxelles-Capitale" },
        ...voiture,
        { id: "shift", label: "Tu roules plutôt", type: "choice", required: true, options: ["De jour", "De nuit", "Les deux"] },
      ] },
      { title: "Tes zones", fields: zones(false) },
      { title: "Pour finir", fields: [message(false)] },
    ],
  },
  "taxi-flotte": {
    label: "Flotte de taxis",
    vous: true,
    title: "Votre flotte de taxis, parmi les premières.",
    lead: "adsmove se lance. Présentez votre flotte : nous vous recontactons pour voir ensemble ce qui est possible.",
    groups: [
      { title: "Vous", fields: [...identite(true), { id: "role", label: "Votre fonction", type: "text", required: true, max: 80 }] },
      { title: "Votre société", fields: [
        { id: "company", label: "Nom de la société", type: "text", required: true, max: 100 },
        { id: "fleetSize", label: "Nombre de taxis", type: "number", required: true, min: 2, max: 5000 },
        { id: "fleetModels", label: "Modèles principaux", type: "text", required: false, max: 200, placeholder: "Ex. Toyota Corolla, Tesla Model 3" },
        { id: "licenceCommune", label: "Commune ou région des licences", type: "text", required: true, max: 80 },
      ] },
      { title: "Vos zones", fields: zones(true) },
      { title: "Pour finir", fields: [message(true)] },
    ],
  },
  "societe-flotte": {
    label: "Société avec flotte",
    vous: true,
    title: "Votre flotte, parmi les premières.",
    lead: "adsmove se lance. Présentez votre flotte : nous vous recontactons pour voir ensemble ce qui est possible.",
    groups: [
      { title: "Vous", fields: [...identite(true), { id: "role", label: "Votre fonction", type: "text", required: true, max: 80 }] },
      { title: "Votre société", fields: [
        { id: "company", label: "Nom de la société", type: "text", required: true, max: 100 },
        { id: "sector", label: "Secteur d'activité", type: "text", required: true, max: 100 },
        { id: "fleetSize", label: "Nombre de véhicules", type: "number", required: true, min: 2, max: 100000 },
        { id: "fleetTypes", label: "Types de véhicules", type: "multi", required: true, options: ["Voitures", "Utilitaires", "Camions"] },
      ] },
      { title: "Vos zones", fields: zones(true) },
      { title: "Pour finir", fields: [message(true)] },
    ],
  },
};

export const PROFILE_IDS = Object.keys(PROFILES);
// Suivi d'une inscription : Nouveau, puis Contacté, puis Retenu ou Recalé.
export const STATUSES = { nouveau: "Nouveau", contacte: "Contacté", retenu: "Retenu", recale: "Recalé" };
export const fieldsOf = (profile) => PROFILES[profile]?.groups.flatMap((g) => g.fields) ?? [];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
export const isEmail = (v) => EMAIL.test(clean(v));

/**
 * Vérifie et nettoie une inscription. Ne garde que les champs du profil : tout le reste est ignoré.
 * Le consentement doit être donné explicitement ; le champ piège `website` doit rester vide.
 */
export function validateSignup(input) {
  const profile = clean(input?.profile);
  if (!PROFILES[profile]) return { ok: false, errors: { profile: "Profil inconnu." } };
  const vous = PROFILES[profile].vous;
  if (clean(input.website)) return { ok: false, errors: { form: "Envoi refusé." } };
  const errors = {};
  const answers = {};
  for (const f of fieldsOf(profile)) {
    const raw = input.answers?.[f.id];
    if (f.type === "multi") {
      const picked = (Array.isArray(raw) ? raw : []).map(clean).filter((x) => f.options.includes(x));
      if (f.required && !picked.length) errors[f.id] = "Choisis au moins une réponse.".replace("Choisis", vous ? "Choisissez" : "Choisis");
      answers[f.id] = picked;
      continue;
    }
    const v = clean(raw);
    if (!v) {
      if (f.required) errors[f.id] = "À remplir.";
      continue;
    }
    if (f.type === "email" && !isEmail(v)) errors[f.id] = "Cette adresse ne semble pas valide.";
    else if (f.type === "tel" && v.replace(/\D/g, "").length < 8) errors[f.id] = "Ce numéro semble trop court.";
    else if (f.type === "choice" && !f.options.includes(v)) errors[f.id] = "Réponse inconnue.";
    else if (f.type === "number") {
      const n = Number(v.replace(",", "."));
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < f.min || n > f.max) errors[f.id] = `Un nombre entier entre ${f.min} et ${f.max}.`;
      else answers[f.id] = n;
      continue;
    } else if (v.length > (f.max ?? 200)) errors[f.id] = `${f.max ?? 200} caractères au plus.`;
    answers[f.id] = f.type === "email" ? v.toLowerCase() : v;
  }
  if (input.consent !== true) errors.consent = vous ? "Votre accord est nécessaire pour enregistrer l'inscription." : "Ton accord est nécessaire pour enregistrer ton inscription.";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { profile, answers, consent: true, invite: clean(input.invite).slice(0, 40) || null } };
}

/** Vérifie une invitation préparée dans le CRM. `asked` : la personne a demandé à être contactée. */
export function validateInvite(input) {
  const errors = {};
  const profile = clean(input?.profile);
  const email = clean(input?.email).toLowerCase();
  const phone = clean(input?.phone);
  if (!PROFILES[profile]) errors.profile = "Choisis un profil.";
  if (!isEmail(email)) errors.email = "Cette adresse ne semble pas valide.";
  if (phone && phone.replace(/\D/g, "").length < 8) errors.phone = "Ce numéro semble trop court.";
  if (input?.asked !== true) errors.asked = "À cocher : on n'écrit qu'aux personnes qui l'ont demandé.";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { profile, email, phone, firstName: clean(input.firstName).slice(0, 60), asked: true } };
}

export const formLink = (base, profile, invite) => `${String(base).replace(/[#?].*$/, "")}${invite ? `?i=${encodeURIComponent(invite)}` : ""}#${profile}`;

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** E-mail d'invitation aux couleurs adsmove : noir, blanc cassé, gris. Rien d'autre qu'un lien vers le formulaire. */
export function inviteEmail({ profile, firstName, link }) {
  const p = PROFILES[profile];
  const vous = p.vous;
  const hello = firstName ? `Bonjour ${firstName},` : "Bonjour,";
  const subject = "adsmove se lance : ton inscription".replace("ton inscription", vous ? "votre inscription" : "ton inscription");
  const body = vous
    ? "Suite à notre échange, voici le formulaire pour inscrire votre flotte au lancement d'adsmove. Il prend deux minutes. Nous vous recontactons ensuite."
    : "Suite à notre échange, voici le formulaire pour t'inscrire au lancement d'adsmove. Il prend deux minutes. On te recontacte ensuite.";
  const what = vous
    ? "adsmove est une agence belge de publicité sur véhicules : des marques habillent des voitures qui roulent déjà."
    : "adsmove est une agence belge de publicité sur véhicules : des marques habillent des voitures qui roulent déjà, et les conducteurs sont rémunérés selon les conditions de chaque campagne.";
  const stop = vous ? "Vous ne souhaitez plus être contacté ? Répondez simplement STOP à cet e-mail." : "Tu ne souhaites plus être contacté ? Réponds simplement STOP à cet e-mail.";
  const cta = "Remplir le formulaire";
  const text = `${hello}\n\n${body}\n\n${cta} : ${link}\n\n${what}\n\n${stop}\n\nadsmove`;
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#0B0B0D;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0D;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding:0 4px 28px;font:800 22px/1 'Inter Tight','Arial Black',Arial,sans-serif;letter-spacing:-0.02em;color:#F4F4F2;">adsmove</td></tr>
<tr><td style="padding:32px 28px;border-radius:24px;background:#161618;">
<p style="margin:0 0 10px;font:600 12px/1.4 Inter,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;color:#A2A2A8;">Lancement · ${esc(p.label)}</p>
<h1 style="margin:0 0 18px;font:800 30px/1.02 'Inter Tight','Arial Black',Arial,sans-serif;letter-spacing:-0.02em;text-transform:uppercase;color:#F4F4F2;">${esc(p.title)}</h1>
<p style="margin:0 0 12px;font:400 16px/1.5 Inter,Arial,sans-serif;color:#F4F4F2;">${esc(hello)}</p>
<p style="margin:0 0 26px;font:400 16px/1.5 Inter,Arial,sans-serif;color:#F4F4F2;">${esc(body)}</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background:#F4F4F2;"><a href="${esc(link)}" style="display:inline-block;padding:16px 28px;font:600 16px/1 Inter,Arial,sans-serif;color:#0B0B0D;text-decoration:none;">${cta} &rarr;</a></td></tr></table>
<p style="margin:26px 0 0;font:400 13px/1.5 Inter,Arial,sans-serif;color:#A2A2A8;">Le bouton ne marche pas ? Copie ce lien : <a href="${esc(link)}" style="color:#F4F4F2;">${esc(link)}</a></p>
</td></tr>
<tr><td style="padding:22px 6px 0;font:400 13px/1.5 Inter,Arial,sans-serif;color:#A2A2A8;">${esc(what)}<br><br>${esc(stop)}</td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}
