# Contenu commun : les trois sites présentent exactement la même offre.
SUB = "Agence de communication créative spécialisée dans la publicité sur véhicules. Nous créons vos campagnes, posons le covering et les diffusons dans vos zones."
TAG = "Agence de publicité sur véhicules"
CONCEPT = dict(
    t="Votre publicité ne reste plus sur place.",
    p="Une affiche attend qu'on passe devant elle. Nous transformons des véhicules du quotidien en supports publicitaires mobiles : votre message se déplace dans les zones que vous avez choisies.",
    pts=[("Un véhicule du quotidien", "Il roule déjà, tous les jours."),
         ("Une création sur mesure", "Dessinée pour sa carrosserie."),
         ("Une campagne qui circule", "Dans les zones que vous choisissez.")],
)
EXP = dict(t="Notre expertise", items=[
    ("Conception graphique", "Direction artistique et concept de campagne, pensés pour un support en mouvement."),
    ("Création et adaptation", "Nous créons vos visuels ou adaptons les vôtres aux surfaces de chaque véhicule."),
    ("Covering et pose", "Préparation, impression et pose du film par nos équipes, hors vitres."),
    ("Diffusion sur véhicules", "Votre campagne circule sur un réseau de véhicules, dans les zones définies."),
    ("Suivi des campagnes", "Kilomètres éligibles, zones couvertes et données disponibles, réunis dans vos rapports."),
])
FMT = dict(t="Trois formats, une même voiture.", p="Choisissez la surface qui porte votre message. La création s'adapte à chaque format.",
           names=["Classique", "Medium", "Complet"],
           desc=["Le message sur les deux portières.", "Les portières, l'avant et les rétroviseurs.", "Toute la carrosserie, hors vitres."],
           incl=[("Portières", "012"), ("Avant", "12"), ("Rétroviseurs", "12"), ("Arrière", "2"), ("Toit", "2")],
           note="Formats provisoires. Surfaces à valider techniquement. Tarifs établis sur devis.")
ZON = dict(t="Votre campagne, vos zones.", p="Vous choisissez où votre message circule, avec combien de véhicules et pendant combien de temps. Composez une simulation.",
           note="Simulation sans données de diffusion. Les villes sont des exemples : aucune n'est présentée comme couverte aujourd'hui. Les zones disponibles dépendent du réseau et sont confirmées dans le devis.",
           leg=[("a", "Ville proposée"), ("b", "Votre sélection, en simulation"), ("c", "Zone disponible : confirmée au devis")])
CRE = dict(t="Nos créations.", p="Deux démonstrations, de la création à plat au véhicule habillé. Concepts graphiques fictifs, sans marque ni client.",
           items=[("Arcs", "SUV compact · format Complet", "crea1", "p1_proof", "p1_detail", "SUV compact en parking béton, habillé d'arcs crème, noirs et vermillon"),
                  ("Vague", "Citadine · format Complet", "crea3", "p2_proof", "p2_detail", "Petite citadine magenta habillée d'une vague crème")])
FLOW = dict(t="Comment ça fonctionne.", steps=[
    ("Demande de devis", "Vous nous expliquez vos besoins et vos objectifs."),
    ("Proposition créative", "Nous préparons une proposition et un devis."),
    ("Création et validation", "Notre équipe crée ou adapte les visuels, puis vous les validez."),
    ("Pose du covering", "Nous organisons la pose sur les véhicules."),
    ("Diffusion", "Les véhicules circulent selon les conditions de la campagne."),
    ("Suivi et bilan", "Vous recevez les données et rapports disponibles."),
])
ASK = dict(t="Votre prochaine campagne prend la route&nbsp;?", p="Dites-nous ce que vous voulez faire connaître et où. Nous revenons vers vous avec une proposition et un devis.", small="Pas de paiement en ligne : chaque campagne est préparée sur devis.")
FOOT = "Aperçu de travail. Le nom roam est provisoire. Images et vidéos créées par IA, modèles sans logo et sans lien avec les constructeurs. Les créations sont des démonstrations, sans client réel."
NAV = [("concept", "Concept"), ("expertise", "Expertise"), ("formats", "Formats"), ("zones", "Zones"), ("parcours", "Comment ça marche")]


def head(title, fonts, css):
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>{title}</title>
<meta name="description" content="{SUB}">
<script>if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('still')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{fonts}&display=swap">
<style>{css}</style>
</head>
<body>
'''


def nav_links():
    return ''.join(f'<a href="#{i}">{t}</a>' for i, t in NAV)


def sheet():
    return f'<div class="sheet" data-sheet id="sheet">{nav_links()}<a href="#devis">Demander un devis</a><a class="sm" href="#conducteur">Devenir conducteur</a></div>'


def pic(n, alt, cls='', w=1344, h=752, lazy=True):
    l = ' loading="lazy" decoding="async"' if lazy else ''
    c = f' class="{cls}"' if cls else ''
    return f'<img{c}{l} src="../shared/img/{n}.webp" alt="{alt}" width="{w}" height="{h}">'


def fmt_block(key, base='car_base', sizes='(max-width:800px) 100vw,70vw'):
    tabs = ''.join(f'<button role="tab" id="ft{i}" aria-selected="{"true" if i == 1 else "false"}" aria-controls="fpanel"{"" if i == 1 else " tabindex=-1"}>{n}</button>' for i, n in enumerate(FMT['names']))
    src = lambda n: f'srcset="../shared/img/{n}_m.webp 900w,../shared/img/{n}.webp 1800w" sizes="{sizes}" src="../shared/img/{n}.webp"'
    imgs = ''.join(f'<img class="fi" data-fi {src(key + "_" + k)} alt="Format {FMT["names"][i]} : {FMT["desc"][i].lower()}" width="1800" height="616" decoding="async">' for i, k in enumerate(['classique', 'medium', 'complet']))
    incl = ''.join(f'<li data-z="{z}">{t}</li>' for t, z in FMT['incl'])
    d = ' '.join(f'data-d{i}="{x}"' for i, x in enumerate(FMT['desc']))
    return dict(tabs=f'<div class="tabs" role="tablist" aria-label="Format de covering">{tabs}</div>',
                car=f'<div class="fcar"><img {src(base)} alt="" aria-hidden="true" width="1800" height="616" decoding="async">{imgs}</div>',
                desc=f'<h3 data-fdesc {d}></h3>', incl=f'<ul class="incl">{incl}</ul>', note=f'<p class="note">{FMT["note"]}</p>')


def zones_controls():
    f = lambda i, t: f'<fieldset class="opt"><legend>{t}</legend><div class="chips" id="{i}"></div></fieldset>'
    return f('z-cities', 'Villes') + f('z-scope', 'Zone ciblée') + f('z-cars', 'Véhicules') + f('z-dur', 'Durée de diffusion') + f('z-fmt', 'Format de covering')


def zones_map():
    leg = ''.join(f'<li class="{c}">{t}</li>' for c, t in ZON['leg'])
    return f'<canvas role="img" aria-label="Carte de Belgique : simulation des zones choisies autour des villes sélectionnées"></canvas><ul class="legend">{leg}</ul>'


def zones_sum(cls='btn'):
    return f'<div class="sum"><p data-zsum aria-live="polite"></p><a class="{cls}" data-zuse href="#devis">Imaginer cette campagne</a></div><p class="note">{ZON["note"]}</p>'


def quote_form(cls='btn'):
    fld = lambda n, lab, t='text', req=False, ac='': f'<label for="q-{n}">{lab}{" *" if req else ""}</label><input id="q-{n}" name="{n}" type="{t}"{" required" if req else ""}{f" autocomplete={ac}" if ac else ""} aria-describedby="{n}-err"><span class="err" id="{n}-err"></span>'
    return f'''<form data-quote novalidate>
<div>{fld("nom", "Nom", req=True, ac="name")}</div>
<div>{fld("societe", "Société", req=True, ac="organization")}</div>
<div>{fld("email", "E-mail", "email", True, "email")}</div>
<div>{fld("tel", "Téléphone", "tel", ac="tel")}</div>
<div><label for="q-zones">Villes ou zones</label><input id="q-zones" name="zones"></div>
<div><label for="q-format">Format envisagé</label><select id="q-format" name="format"><option value="">Je ne sais pas encore</option><option>Classique</option><option>Medium</option><option>Complet</option></select></div>
<div class="w"><label for="q-besoin">Votre besoin</label><textarea id="q-besoin" name="besoin" rows="3"></textarea></div>
<div class="w send"><button class="{cls}" type="submit">Demander un devis</button><p data-sent role="status"></p></div>
</form>'''


def footer():
    return f'<footer id="conducteur"><details><summary>Devenir conducteur</summary><p>Vous roulez beaucoup et votre voiture est en bon état ? Le parcours de candidature arrive bientôt.</p></details><p class="fine">{FOOT}</p></footer>'


# Base commune : remise à zéro, champs, zones, panneau de navigation mobile.
BASE = '''
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:76px}
html.still{scroll-behavior:auto}
body{margin:0;overflow-x:clip;-webkit-font-smoothing:antialiased}
h1,h2,h3,p,ol,ul,figure,fieldset{margin:0;padding:0;border:0}ol,ul{list-style:none}
a{color:inherit}img,video,canvas{display:block;max-width:100%}
img{height:auto}
button,input,select,textarea{font:inherit;color:inherit}
button{appearance:none;background:none;border:0;cursor:pointer}
:focus-visible{outline:2.5px solid currentColor;outline-offset:3px}
.menu{display:none}
.sheet{position:fixed;z-index:79;inset:0;display:none;flex-direction:column;justify-content:center;gap:8px;padding:80px var(--g) 30px}
.sheet.on{display:flex}
.sheet .sm{margin-top:18px;font-size:16px!important;font-weight:500!important;letter-spacing:0!important}
.fcar{position:relative;aspect-ratio:1800/616}
.fcar img{position:absolute;inset:0;width:100%;height:100%}
.fcar .fi{opacity:0;transition:opacity .35s ease}
.fcar .fi.on{opacity:1}
.incl{display:flex;flex-wrap:wrap;gap:6px 18px}
.incl li{display:flex;align-items:center;gap:7px;opacity:.55;transition:opacity .25s}
.incl li:before{content:"";flex:none;width:10px;height:10px;border-radius:50%;border:1.5px solid currentColor;transition:background .25s}
.incl li.on{opacity:1}
.incl li.on:before{background:var(--acc,currentColor);border-color:var(--acc,currentColor)}
canvas{width:100%;height:auto;aspect-ratio:256/210}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chips label{position:relative;cursor:pointer}
.chips input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}
.chips span{display:flex;align-items:center;min-height:40px;padding:0 14px;transition:background .2s,color .2s,border-color .2s}
.chips input:focus-visible+span{outline:2.5px solid currentColor;outline-offset:2px}
.legend{display:flex;flex-wrap:wrap;gap:6px 20px}
.legend li{display:flex;align-items:center;gap:8px}
.legend li:before{content:"";width:11px;height:11px;border-radius:50%;flex:none}
.opt{margin-top:16px}
.opt legend{padding:0;margin-bottom:7px}
form{display:grid;grid-template-columns:1fr 1fr;gap:14px}
form label{display:block;margin-bottom:6px}
form .w{grid-column:1/-1}
form input,form select,form textarea{display:block;width:100%;min-height:48px;padding:12px;border-radius:0;font-size:16px}
.err{display:block;min-height:0;font-size:14px;margin-top:4px}
.send{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.send p{font-size:15px}
footer{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:18px 50px;padding:26px var(--g) 30px;font-size:14px}
footer summary{cursor:pointer;font-weight:600}
footer details p{margin-top:6px}
.fine{max-width:70ch}
.rv{opacity:0;transform:translateY(14px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.8,.2,1)}
.rv.in{opacity:1;transform:none}
.still .rv{opacity:1;transform:none;transition:none}
.still *{animation:none!important;transition:none!important}
@media (max-width:980px){.navl{display:none!important}.menu{display:inline-flex;align-items:center}}
@media (max-width:640px){form{grid-template-columns:1fr}footer{grid-template-columns:1fr}}
'''
