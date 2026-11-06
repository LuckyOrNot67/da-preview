/* Galerie de campagnes et choix de la palette. */
(()=>{
const $=i=>document.getElementById(i);
const C=[
 {t:'Arcs',k:'Grandes formes',g:'Familiale',d:'De grands arcs suivent les lignes du véhicule, du capot au hayon.',i:['c1','c1b','c1c']},
 {t:'Vague',k:'Formes organiques',g:'Citadine',d:'Une vague continue qui traverse toute la carrosserie.',i:['c2','c2b','c2c']},
 {t:'Cadence',k:'Rythme graphique',g:'Utilitaire',d:'Des bandes qui s\'épaississent de l\'avant vers l\'arrière.',i:['c3','c3b','c3c']},
 {t:'Dégradé',k:'Couleur',g:'Citadine',d:'Un dégradé doux, de l\'arrière vers l\'avant.',i:['c4','c4b','c4c']},
 {t:'Mosaïque',k:'Géométrie',g:'Familiale',d:'Des tuiles alignées sur les lignes de la carrosserie.',i:['c5','c5b','c5c']},
 {t:'Diagonales',k:'Lignes',g:'Utilitaire',d:'Des diagonales franches sur un fond blanc.',i:['c6','c6b','c6c']}
];
const G=['Tous','Citadine','Familiale','Utilitaire'],grid=$('grid'),pills=$('pills'),dlg=$('dlg'),main=$('dmain');
let f='Tous',back=null;
const src=n=>`img/${n}.webp`;
function tiles(){
  grid.innerHTML=C.filter(c=>f==='Tous'||c.g===f).map(c=>`<button class="tile" data-i="${C.indexOf(c)}" aria-label="Voir la campagne ${c.t}"><img loading="lazy" src="${src(c.i[0])}" alt="" width="1344" height="752"><span>${c.t}</span></button>`).join('');
}
pills.innerHTML=G.map(g=>`<button data-g="${g}" aria-pressed="${g===f}">${g}</button>`).join('');
pills.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;f=b.dataset.g;[...pills.children].forEach(x=>x.setAttribute('aria-pressed',x===b));tiles()});
function show(c,n){main.src=src(c.i[n]);main.alt=`Campagne ${c.t}, vue ${n+1}`;[...$('dth').children].forEach((b,k)=>b.setAttribute('aria-current',k===n))}
grid.addEventListener('click',e=>{
  const b=e.target.closest('.tile');if(!b)return;back=b;const c=C[+b.dataset.i];
  $('d-k').textContent=c.k;$('d-t').textContent=c.t;$('d-p').textContent=c.d;
  $('dth').innerHTML=c.i.map((n,k)=>`<button aria-label="Vue ${k+1}"><img src="${src(n)}" alt=""></button>`).join('');
  [...$('dth').children].forEach((x,k)=>x.onclick=()=>show(c,k));
  show(c,0);dlg.showModal();
});
$('dx').onclick=()=>dlg.close();
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
dlg.addEventListener('close',()=>back&&back.focus());
tiles();

/* palettes */
const R=document.documentElement,pal=$('pal'),zr=document.querySelector('[data-zones]');
function set(c){
  R.dataset.c=c;[...pal.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===c));
  document.querySelectorAll('[data-k]').forEach(i=>i.src=`img/nf_${c}_${i.dataset.k}.webp`);
  const a=getComputedStyle(R).getPropertyValue('--a').trim();zr.dataset.on=a;zr.dataset.pill=a;window.zoneSync&&zoneSync();
  history.replaceState(null,'','?c='+c+location.hash);
}
pal.addEventListener('click',e=>{const b=e.target.closest('button');if(b)set(b.dataset.v)});
set(R.dataset.c);
})();
