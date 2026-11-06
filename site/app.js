/* Présentation des formats au scroll et couleurs du site. */
(()=>{
const $=i=>document.getElementById(i),R=document.documentElement,calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* formats : six vues, trois véhicules, avant puis arrière */
const track=$('track');
if(track){
  const views=[...track.querySelectorAll('.view')],txs=[...track.querySelectorAll('.tx')],nav=[...track.querySelectorAll('.snav button')],N=views.length;
  const cl=v=>Math.max(0,Math.min(1,v)),ez=v=>v*v*(3-2*v);
  let k=-1,tick=false;
  const paint=()=>{
    tick=false;
    const r=track.getBoundingClientRect(),t=Math.min(N-.001,cl(-r.top/(r.height-innerHeight))*N);
    views.forEach((v,i)=>{
      const l=t-i,a=i?ez(cl(l/.13)):1,b=i<N-1?ez(cl((l-.87)/.13)):0,o=a*(1-b);
      /* d'un véhicule à l'autre, il sort par l'avant ; entre l'avant et l'arrière, il glisse à peine */
      const d=i%2?70:14,e=i%2?14:70,x=calm?0:(1-a)*e-b*d;
      v.style.opacity=o;v.style.transform=`translateX(${x}%)`;v.style.visibility=o?'visible':'hidden';
      [...v.querySelectorAll('.hs')].forEach((h,n)=>h.classList.toggle('on',o>.9&&l>.12+n*.2));
    });
    const c=Math.min(2,Math.floor(t/2));
    if(c!==k){k=c;txs.forEach((x,i)=>x.classList.toggle('on',i===c));nav.forEach((b,i)=>b.setAttribute('aria-current',i===c))}
  };
  const go=c=>{const r=track.getBoundingClientRect();scrollTo({top:scrollY+r.top+(c*2+.03)/N*(r.height-innerHeight),behavior:calm?'auto':'smooth'})};
  nav.forEach((b,i)=>b.addEventListener('click',()=>go(i)));
  $('sprev').addEventListener('click',()=>go(Math.max(0,k-1)));
  $('snext').addEventListener('click',()=>go(Math.min(2,k+1)));
  const ask=()=>{if(!tick){tick=true;requestAnimationFrame(paint)}};
  addEventListener('scroll',ask,{passive:true});addEventListener('resize',ask);paint();
}
/* couleurs du site : une couleur, en version jour ou nuit, conservées à la visite suivante */
const pal=$('pal'),keep=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const show=()=>[...pal.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed',b.dataset.c?b.dataset.c===R.dataset.c:b.dataset.m===R.dataset.m));
pal.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.c){R.dataset.c=b.dataset.c;keep('roam-c',b.dataset.c)}else{R.dataset.m=b.dataset.m;keep('roam-m',b.dataset.m)}show()});
show();
})();
