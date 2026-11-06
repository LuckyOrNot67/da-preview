# Génère les trois sites et leur index depuis le même contenu.
import pathlib,sys
sys.path.insert(0,str(pathlib.Path(__file__).parent))
import immersif,premium1,premium2
R=pathlib.Path(__file__).resolve().parents[2]
(R/'immersif/index.html').write_text(immersif.build())
(R/'premium-v1/index.html').write_text(premium1.build())
(R/'premium-v2/index.html').write_text(premium2.build())
