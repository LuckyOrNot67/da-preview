# Génère le site public depuis src/. Une langue s'ajoute ici quand sa traduction est complète et relue.
import pathlib,sys,importlib
SRC=pathlib.Path(__file__).parent
sys.path.insert(0,str(SRC))
import home
ROOT=SRC.parent
SITE=ROOT/'premium-v2'
LOCALES={'fr':''}   # plus tard : 'nl':'nl/', 'en':'en/'
(SITE).mkdir(exist_ok=True)
(SITE/'site.css').write_text(home.CSS)
for code,sub in LOCALES.items():
    T=importlib.import_module(f'i18n.{code}').T
    out=SITE/sub
    out.mkdir(exist_ok=True)
    (out/'index.html').write_text(home.page(T))
    (out/'confidentialite').mkdir(exist_ok=True)
    (out/'confidentialite/index.html').write_text(home.privacy(T))
