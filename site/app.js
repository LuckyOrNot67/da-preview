/* Panneau de réglages, détails au survol et animations du site. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],R=document.documentElement,D=R.dataset,MO=R.classList.contains('mo');
/* réglages */
const SEC=[['expertise','Expertise',['Cartes claires','Cartes sombres']],['app','Application',['Fond clair','Fond sombre']]];
const COL=[['noir','Noir et blanc'],['violet','Violet'],['rouge','Rouge'],['orange','Orange'],['jaune','Jaune']],FONT=[['1','Condensée'],['2','Grasse'],['3','Éditoriale'],['4','Arrondie']];
const KEYS=['c','m','f',...SEC.map(s=>s[0])];
const keep=()=>{try{localStorage.setItem('roam-cfg4',JSON.stringify(Object.fromEntries(KEYS.map(k=>[k,D[k]]))))}catch(e){}};
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
$('#cfgr').addEventListener('click',()=>{try{localStorage.removeItem('roam-cfg4')}catch(e){}location.reload()});
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
/* concept : chaque carte vient s'empiler, celles de dessous reculent et restent visibles */
(()=>{const p=$$('.c2s .pg');p.forEach((c,i)=>{for(let j=i+1;j<p.length;j++){const a=1-.035*(j-i-1),b=1-.035*(j-i);gsap.fromTo(c,{scale:a},{scale:b,ease:'none',immediateRender:false,scrollTrigger:{trigger:p[j],start:'top bottom',end:()=>`top ${70+j*14}`,scrub:true}})}})})();
/* styles : une seule scène, chaque couleur monte comme la feuille, sans coupure, et le nom reste affiché */
(()=>{const f=$('.fst'),A=$$('.fy',f),ink=getComputedStyle(R).getPropertyValue('--ink').trim(),t=gsap.timeline({scrollTrigger:pin(f,small?'640%':'760%')});
  A.forEach((a,i)=>{const b=i*4,sh=$('.sheetp',a),m=$('.mega',a),zs=$('.zs',a);gsap.set(sh,{yPercent:102});gsap.set(zs,{opacity:0});
   if(i)t.fromTo(a,{yPercent:102,borderTopLeftRadius:'50vw',borderTopRightRadius:'50vw'},{yPercent:0,borderTopLeftRadius:0,borderTopRightRadius:0,duration:1,ease:'none'},b-1);
   t.to(sh,{yPercent:0,borderTopLeftRadius:0,borderTopRightRadius:0,duration:1,ease:'none'},b+.5)
    .to(m,{scale:small?.56:.44,color:ink,duration:1,ease:'none'},b+.5)
    .fromTo($$('.w',sh),{opacity:.12},{opacity:1,stagger:.05,duration:.2},b+1.1)
    .fromTo($$('.fan img',sh),{y:()=>innerHeight*.5,rotate:n=>(n-1.5)*9},{y:0,rotate:0,stagger:.08,duration:.6,ease:'power2.out'},b+1.2)
    .to(zs,{opacity:1,duration:.4},b+2.2)});t.to({}, {duration:.8})})();
/* expertise : le titre reste, chaque carte arrive, se lit, puis va se poser */
const ex=$(`[data-sec=expertise]>[data-v="${D.expertise}"]`);
if(small)$$('.tk',ex).forEach((k,i)=>gsap.from(k,{y:60,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:k,start:'top 88%'}}));
else{const X=[-.35,-.12,.11,.34],Y=[.14,.24,.1,.22],Rt=[-4,3,-3,4],k=$$('.tk',ex),t=gsap.timeline({scrollTrigger:pin(ex,'420%')});
  gsap.set(k,{xPercent:-50,yPercent:-50,y:()=>innerHeight});
  k.forEach((c,i)=>{const b=i*1.6;t.fromTo(c,{x:()=>innerWidth*.14,y:()=>innerHeight,rotate:i%2?7:-7},{x:()=>innerWidth*.14,y:()=>innerHeight*.03,rotate:0,duration:.7,ease:'power2.out'},b)
   .to(c,{x:()=>innerWidth*X[i],y:()=>innerHeight*Y[i],scale:.76,rotate:Rt[i],duration:.7,ease:'power2.inOut'},b+1)});t.to({}, {duration:.7})}
/* application : le titre reste, le téléphone est à côté, les explications s'ajoutent */
(()=>{const ax=$(`[data-sec=app]>[data-v="${D.app}"]`),st=$('.stg',ax),li=$$('.ro li',st),ps=$$('.ps',st),tp=$('.tap',st),n=ps.length,t=gsap.timeline({scrollTrigger:pin(st,'340%')});
  gsap.set(ps,{xPercent:i=>i?100:0});gsap.set(li.slice(1),{opacity:0});
  for(let i=1;i<n;i++){t.fromTo(tp,{opacity:0,scale:1.5},{opacity:1,scale:1,duration:.12},i-.16).to(tp,{opacity:0,scale:.7,duration:.1},i-.03).to(ps[i-1],{xPercent:-28,opacity:.35,duration:.45,ease:'power2.inOut'},i).to(ps[i],{xPercent:0,duration:.45,ease:'power2.inOut'},i).to(li[i],{opacity:1,duration:.3},i+.1);if(small)t.to(li[i-1],{opacity:0,duration:.2},i);else t.to(li[i-1],{opacity:.5,duration:.3},i+.1)}
  t.to({}, {duration:.6})})();
/* bloc final : il reste fixé, le footer vient se poser dessus comme une carte */
(()=>{const w=$('.wrapc'),f=$('footer');ScrollTrigger.create({trigger:w,start:'top top',endTrigger:f,end:'top top',pin:true,pinSpacing:false});gsap.to('.cta',{scale:.94,ease:'none',scrollTrigger:{trigger:f,start:'top bottom',end:'top top',scrub:true}})})();
$$('.sb .big,.sb .eye,.cta h2,.cta p,.ct2,.ft').forEach(x=>gsap.from(x,{y:30,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:x,start:'top 88%'}}));
addEventListener('load',()=>ScrollTrigger.refresh());if(document.fonts)document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
