/* Panneau de réglages, détails au survol et animations du site. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],R=document.documentElement,D=R.dataset,MO=R.classList.contains('mo');
/* réglages */
const SEC=[['expertise','Expertise',['Cartes claires','Cartes sombres']],['app','Application',['Fond clair','Fond sombre']]];
const COL=[['noir','Noir et blanc'],['violet','Violet'],['rouge','Rouge'],['orange','Orange'],['jaune','Jaune']],FONT=[['1','Condensée'],['2','Grasse'],['3','Éditoriale'],['4','Arrondie']];
const KEYS=['c','m','f',...SEC.map(s=>s[0])];
const keep=()=>{try{localStorage.setItem('roam-cfg-avant-v9',JSON.stringify(Object.fromEntries(KEYS.map(k=>[k,D[k]]))))}catch(e){}};
const row=(key,t,opts)=>`<div><h2>${t}</h2><div class="o" data-k="${key}">${opts.map(([v,l])=>`<button data-v="${v}" aria-pressed="${D[key]===v}">${l}</button>`).join('')}</div></div>`;
const cfg=$('#cfg'),cb=$('#cfgb');
cfg.innerHTML=row('m','Mode',[['nuit','Nuit'],['jour','Jour']])+row('c','Couleur du site',COL)+row('f','Police',FONT)+SEC.map(([k,t,o])=>row(k,t,o.map((l,i)=>[String(i+1),`${i+1}. ${l}`]))).join('')+'<div class="ln2"><button id="cfgc">Copier mes choix</button><button id="cfgr">Réinitialiser</button><span class="ok" id="cfgs" role="status"></span></div>';
const openC=o=>{cfg.hidden=!o;cb.setAttribute('aria-expanded',o);try{sessionStorage.setItem('roam-open',o?'1':'')}catch(e){}};
cb.addEventListener('click',()=>openC(cfg.hidden));
addEventListener('keydown',e=>{if(e.key==='Escape'&&!cfg.hidden){openC(false);cb.focus()}});
cfg.addEventListener('click',e=>{const b=e.target.closest('.o button');if(!b)return;const k=b.parentElement.dataset.k;D[k]=b.dataset.v;$$('button',b.parentElement).forEach(x=>x.setAttribute('aria-pressed',x===b));keep();
  if(['c','m'].includes(k)){location.reload();return}
  if(k==='f'){window.ScrollTrigger&&ScrollTrigger.refresh();return}
  try{sessionStorage.setItem('roam-go',k)}catch(e){}location.search='';location.reload()});
$('#cfgc').addEventListener('click',async()=>{const t=['Couleur : '+COL.find(c=>c[0]===D.c)[1]+', '+D.m,'Police : '+FONT.find(f=>f[0]===D.f)[1],...SEC.map(([k,n,o])=>`${n} : ${D[k]}. ${o[D[k]-1]}`)].join('\n');try{await navigator.clipboard.writeText(t);$('#cfgs').textContent='Copié.'}catch(e){$('#cfgs').textContent=t}});
$('#cfgr').addEventListener('click',()=>{try{localStorage.removeItem('roam-cfg-avant-v9')}catch(e){}location.reload()});
try{if(sessionStorage.getItem('roam-open'))openC(true);const g=sessionStorage.getItem('roam-go');if(g){sessionStorage.removeItem('roam-go');addEventListener('load',()=>setTimeout(()=>{const n=$(`[data-sec=${g}]`);if(n)scrollTo(0,n.getBoundingClientRect().top+scrollY-60)},250))}}catch(e){}
/* texte qui roule au survol */
$$('.rl').forEach(r=>{r.innerHTML=`<span class="rli">${r.innerHTML}</span>`});
if(!MO||!window.gsap)return;
gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
const pin=(el,end,scrub=.6)=>({trigger:el,start:'top top',end:'+='+end,pin:true,scrub,anticipatePin:1,invalidateOnRefresh:true});
const small=innerWidth<=760;
/* héros : le titre monte derrière la voiture, qui est là dès le début */
(()=>{const s=$('.h1g'),T=gsap.timeline({defaults:{ease:'power3.out'}});
  T.from('.bar .logo',{y:-14,opacity:0,duration:.6}).from('.links a',{y:-14,opacity:0,duration:.5,stagger:.06},'-=.4').from('.acts>*',{opacity:0,duration:.7},'-=.4')
   .from($$('.ln>span',s),{yPercent:110,duration:1,stagger:.12,ease:'power4.out'},.15).from($$('.foot p,.foot .btn',s),{y:24,opacity:0,duration:.7,stagger:.12},.6)})();
/* épingle une scène : len = durée de l'animation, extra = temps laissé à la section suivante pour passer par-dessus */
const stage=(el,len,extra=0)=>{ScrollTrigger.create({trigger:el,start:'top top',end:`+=${len+extra}%`,pin:true,anticipatePin:1});return {trigger:el,start:'top top',end:`+=${len}%`,scrub:.6,invalidateOnRefresh:true}};
const cover=(el,extra=100)=>gsap.fromTo(el,{scale:1},{scale:.95,ease:'none',transformOrigin:'center top',immediateRender:false,scrollTrigger:{trigger:el,start:()=>ScrollTrigger.getAll().find(s=>s.pin===el).end-innerHeight*extra/100,end:()=>ScrollTrigger.getAll().find(s=>s.pin===el).end,scrub:true}});
/* concept : les cartes s'empilent dans une scène, puis tout le paquet monte ensemble */
(()=>{const s=$('.c2s'),p=$$('.pg',s),n=p.length,t=gsap.timeline({scrollTrigger:pin(s,`${(n-1)*80+20}%`)});
  p.slice(1).forEach((c,k)=>{const j=k+1;t.fromTo(c,{y:()=>innerHeight},{y:0,duration:1,ease:'none'},k*1.15);for(let i=0;i<j;i++)t.to(p[i],{scale:1-.035*(j-i),duration:1,ease:'none'},k*1.15)});t.to({}, {duration:.3})})();
/* styles : le nom en grand, puis il remonte et les photos arrivent. La couleur suivante vient par-dessus comme une carte */
(()=>{const f=$('.fst'),A=$$('.fy',f),t=gsap.timeline({scrollTrigger:stage(f,small?560:640,100)});
  A.forEach((a,i)=>{const b=i*3,m=$('.mega',a),inf=$('.inf',a),g=$$('.gal figure',a);
   gsap.set(inf,{opacity:0});gsap.set(m,{y:()=>(innerHeight-74-m.offsetHeight)/2});
   if(i){t.fromTo(a,{yPercent:102},{yPercent:0,duration:1,ease:'none'},b-1).to(A[i-1],{scale:.95,duration:1,ease:'none'},b-1)}
   t.to(m,{y:0,scale:small?.72:.6,duration:.7,ease:'power1.inOut'},b+.3)
    .fromTo(g,{y:()=>innerHeight*.6,opacity:0},{y:0,opacity:1,stagger:.07,duration:.6,ease:'power2.out'},b+.5)
    .to(inf,{opacity:1,duration:.3},b+1.2)});t.to({}, {duration:.5})
  cover(f)})();
/* expertise : le titre reste, chaque carte arrive, se lit, puis va se poser */
const ex=$(`[data-sec=expertise]>[data-v="${D.expertise}"]`);
if(small)$$('.tk',ex).forEach(k=>gsap.from(k,{y:60,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:k,start:'top 88%'}}));
else{const X=[-.37,-.14,.12,.37],Y=[.07,.29,.02,.25],Rt=[-7,5,-5,7],k=$$('.tk',ex),t=gsap.timeline({scrollTrigger:stage(ex,400,100)});
  gsap.set(k,{xPercent:-50,yPercent:-50,y:()=>innerHeight});
  k.forEach((c,i)=>{const b=i*1.6;t.fromTo(c,{x:()=>innerWidth*.14,y:()=>innerHeight,rotate:i%2?7:-7},{x:()=>innerWidth*.14,y:()=>innerHeight*.03,rotate:0,duration:.7,ease:'power2.out'},b)
   .to(c,{x:()=>innerWidth*X[i],y:()=>innerHeight*Y[i],scale:.76,rotate:Rt[i],duration:.7,ease:'power2.inOut'},b+1)});t.to({}, {duration:.7});cover(ex)}
/* application : le titre reste, l'explication active est grande, les précédentes rétrécissent */
(()=>{const ax=$(`[data-sec=app]>[data-v="${D.app}"]`),st=$('.stg',ax),li=$$('.ro li',st),ps=$$('.ps',st),tp=$('.tap',st),n=ps.length,t=gsap.timeline({scrollTrigger:pin(st,'340%')});
  gsap.set(ps,{xPercent:i=>i?100:0});gsap.set(li.slice(1),{opacity:0});
  for(let i=1;i<n;i++){t.fromTo(tp,{opacity:0,scale:1.5},{opacity:1,scale:1,duration:.12},i-.16).to(tp,{opacity:0,scale:.7,duration:.1},i-.03).to(ps[i-1],{xPercent:-28,opacity:.35,duration:.45,ease:'power2.inOut'},i).to(ps[i],{xPercent:0,duration:.45,ease:'power2.inOut'},i).to(li[i],{opacity:1,duration:.3},i+.1);
   if(small)t.to(li[i-1],{opacity:0,duration:.2},i);else for(let j=0;j<i;j++)t.to(li[j],{fontSize:Math.max(10,14-(i-j-1)*1),opacity:.5-.1*(i-j-1),duration:.3},i+.1)}
  t.to({}, {duration:.6})})();
/* bloc final : il reste fixé longtemps, puis le footer vient se poser dessus sans le cacher entièrement */
(()=>{const w=$('.wrapc'),f=$('footer');ScrollTrigger.create({trigger:w,start:'top top',end:'max',pin:true,pinSpacing:false});gsap.to('.cta',{scale:.95,ease:'none',scrollTrigger:{trigger:f,start:'top bottom',end:'max',scrub:true}})})();
$$('.sb .big,.sb .eye,.cta h2,.cta p,.ct2,.ft').forEach(x=>gsap.from(x,{y:30,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:x,start:'top 88%'}}));
addEventListener('load',()=>ScrollTrigger.refresh());if(document.fonts)document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
