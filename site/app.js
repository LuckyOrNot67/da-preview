/* Filtres, zones et couleurs du site. */
(()=>{
const $=i=>document.getElementById(i),R=document.documentElement;
/* filtres des campagnes */
const pills=$('pills');
if(pills){
  const G=['Tous','Citadine','Familiale','Utilitaire'],tiles=[...document.querySelectorAll('.tile')];
  pills.innerHTML=G.map((g,k)=>`<button data-g="${g}" aria-pressed="${!k}">${g}</button>`).join('');
  pills.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;[...pills.children].forEach(x=>x.setAttribute('aria-pressed',x===b));tiles.forEach(t=>t.hidden=b.dataset.g!=='Tous'&&t.dataset.g!==b.dataset.g)});
}
/* zones : simulation */
const map=$('zmap');
if(map){
  const CT={Bruxelles:[121.8,70],Anvers:[125,33],Gand:[81.8,50],'Liège':[199.2,92],Charleroi:[127.5,114],Namur:[154.8,108]};
  const chips=(id,items,type,on)=>{$(id).innerHTML=items.map((t,i)=>`<label><input type="${type}" name="${id}" value="${t}"${on.includes(i)?' checked':''}><span>${t}</span></label>`).join('')};
  chips('z-cities',Object.keys(CT),'checkbox',[0,2]);chips('z-scope',['Centre-ville','Agglomération'],'radio',[1]);chips('z-cars',['5','10','20','40'],'radio',[1]);chips('z-dur',['3 mois','4 mois','6 mois'],'radio',[0]);
  const val=id=>[...document.querySelectorAll(`#${id} input:checked`)].map(i=>i.value);
  const draw=()=>{
    const sel=val('z-cities'),r=val('z-scope')[0]==='Centre-ville'?12:22;
    $('zzones').innerHTML=sel.map(c=>`<circle class="zc" cx="${CT[c][0]}" cy="${CT[c][1]}" r="${r}"/>`).join('');
    $('zcities').innerHTML=Object.entries(CT).map(([n,[x,y]])=>{const on=sel.includes(n),l=n==='Charleroi';return `<circle class="pt${on?' on':''}" cx="${x}" cy="${y}" r="${on?2.6:1.9}"/><text class="lb${on?' on':''}" x="${l?x-5:x+5}" y="${y+2}" text-anchor="${l?'end':'start'}">${n}</text>`}).join('');
    $('zsum').textContent=sel.length?`Simulation : ${val('z-cars')[0]} véhicules, ${val('z-dur')[0]}, ${sel.join(', ')} (${val('z-scope')[0].toLowerCase()}).`:'Choisissez au moins une ville.';
  };
  document.querySelector('.zon').addEventListener('change',draw);draw();
}
/* couleurs du site : conservées d'une page à l'autre */
const pal=$('pal'),T=['blanc','sable','ardoise','nuit'];
let saved=null;try{saved=localStorage.getItem('roam-c')}catch(e){}
const url=new URLSearchParams(location.search).get('c');
function set(c){R.dataset.c=c;[...pal.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===c));try{localStorage.setItem('roam-c',c)}catch(e){}}
pal.addEventListener('click',e=>{const b=e.target.closest('button');if(b)set(b.dataset.v)});
set(T.includes(url)?url:T.includes(saved)?saved:'blanc');
})();
