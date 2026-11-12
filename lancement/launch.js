// Formulaires de lancement (un par profil) et CRM adsmove, dans la même page. La vue dépend de l'ancre : #particulier, #crm…
import { PROFILES, PROFILE_IDS, STATUSES, fieldsOf, validateSignup, validateInvite, inviteEmail, formLink } from "./shared.js";
import { openStore } from "./store.js";

const $ = (s, r = document) => r.querySelector(s);
const root = $("#root");
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const date = (iso) => new Date(iso).toLocaleDateString("fr-BE", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const invite = new URLSearchParams(location.search).get("i") ?? "";
// Sans serveur (page de démonstration), rien n'est envoyé : on le dit clairement au visiteur.
const demoNote = () => (store?.mode === "essai" ? '<p class="demo">Démonstration : ce formulaire n\'envoie rien à adsmove pour l\'instant.</p>' : "");

let store = null;
let toastTimer = null;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("on"), 2600);
}
async function copy(text, ok = "Copié.") {
  try {
    await navigator.clipboard.writeText(text);
    toast(ok);
  } catch {
    window.prompt("Copie ce texte :", text);
  }
}

// ---------- Choix du profil
const HINTS = {
  particulier: "Ta voiture personnelle",
  independant: "Ton véhicule de travail",
  "taxi-independant": "Ton taxi",
  "taxi-flotte": "Plusieurs taxis",
  "societe-flotte": "Les véhicules de votre société",
};
function viewPick() {
  document.body.className = "";
  document.title = "Lancement adsmove";
  root.innerHTML = `<div class="wrap rise">
    <header class="top"><span class="logo" role="img" aria-label="adsmove"></span><span class="tag">Lancement</span></header>
    <div><p class="eye">Publicité sur véhicules</p><h1 class="disp">Tu roules déjà. Fais partie des premiers.</h1>
    <p class="lead">adsmove se lance en Belgique. Dis-nous qui tu es : le formulaire prend deux minutes.</p>${demoNote()}</div>
    <nav class="pick" aria-label="Choisis ton profil">${PROFILE_IDS.map((id) => `<a href="#${id}"><span><b>${esc(PROFILES[id].label)}</b><span>${esc(HINTS[id])}</span></span><span class="arr">${ARROW}</span></a>`).join("")}</nav>
    <div id="team"></div>
  </div>`;
  watchCrm(repaint);
  paintTeam();
}

// ---------- Formulaire
const control = (f) => {
  const opt = f.required ? "" : ' <span class="opt">facultatif</span>';
  if (f.type === "choice" || f.type === "multi")
    return `<div class="fld" data-f="${f.id}"><span class="lbl" id="l-${f.id}">${esc(f.label)}${opt}</span>
      <div class="opts" role="${f.type === "choice" ? "radiogroup" : "group"}" aria-labelledby="l-${f.id}">${f.options.map((o) => `<label><input type="${f.type === "choice" ? "radio" : "checkbox"}" name="${f.id}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join("")}</div><span class="err" hidden></span></div>`;
  const attrs = `id="f-${f.id}" name="${f.id}" ${f.required ? "required" : ""} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ""} ${f.autocomplete ? `autocomplete="${f.autocomplete}"` : 'autocomplete="off"'}`;
  const input = f.type === "area" ? `<textarea ${attrs} maxlength="${f.max}"></textarea>` : `<input ${attrs} ${f.type === "number" ? 'inputmode="numeric"' : `type="${f.type}" maxlength="${f.max}"`}>`;
  return `<div class="fld" data-f="${f.id}"><label for="f-${f.id}">${esc(f.label)}${opt}</label>${input}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ""}<span class="err" hidden></span></div>`;
};
const PAIRS = [["firstName", "lastName"], ["carYear", "kmMonth"]];
function fieldsHtml(fields) {
  const out = [];
  for (let i = 0; i < fields.length; i++) {
    const pair = PAIRS.find(([a, b]) => fields[i].id === a && fields[i + 1]?.id === b);
    if (pair) out.push(`<div class="two">${control(fields[i])}${control(fields[++i])}</div>`);
    else out.push(control(fields[i]));
  }
  return out.join("");
}
function viewForm(id) {
  const p = PROFILES[id];
  document.body.className = "";
  document.title = `${p.label} · Lancement adsmove`;
  const consent = p.vous
    ? "J'accepte qu'adsmove enregistre ces informations pour me recontacter au sujet de son lancement. Elles ne sont ni vendues ni partagées, et je peux en demander la suppression à tout moment."
    : "J'accepte qu'adsmove enregistre ces informations pour me recontacter au sujet de son lancement. Elles ne sont ni vendues ni partagées, et je peux en demander la suppression à tout moment.";
  root.innerHTML = `<div class="wrap">
    <header class="top"><span class="lft"><a class="bk" href="#" aria-label="Retour au choix du profil">${BACK}</a><span class="logo" role="img" aria-label="adsmove"></span></span><span class="tag">${esc(p.label)}</span></header>
    <div class="rise"><div><h1 class="disp">${esc(p.title)}</h1><p class="lead">${esc(p.lead)}</p>${demoNote()}</div>
    <form class="form" id="signup" novalidate>
      ${p.groups.map((g) => `<fieldset class="grp" style="border:0;margin:0"><h2>${esc(g.title)}</h2>${fieldsHtml(g.fields)}</fieldset>`).join("")}
      <div class="trap" aria-hidden="true"><label>Ne pas remplir <input name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="consent" data-f="consent"><label><input type="checkbox" name="consent"><span>${consent}</span></label><span class="err" hidden></span></div>
      <button class="btn wide" type="submit"><span>Envoyer mon inscription</span>${ARROW}</button>
      <p class="fine">${p.vous ? "S'inscrire n'engage à rien : ce n'est ni un contrat ni une campagne." : "T'inscrire n'engage à rien : ce n'est ni un contrat ni une campagne."} Aucune localisation n'est collectée.</p>
    </form></div>
  </div>`;
  $("#signup").addEventListener("submit", (e) => submitSignup(e, id));
}
async function submitSignup(e, profile) {
  e.preventDefault();
  const form = e.currentTarget;
  const fd = new FormData(form);
  const answers = {};
  for (const f of fieldsOf(profile)) answers[f.id] = f.type === "multi" ? fd.getAll(f.id) : fd.get(f.id);
  const check = validateSignup({ profile, answers, consent: fd.get("consent") === "on", website: fd.get("website"), invite });
  form.querySelectorAll("[data-f]").forEach((el) => {
    const msg = check.ok ? null : check.errors[el.dataset.f];
    el.classList.toggle("bad", Boolean(msg));
    const err = $(".err", el);
    err.hidden = !msg;
    err.textContent = msg ?? "";
  });
  if (!check.ok) {
    const first = form.querySelector(".bad");
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
    first?.querySelector("input, textarea")?.focus({ preventScroll: true });
    return toast(check.errors.form ?? "Il manque une ou deux réponses.");
  }
  const button = $("button[type=submit]", form);
  button.disabled = true;
  $("span", button).textContent = "Envoi…";
  try {
    await store.addSignup(check.value);
    viewDone(profile, check.value.answers.firstName);
  } catch (err) {
    button.disabled = false;
    $("span", button).textContent = "Envoyer mon inscription";
    toast(err.message || "L'envoi n'a pas marché. Réessaie dans un instant.");
  }
}
function viewDone(profile, firstName) {
  const vous = PROFILES[profile].vous;
  root.innerHTML = `<div class="wrap"><header class="top"><span class="logo" role="img" aria-label="adsmove"></span><span class="tag">Lancement</span></header>
    <div class="done rise"><span class="tick">${CHECK}</span><p class="eye">Merci${firstName ? `, ${esc(firstName)}` : ""}</p><h1 class="disp">C'est noté.</h1>
    <p class="lead">${store.mode === "essai" ? "Démonstration : le formulaire fonctionne, mais rien n'a été envoyé à adsmove." : vous ? "Votre inscription est enregistrée. Nous vous recontactons par e-mail ou par téléphone." : "Ton inscription est enregistrée. On te recontacte par e-mail ou par téléphone."}</p></div></div>`;
  scrollTo(0, 0);
}

// ---------- CRM : une page par formulaire, puis la fiche de chaque inscription
const STAGES = ["nouveau", "contacte", "retenu", "recale"];
const stageOf = (s) => (s.status === "ecarte" ? "recale" : STAGES.includes(s.status) ? s.status : "nouveau");
const crm = { view: "home", form: null, stage: "tous", open: null, signups: undefined, invites: undefined, base: null, draft: null, watching: false };
const fullName = (s) => `${s.answers?.firstName ?? ""} ${s.answers?.lastName ?? ""}`.trim() || "Sans nom";
const baseUrl = () => crm.base || location.href.replace(/[#?].*$/, "");
const inCrm = () => location.hash === "#crm";
const BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
function ago(iso) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  return d < 31 ? `il y a ${d} j` : date(iso);
}
const ofForm = (id) => (crm.signups ?? []).filter((s) => s.profile === id);
const fresh = (list) => list.filter((s) => stageOf(s) === "nouveau").length;
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

function watchCrm(repaint) {
  if (crm.watching || !store.admin) return;
  crm.watching = true;
  store.watchSignups((list) => { crm.signups = list; repaint(); });
  store.watchInvites((list) => { crm.invites = list; repaint(); });
  store.getBase().then((b) => { if (b) { crm.base = b; repaint(); } });
}
const repaint = () => (inCrm() ? paintCrm() : location.hash.length < 2 ? paintTeam() : null);

/** Sur la page de choix du profil : l'accès au CRM, visible par l'équipe seulement. */
function paintTeam() {
  const slot = $("#team");
  if (!slot || !store.admin) return;
  const n = fresh(crm.signups ?? []);
  slot.innerHTML = `<a class="team" href="#crm"><span><b>${store.mode === "essai" ? "Démo du CRM" : "CRM de l'équipe"}</b><span>${crm.signups ? (n ? plural(n, "nouvelle inscription", "nouvelles inscriptions") : plural(crm.signups.length, "inscription", "inscriptions")) : "Inscriptions, invitations et liens"}</span></span><span class="arr">${ARROW}</span></a>`;
}

function viewCrm() {
  document.body.className = "crm";
  document.title = "CRM adsmove";
  if (!store.admin) {
    root.innerHTML = `<div class="crm-bar"><a class="bk" href="#" aria-label="Retour aux formulaires">${BACK}</a><span class="logo"></span></div><div class="crm-w"><div><h1>Réservé à l'équipe</h1><p class="sub">Cette page n'est visible que par adsmove. ${store.mode === "serveur" ? '<a href="/login">Se connecter</a>' : ""}</p></div></div>`;
    return;
  }
  watchCrm(repaint);
  paintCrm();
}
function paintCrm() {
  const active = document.activeElement;
  const keep = active?.id && /^(i-|n-|b-)/.test(active.id) ? { id: active.id, value: active.value, at: active.selectionStart } : null;
  const back = crm.view === "home" ? `<a class="bk" href="#" aria-label="Retour au choix du profil">${BACK}</a>` : `<button class="bk" data-nav="${crm.view === "fiche" ? "form" : "home"}" aria-label="Retour">${BACK}</button>`;
  const where = crm.view === "home" ? "CRM · Lancement" : esc(PROFILES[crm.form]?.label ?? "");
  root.innerHTML = `<div class="crm-bar">${back}<span class="logo" role="img" aria-label="adsmove"></span><span class="tag">${where}</span></div>
    <div class="crm-w">${crm.view === "fiche" ? crmFiche() : crm.view === "form" ? crmForm() : crmHome()}</div>`;
  if (crm.view === "form" && crm.draft) paintMail();
  if (keep) { const el = document.getElementById(keep.id); if (el) { el.value = keep.value; el.focus(); try { el.setSelectionRange(keep.at, keep.at); } catch {} } }
}

// --- Accueil du CRM : tous les formulaires
function crmHome() {
  const loading = crm.signups === undefined;
  const cards = PROFILE_IDS.map((id) => {
    const list = ofForm(id);
    const n = fresh(list);
    const last = list.map((s) => s.at).sort().pop();
    return `<button class="fcard" data-form="${id}"><span class="fc-top"><b>${esc(PROFILES[id].label)}</b>${n ? `<span class="pill st-nouveau">${plural(n, "nouvelle", "nouvelles")}</span>` : ""}</span>
      <span class="fc-n">${loading ? "–" : list.length}</span><span class="fc-l">${list.length > 1 ? "inscriptions" : "inscription"}${last ? ` · dernière ${ago(last)}` : ""}</span><span class="arr">${ARROW}</span></button>`;
  }).join("");
  return `<div><p class="eye">Lancement</p><h1>Formulaires</h1><p class="sub">Un formulaire par profil. Chacun garde ses inscriptions, son lien et ses invitations.</p></div>
    ${crm.signups === null ? `<p class="note">Impossible de lire les inscriptions pour l'instant.</p>` : ""}
    <div class="forms">${cards}</div>
    <div class="card pad"><div class="fld"><label for="b-base">Adresse publique de cette page</label><input id="b-base" value="${esc(crm.base ?? "")}" placeholder="${esc(location.href.replace(/[#?].*$/, ""))}"><span class="hint">C'est l'adresse que tes contacts ouvrent. Elle sert à fabriquer le lien de chaque formulaire et celui des e-mails d'invitation.</span></div><div><button class="btn sm" data-act="save-base">Enregistrer</button> <a class="btn line sm" href="#">Voir le choix du profil</a></div></div>
    <p class="note">${{ apercu: "Aperçu claude.ai : seules les personnes connectées à claude.ai, avec qui la page est partagée, peuvent envoyer un formulaire. Aucun e-mail ne part.", serveur: "CRM en ligne : les formulaires sont ouverts à tous, les réponses sont enregistrées sur le serveur adsmove.", essai: "Démonstration : les réponses restent dans ce navigateur, rien n'est envoyé à adsmove.", "hors-ligne": "" }[store.mode] ?? ""}</p>`;
}

// --- Page d'un formulaire : son lien, ses inscriptions par étape, ses invitations
const summary = (s) => [s.answers?.company ?? s.answers?.carModel, s.answers?.homeCommune].filter(Boolean).join(" · ");
function crmForm() {
  const id = crm.form;
  const p = PROFILES[id];
  const all = ofForm(id);
  const url = formLink(baseUrl(), id);
  const order = (s) => (stageOf(s) === "nouveau" ? 0 : 1);
  const list = all.filter((s) => crm.stage === "tous" || stageOf(s) === crm.stage).sort((a, b) => order(a) - order(b) || String(b.at).localeCompare(String(a.at)));
  const count = (st) => all.filter((s) => stageOf(s) === st).length;
  const inv = (crm.invites ?? []).filter((v) => v.profile === id).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  const d = crm.draft;
  return `<div><p class="eye">Formulaire</p><h1>${esc(p.label)}</h1></div>
    <div class="card linkrow"><span><small>Lien du formulaire</small><code>${esc(url)}</code></span><span class="acts"><button class="btn sm" data-copy="${esc(url)}">Copier</button><a class="btn line sm" href="#${id}">Ouvrir</a></span></div>
    <section class="blk"><h2>Inscriptions</h2>
      <div class="stages">${[["tous", "Toutes", all.length], ...STAGES.map((st) => [st, STATUSES[st], count(st)])].map(([k, l, n]) => `<button data-stage="${k}" aria-pressed="${crm.stage === k}">${l}<b>${n}</b></button>`).join("")}</div>
      <div class="card">${crm.signups === undefined ? `<p class="empty">Chargement…</p>` : list.length ? `<ul class="rows">${list.map((s) => { const st = stageOf(s); return `<li><button class="open" data-open="${esc(s.id)}"><span class="who">${st === "nouveau" ? '<i class="dot" aria-label="Nouveau"></i>' : ""}<span><strong>${esc(fullName(s))}</strong><small>${esc(summary(s))}</small></span></span><span class="mid"><small>${esc(ago(s.at))}</small></span><span class="pill st-${st}">${esc(STATUSES[st])}</span></button></li>`; }).join("")}</ul>` : `<p class="empty">${all.length ? "Aucune inscription à cette étape." : "Aucune inscription pour ce formulaire. Ouvre le lien ci-dessus pour en envoyer une d'essai."}</p>`}</div>
      ${all.length ? `<div><button class="btn line sm" data-act="csv">Copier la liste (CSV)</button></div>` : ""}
    </section>
    <section class="blk"><h2>Inviter quelqu'un</h2><p class="sub">Pour une personne qui a demandé à être contactée. Elle reçoit un e-mail adsmove avec le lien de ce formulaire.</p>
      <div class="inv">
        <form class="card pad" id="invite" novalidate>
          <div class="fld" data-f="email"><label for="i-email">E-mail</label><input id="i-email" name="email" type="email" maxlength="120" autocomplete="off" value="${esc(d?.email ?? "")}"><span class="err" hidden></span></div>
          <div class="fld" data-f="phone"><label for="i-phone">Téléphone <span class="opt">facultatif</span></label><input id="i-phone" name="phone" type="tel" maxlength="30" autocomplete="off" value="${esc(d?.phone ?? "")}"><span class="err" hidden></span></div>
          <div class="consent" data-f="asked"><label><input type="checkbox" name="asked" ${d?.asked ? "checked" : ""}><span>Cette personne m'a demandé à être contactée.</span></label><span class="err" hidden></span></div>
          <div><button class="btn" type="submit">Préparer l'e-mail</button></div>
        </form>
        <div class="mail-box">${d ? `<div id="mail" class="mail"></div>
          <div class="acts">${store.canSend ? `<button class="btn" data-act="send">Envoyer l'e-mail</button>` : ""}<button class="btn line" data-act="copy-link">Copier le lien</button><button class="btn line" data-act="copy-mail">Copier le texte</button></div>
          <p class="fine">${store.canSend ? "L'e-mail part depuis adsmove, via Resend, à cette seule personne." : "L'envoi automatique demande le CRM en ligne avec une clé Resend. En attendant, copie le lien ou le texte et envoie-le toi-même."}</p>` : `<p class="note">L'aperçu de l'e-mail apparaît ici.</p>`}</div>
      </div>
      ${inv.length ? `<div class="card"><ul class="rows">${inv.map((v) => `<li><span class="who"><span><strong>${esc(v.email)}</strong><small>${esc(v.phone || "")}</small></span></span><span class="mid"><small>${esc(ago(v.at))}</small></span><span class="pill ${v.status === "envoyee" ? "st-retenu" : "st-contacte"}">${v.status === "envoyee" ? "Envoyée" : "Préparée"}</span></li>`).join("")}</ul></div>` : ""}
    </section>`;
}
function paintMail() {
  const host = $("#mail");
  if (!host || !crm.draft) return;
  const mail = inviteEmail({ ...crm.draft, link: formLink(baseUrl(), crm.draft.profile, crm.draft.id) });
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  shadow.innerHTML = `<div style="background:#0B0B0D">${mail.html.replace(/^[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*$/, "")}</div>`;
  shadow.querySelectorAll("a").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
}

// --- Fiche d'une inscription
function crmFiche() {
  const s = (crm.signups ?? []).find((x) => x.id === crm.open);
  if (!s) return `<p class="note">Cette inscription n'existe plus.</p>`;
  const p = PROFILES[s.profile];
  const st = stageOf(s);
  const val = (f) => { const v = s.answers?.[f.id]; return Array.isArray(v) ? v.join(", ") : v; };
  const groups = p.groups.map((g) => ({ title: g.title, rows: g.fields.filter((f) => !["firstName", "lastName", "email", "phone"].includes(f.id)).map((f) => [f.label, val(f)]).filter(([, v]) => v !== undefined && v !== null && v !== "") })).filter((g) => g.rows.length);
  const contact = [["E-mail", s.answers?.email], ["Téléphone", s.answers?.phone]].filter(([, v]) => v);
  return `<div><p class="eye">${esc(p.label)} · reçue ${esc(ago(s.at))}</p><h1>${esc(fullName(s))}</h1><p class="sub">${esc(date(s.at))}${s.invite ? " · venue d'une invitation" : ""}</p></div>
    <div class="steps" role="group" aria-label="Suivi">${STAGES.map((k, i) => `<button class="st-${k}" data-set="${k}" aria-pressed="${st === k}"><small>${k === "recale" ? "ou" : i + 1}</small>${esc(STATUSES[k])}</button>`).join("")}</div>
    <div class="fgrid">
      <div class="card pad"><h2>Contact</h2><dl class="kv">${contact.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)} <button class="mini" data-copy="${esc(v)}">Copier</button></dd></div>`).join("")}</dl></div>
      ${groups.map((g) => `<div class="card pad"><h2>${esc(g.title)}</h2><dl class="kv">${g.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>`).join("")}
      <div class="card pad agree"><h2>Accord</h2><p><span class="okm">${CHECK}</span>Accord donné à l'envoi du formulaire, le ${esc(date(s.at))}, pour être recontacté au sujet du lancement.</p></div>
    </div>
    <div class="fld"><label for="n-note">Note interne</label><textarea id="n-note" data-note="${esc(s.id)}" placeholder="Visible par l'équipe uniquement">${esc(s.note ?? "")}</textarea></div>
    <div><button class="txt danger" data-del="${esc(s.id)}">Supprimer cette inscription</button></div>`;
}
const csv = () => {
  const fields = fieldsOf(crm.form);
  const cell = (v) => `"${String(Array.isArray(v) ? v.join(", ") : v ?? "").replace(/"/g, '""')}"`;
  return [["date", "suivi", ...fields.map((f) => f.label)].map(cell).join(";"), ...ofForm(crm.form).map((s) => [s.at, STATUSES[stageOf(s)], ...fields.map((f) => s.answers?.[f.id])].map(cell).join(";"))].join("\n");
};

let noteTimer = null;
document.addEventListener("click", async (e) => {
  if (!document.body.classList.contains("crm")) return;
  const t = e.target;
  const go = (patch) => { Object.assign(crm, patch); paintCrm(); scrollTo(0, 0); };
  const nav = t.closest("[data-nav]");
  if (nav) return go(nav.dataset.nav === "home" ? { view: "home", form: null, draft: null, open: null } : { view: "form", open: null });
  const form = t.closest("[data-form]");
  if (form) return go({ view: "form", form: form.dataset.form, stage: "tous", draft: null });
  const stage = t.closest("[data-stage]");
  if (stage) { crm.stage = stage.dataset.stage; return paintCrm(); }
  const open = t.closest("[data-open]");
  if (open) return go({ view: "fiche", open: open.dataset.open });
  const set = t.closest("[data-set]");
  if (set) {
    const s = (crm.signups ?? []).find((x) => x.id === crm.open);
    if (!s || stageOf(s) === set.dataset.set) return;
    s.status = set.dataset.set;
    paintCrm();
    return store.updateSignup(s.id, { status: s.status }).then(() => toast(`Suivi : ${STATUSES[s.status]}.`), () => toast("Mise à jour impossible."));
  }
  const del = t.closest("[data-del]");
  if (del) {
    if (del.dataset.armed !== "1") { del.dataset.armed = "1"; del.textContent = "Appuie encore pour supprimer définitivement"; return; }
    await store.deleteSignup(del.dataset.del).catch(() => toast("Suppression impossible."));
    return go({ view: "form", open: null });
  }
  const cp = t.closest("[data-copy]");
  if (cp) return copy(cp.dataset.copy);
  const act = t.closest("[data-act]")?.dataset.act;
  if (act === "csv") return copy(csv(), "Liste copiée.");
  if (act === "save-base") { crm.base = $("#b-base").value.trim() || null; await store.setBase(crm.base).catch(() => {}); toast("Adresse enregistrée."); return paintCrm(); }
  if (act === "copy-link") return copy(formLink(baseUrl(), crm.draft.profile, crm.draft.id), "Lien copié.");
  if (act === "copy-mail") { const m = inviteEmail({ ...crm.draft, link: formLink(baseUrl(), crm.draft.profile, crm.draft.id) }); return copy(`${m.subject}\n\n${m.text}`, "Texte copié."); }
  if (act === "send") {
    const b = t.closest("button");
    if (b.dataset.armed !== "1") { b.dataset.armed = "1"; b.textContent = `Confirmer l'envoi à ${crm.draft.email}`; return; }
    b.disabled = true;
    try {
      const r = await store.addInvite({ ...crm.draft, send: true, base: baseUrl() });
      toast(r.sent ? "E-mail envoyé." : r.reason || "E-mail non envoyé.");
      if (r.sent) crm.draft = null;
    } catch (err) { toast(err.message || "Envoi impossible."); }
    paintCrm();
  }
});
document.addEventListener("input", (e) => {
  // Une réponse corrigée n'est plus signalée en erreur.
  const bad = e.target.closest?.("[data-f]");
  if (bad && $(".err", bad) && !$(".err", bad).hidden) { bad.classList.remove("bad"); $(".err", bad).hidden = true; }
  const n = e.target.closest("[data-note]");
  if (!n) return;
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => store.updateSignup(n.dataset.note, { note: n.value.trim().slice(0, 2000) }).catch(() => toast("Note non enregistrée.")), 900);
});
document.addEventListener("submit", async (e) => {
  if (e.target.id !== "invite") return;
  e.preventDefault();
  const fd = new FormData(e.target);
  const check = validateInvite({ profile: crm.form, email: fd.get("email"), phone: fd.get("phone"), asked: fd.get("asked") === "on" });
  e.target.querySelectorAll("[data-f]").forEach((el) => {
    const msg = check.ok ? null : check.errors[el.dataset.f];
    const err = $(".err", el);
    err.hidden = !msg;
    err.textContent = msg ?? "";
  });
  if (!check.ok) return;
  try {
    const r = store.canSend ? { id: null } : await store.addInvite(check.value);
    crm.draft = { ...check.value, id: r.id };
  } catch (err) { return toast(err.message || "Impossible de préparer l'invitation."); }
  paintCrm();
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !inCrm() || crm.view === "home" || e.target.matches("input, textarea")) return;
  Object.assign(crm, crm.view === "fiche" ? { view: "form", open: null } : { view: "home", form: null, draft: null });
  paintCrm();
});

// ---------- Aiguillage
function route() {
  const name = decodeURIComponent(location.hash.replace(/^#/, ""));
  scrollTo(0, 0);
  if (name === "crm") return viewCrm();
  if (PROFILES[name]) return viewForm(name);
  return viewPick();
}
addEventListener("hashchange", route);
store = await openStore();
route();
