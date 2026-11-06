# Génère la maquette : une seule page, avec la présentation des trois formats.
import pathlib
ROOT=pathlib.Path(__file__).resolve().parent.parent
Z=['Portières','Avant','Rétroviseurs','Arrière','Toit']
# nom, phrase, véhicule, zones habillées, vues (image, description, points : libellé, x %, y %, à gauche)
F=[('Classique','Le message sur les deux portières.','Berline',1,[
     ('a1','Berline blanche vue de l\'avant, graphisme noir sur les portières',[('Avant libre',24,40,0),('Portières',66,54,0)]),
     ('a2','La même berline vue de l\'arrière, l\'arrière reste blanc',[('Portières',34,54,0),('Arrière libre',76,58,0)])]),
   ('Medium','Les portières, l\'avant et les rétroviseurs.','SUV compact',3,[
     ('b1','SUV vu de l\'avant, graphisme orange et noir sur le capot, l\'avant et les portières',[('Capot',30,36,0),('Avant',38,64,0),('Rétroviseur',74,28,1),('Portières',78,52,1)]),
     ('b2','Le même SUV vu de l\'arrière, le hayon reste blanc',[('Rétroviseur',17,32,0),('Portières',36,50,0),('Arrière libre',78,60,1)])]),
   ('Complet','Toute la carrosserie, hors vitres.','Petit utilitaire',5,[
     ('c1','Utilitaire vu de l\'avant, entièrement habillé de bandes bleues et blanches',[('Capot',17,51,0),('Toit',58,19,0),('Flancs',66,60,0)]),
     ('c2','Le même utilitaire vu de l\'arrière, habillage jusqu\'aux portes arrière',[('Toit',46,16,0),('Flancs',28,58,0),('Portes arrière',84,46,1)])])]
snav=''.join(f'<button data-k="{k}">{f[0]}</button>' for k,f in enumerate(F))
stx=''.join(f'''<div class="tx{' on' if k==0 else ''}"><small>Style {k+1} sur 3 · {f[2]}</small><h3>{f[0]}</h3><p>{f[1]}</p><ul class="zs">{''.join(f'<li class="{"on" if i<f[3] else ""}">{z}</li>' for i,z in enumerate(Z))}</ul></div>''' for k,f in enumerate(F))
hs=lambda p:''.join(f'<span class="hs{" l" if l else ""}" style="left:{x}%;top:{y}%"><i></i><b>{n}</b></span>' for n,x,y,l in p)
scar=''.join(f'<div class="view"><img src="img/s_{v[0]}.webp" alt="{v[1]}" width="2200" height="1238">{hs(v[2])}</div>' for f in F for v in f[4])
t=(ROOT/'src/site_index.html').read_text().replace('{{SNAV}}',snav).replace('{{STX}}',stx).replace('{{SCAR}}',scar)
(ROOT/'site/index.html').write_text(t)
