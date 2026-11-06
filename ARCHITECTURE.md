# Site public

| Élément | Rôle |
|---|---|
| `src/i18n/` | Textes par langue. `fr` est active |
| `src/home.py` | Gabarit et styles du site |
| `src/build.py` | Génère `premium-v2/` : `python3 src/build.py` |
| `shared/site.js` | Navigation, formats, zones, devis |
| `shared/config.js` | Adresse de réception des devis |
| `shared/img`, `shared/fonts` | Images et police |
| `archive/` | Versions écartées, consultables |

**Langues.** Ajouter `src/i18n/nl.py` ou `en.py`, puis la langue dans `LOCALES` de `build.py`. Le sélecteur n'apparaît qu'une fois une langue complète et relue.

**Applications futures.** L'espace annonceur, l'espace conducteur et le CRM restent dans le dépôt produit `Agence-Com`. Ils partageront la table `leads` et les textes de marque, sans dépendre de ce site statique.

**Maquette en cours.** `site/` est généré par `python3 src/site_build.py` depuis `src/site_index.html`. Premier écran, concept et styles sont figés ; expertise et application gardent des variantes, choisies dans le panneau en haut à gauche.
