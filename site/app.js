/* Panneau de réglages, détails au survol et animations du site. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],R=document.documentElement,D=R.dataset,MO=R.classList.contains('mo');
/* réglages */
const SEC=[['expertise','Expertise',['Tickets','Pense-bêtes','Mots plus petits']],['app','Application',['Mot au-dessus','Mot à gauche','Mot de chaque côté','Scroll dans l\'écran']]];
const COL=[['noir','Noir et blanc'],['violet','Violet'],['rouge','Rouge'],['orange','Orange'],['jaune','Jaune']],FONT=[['1','Condensée'],['2','Grasse'],['3','Éditoriale'],['4','Arrondie']];
const KEYS=['c','m','f',...SEC.map(s=>s[0])];
const keep=()=>{try{localStorage.setItem('roam-cfg2',JSON.stringify(Object.fromEntries(KEYS.map(k=>[k,D[k]]))))}catch(e){}};
const row=(key,t,opts)=>`<div><h2>${t}</h2><div class="o" data-k="${key}">${opts.map(([v,l])=>`<button data-v="${v}" aria-pressed="${D[key]===v}">${l}</button>`).join('')}</div></div>`;
const cfg=$('#cfg'),cb=$('#cfgb');
cfg.innerHTML=row('m','Mode',[['nuit','Nuit'],['jour','Jour']])+row('c','Couleur du site',COL)+row('f','Police',FONT)+SEC.map(([k,t,o])=>row(k,t,o.map((l,i)=>[String(i+1),`${i+1}. ${l}`]))).join('')+'<div class="ln2"><button id="cfgc">Copier mes choix</button><button id="cfgr">Réinitialiser</button><span class="ok" id="cfgs" role="status"></span></div>';
const openC=o=>{cfg.hidden=!o;cb.setAttribute('aria-expanded',o);try{sessionStorage.setItem('roam-open',o?'1':'')}catch(e){}};
cb.addEventListener('click',()=>openC(cfg.hidden));
addEventListener('keydown',e=>{if(e.key==='Escape'&&!cfg.hidden){openC(false);cb.focus()}});
cfg.addEventListener('click',e=>{const b=e.target.closest('.o button');if(!b)return;const k=b.parentElement.dataset.k;D[k]=b.dataset.v;$$('button',b.parentElement).forEach(x=>x.setAttribute('aria-pressed',x===b));keep();
  if(['c','m'].includes(k))return;
  if(k==='f'){window.ScrollTrigger&&ScrollTrigger.refresh();return}
  try{sessionStorage.setItem('roam-go',k)}catch(e){}location.search='';location.reload()});
$('#cfgc').addEventListener('click',async()=>{const t=['Couleur : '+COL.find(c=>c[0]===D.c)[1]+', '+D.m,'Police : '+FONT.find(f=>f[0]===D.f)[1],...SEC.map(([k,n,o])=>`${n} : ${D[k]}. ${o[D[k]-1]}`)].join('\n');try{await navigator.clipboard.writeText(t);$('#cfgs').textContent='Copié.'}catch(e){$('#cfgs').textContent=t}});
$('#cfgr').addEventListener('click',()=>{try{localStorage.removeItem('roam-cfg2')}catch(e){}location.reload()});
try{if(sessionStorage.getItem('roam-open'))openC(true);const g=sessionStorage.getItem('roam-go');if(g){sessionStorage.removeItem('roam-go');addEventListener('load',()=>setTimeout(()=>{const n=$(`[data-sec=${g}]`);if(n)scrollTo(0,n.getBoundingClientRect().top+scrollY-60)},250))}}catch(e){}
/* texte qui roule au survol */
$$('.rl').forEach(r=>{r.innerHTML=`<span class="rli">${r.innerHTML}</span>`});
if(!MO||!window.gsap)return;
gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
const pin=(el,end,scrub=.6)=>({trigger:el,start:'top top',end:'+='+end,pin:true,scrub,anticipatePin:1,invalidateOnRefresh:true});
const small=innerWidth<=760;
/* héros : seuls les mots bougent, jamais la voiture */
(()=>{const s=$('.h1g'),l=$$('.ln>span',s);gsap.from(l,{yPercent:110,duration:1,stagger:.12,ease:'power4.out'});gsap.to(l[0],{xPercent:-8,scrollTrigger:{trigger:s,start:'top top',end:'bottom top',scrub:.4}});gsap.to(l[1],{xPercent:8,scrollTrigger:{trigger:s,start:'top top',end:'bottom top',scrub:.4}})})();
/* concept : les pages arrivent les unes sur les autres */
(()=>{const p=$$('.c2s .pg');p.slice(0,-1).forEach((x,i)=>gsap.to(x,{scale:.94,ease:'none',scrollTrigger:{trigger:p[i+1],start:'top bottom',end:'top top',scrub:true}}));p.slice(1).forEach(x=>gsap.from($$('.huge,p,img',x),{y:50,opacity:0,stagger:.08,duration:.7,ease:'power3.out',scrollTrigger:{trigger:x,start:'top 55%'}}))})();
/* styles : la feuille monte sur la page de couleur */
$$('.fy').forEach(a=>{const sh=$('.sheetp',a),t=gsap.timeline({scrollTrigger:pin(a,'230%')});
  t.from($('.mega',a),{yPercent:30,opacity:0,duration:.4}).to({}, {duration:.3})
   .to(sh,{y:0,borderTopLeftRadius:0,borderTopRightRadius:0,duration:1,ease:'none'})
   .from($$('.w',sh),{opacity:.12,stagger:.06,duration:.2},'-=.5')
   .from($$('.fan img',sh),{y:()=>innerHeight*.5,rotate:i=>(i-1.5)*9,stagger:.08,duration:.6,ease:'power2.out'},'-=.6').to({}, {duration:.4})});
/* expertise : chaque carte arrive, se lit, puis va se poser et reste lisible */
const ex=$(`[data-sec=expertise]>[data-v="${D.expertise}"]`);
if(D.expertise==='3')$$('.giant',ex).forEach((g,i)=>{gsap.from(g,{xPercent:i%2?7:-7,ease:'none',scrollTrigger:{trigger:g,start:'top bottom',end:'top 45%',scrub:.5}});gsap.to($('svg',g),{rotate:180,ease:'none',scrollTrigger:{trigger:g,start:'top bottom',end:'bottom top',scrub:.5}})});
else if(small)$$('.tk',ex).forEach((k,i)=>gsap.from(k,{y:60,opacity:0,rotate:i%2?3:-3,duration:.7,ease:'power3.out',scrollTrigger:{trigger:k,start:'top 88%'}}));
else{const note=D.expertise==='2',X=note?[-.31,-.1,.13,.33]:[-.36,-.13,.12,.36],Y=note?[-.17,.2,-.2,.14]:[-.14,.2,-.2,.15],Rt=[-7,4,-4,6],k=$$('.tk',ex),t=gsap.timeline({scrollTrigger:pin(ex,'460%')});
  gsap.set(k,{xPercent:-50,yPercent:-50,y:()=>innerHeight});
  k.forEach((c,i)=>{const b=i*1.6;t.fromTo(c,{y:()=>innerHeight,rotate:i%2?10:-10},{y:0,rotate:0,duration:.7,ease:'power2.out'},b)
   .to(c,{x:()=>innerWidth*X[i],y:()=>innerHeight*Y[i],scale:.66,rotate:Rt[i],duration:.7,ease:'power2.inOut'},b+1)});t.to({}, {duration:.7})}
/* application : le téléphone reste en place, les onglets changent dans l'écran */
const ax=$(`[data-sec=app]>[data-v="${D.app}"]`),st=$('.stg',ax),W=$$('.wd',st),P=$$('.cap p',st),n=W.length,t=gsap.timeline({scrollTrigger:pin(st,'340%')});
gsap.set([W[0],P[0]],{opacity:1});
t.from($('.ph',st),{scale:.86,duration:.4},0);
const swap=i=>t.to(W[i-1],{opacity:0,yPercent:-18,duration:.2},i).fromTo(W[i],{opacity:0,yPercent:18},{opacity:1,yPercent:0,duration:.25},i+.2).to(P[i-1],{opacity:0,duration:.15},i).to(P[i],{opacity:1,duration:.2},i+.2);
if(D.app==='4'){const lg=$('.lgi',st),sc=$('.sc',st);t.to(lg,{y:()=>sc.clientHeight-lg.scrollHeight,duration:n-.1,ease:'none'},.4);for(let i=1;i<n;i++)swap(i)}
else{const ps=$$('.ps',st),ti=$('.tabs i',st);gsap.set(ps,{xPercent:i=>i?100:0});
  for(let i=1;i<n;i++){t.to(ps[i-1],{xPercent:-30,opacity:.3,duration:.45,ease:'power2.inOut'},i).to(ps[i],{xPercent:0,duration:.45,ease:'power2.inOut'},i).to(ti,{xPercent:100*i,duration:.45,ease:'power2.inOut'},i);swap(i)}}
t.to({}, {duration:.6});
$$('.sh .big,.sh .eye').forEach(x=>gsap.from(x,{y:30,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:x,start:'top 88%'}}));
addEventListener('load',()=>ScrollTrigger.refresh());if(document.fonts)document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
