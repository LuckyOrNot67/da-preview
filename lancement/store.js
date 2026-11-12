// Où vont les inscriptions : la base de l'aperçu claude.ai, le serveur adsmove (/api/lancement), ou ce navigateur pour un simple essai.
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`).replace(/-/g, "").slice(0, 20);
const now = () => new Date().toISOString();

async function artifactStore(db) {
  // L'équipe écrit où elle veut ; une autre personne n'écrit que sa propre fiche (son identifiant sert de clé).
  let admin = false;
  let me = null;
  try {
    const user = await window.claude.use("user");
    admin = Boolean(await user?.canEdit());
    me = (await user?.id()) ?? null;
  } catch {}
  const watch = (name) => (cb) => db.collection(name).onSnapshot((snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => cb(null));
  return {
    mode: "apercu",
    admin,
    canSend: false,
    addSignup: (doc) => db.doc(`inscriptions/${admin || !me ? uid() : me}`).set({ ...doc, status: "nouveau", note: "", at: now() }),
    watchSignups: watch("inscriptions"),
    updateSignup: (id, patch) => db.doc(`inscriptions/${id}`).update(patch),
    deleteSignup: (id) => db.doc(`inscriptions/${id}`).delete(),
    addInvite: async (doc) => {
      const id = uid();
      await db.doc(`invitations/${id}`).set({ ...doc, status: "preparee", at: now() });
      return { id, sent: false };
    },
    watchInvites: watch("invitations"),
    deleteInvite: (id) => db.doc(`invitations/${id}`).delete(),
    getBase: async () => (await db.doc("config/main").get().catch(() => null))?.data?.()?.base ?? null,
    setBase: (base) => db.doc("config/main").set({ base }),
  };
}

async function apiStore(state) {
  const call = async (path, method = "GET", body) => {
    const r = await fetch(`/api/lancement/${path}`, { method, headers: body ? { "content-type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, credentials: "same-origin" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(data.error ?? "Erreur"), { errors: data.errors, status: r.status });
    return data;
  };
  const poll = (path, key) => (cb) => {
    let stop = false;
    const tick = () => call(path).then((d) => !stop && cb(d[key]), () => !stop && cb(null));
    tick();
    const t = setInterval(tick, 15000);
    return () => { stop = true; clearInterval(t); };
  };
  const refresh = { signups: null, invites: null };
  return {
    mode: "serveur",
    admin: state.admin,
    canSend: state.resend,
    addSignup: (doc) => call("inscriptions", "POST", doc),
    watchSignups: (cb) => { refresh.signups = () => call("inscriptions").then((d) => cb(d.inscriptions), () => cb(null)); return poll("inscriptions", "inscriptions")(cb); },
    updateSignup: (id, patch) => call(`inscriptions/${id}`, "PATCH", patch).then(() => refresh.signups?.()),
    deleteSignup: (id) => call(`inscriptions/${id}`, "DELETE").then(() => refresh.signups?.()),
    addInvite: (doc) => call("invitations", "POST", doc).then((d) => { refresh.invites?.(); return d; }),
    watchInvites: (cb) => { refresh.invites = () => call("invitations").then((d) => cb(d.invitations), () => cb(null)); return poll("invitations", "invitations")(cb); },
    deleteInvite: (id) => call(`invitations/${id}`, "DELETE").then(() => refresh.invites?.()),
    getBase: async () => null,
    setBase: async () => {},
  };
}

function localStore() {
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const subs = { "adsmove-l-ins": new Set(), "adsmove-l-inv": new Set() };
  const emit = (k) => subs[k].forEach((cb) => cb(read(k)));
  const watch = (k) => (cb) => { subs[k].add(cb); cb(read(k)); return () => subs[k].delete(cb); };
  const edit = (k, fn) => { write(k, fn(read(k))); emit(k); };
  return {
    mode: "essai",
    admin: true,
    canSend: false,
    addSignup: async (doc) => edit("adsmove-l-ins", (a) => [...a, { id: uid(), ...doc, status: "nouveau", note: "", at: now() }]),
    watchSignups: watch("adsmove-l-ins"),
    updateSignup: async (id, patch) => edit("adsmove-l-ins", (a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    deleteSignup: async (id) => edit("adsmove-l-ins", (a) => a.filter((x) => x.id !== id)),
    addInvite: async (doc) => { const id = uid(); edit("adsmove-l-inv", (a) => [...a, { id, ...doc, status: "preparee", at: now() }]); return { id, sent: false }; },
    watchInvites: watch("adsmove-l-inv"),
    deleteInvite: async (id) => edit("adsmove-l-inv", (a) => a.filter((x) => x.id !== id)),
    getBase: async () => null,
    setBase: async () => {},
  };
}

export async function openStore() {
  try {
    const db = window.claude?.use ? await window.claude.use("db") : null;
    if (db) return await artifactStore(db);
  } catch {}
  if (window.claude?.use) return { ...localStore(), mode: "hors-ligne", admin: false, addSignup: async () => { throw new Error("Connecte-toi à claude.ai pour envoyer ce formulaire d'aperçu."); } };
  try {
    const r = await fetch("/api/lancement/etat", { credentials: "same-origin" });
    if (r.ok) return await apiStore(await r.json());
  } catch {}
  return localStore();
}
