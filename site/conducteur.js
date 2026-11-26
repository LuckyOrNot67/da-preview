/* Espace conducteur : estimation selon le barème indicatif (kilomètres validés par mois). Montants provisoires, à confirmer dans chaque contrat. */
(()=>{
const T=[[0,50],[750,75],[1000,100],[1500,125],[2000,150],[2500,175]],MAX=200;
const km=document.getElementById('simkm'),out=document.getElementById('kmo'),amt=document.getElementById('amt'),L=[...document.querySelectorAll('.br li')];
if(!km)return;
const up=()=>{const k=+km.value;let i=0;T.forEach((t,n)=>{if(k>=t[0])i=n});const lo=T[i][1],hi=Math.min(lo+25,MAX);
  out.textContent=k.toLocaleString('fr-BE')+' km';amt.textContent=`Entre ${lo} et ${hi} €`;L.forEach((l,n)=>l.classList.toggle('on',n===i));
  km.style.setProperty('--p',((k-km.min)/(km.max-km.min)*100)+'%')};
km.addEventListener('input',up);up();
})();
