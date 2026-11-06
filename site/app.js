/* Panneau de réglages, détails au survol et animations du site. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],R=document.documentElement,D=R.dataset,MO=R.classList.contains('mo');
/* réglages */
const SEC=[['expertise','Expertise',['Cartes claires','Cartes sombres']],['app','Application',['Fond clair','Fond sombre']]];
const COL=[['noir','Noir et blanc'],['violet','Violet'],['rouge','Rouge'],['orange','Orange'],['jaune','Jaune']],FONT=[['1','Condensée'],['2','Grasse'],['3','Éditoriale'],['4','Arrondie']];
const KEYS=['c','m','f',...SEC.map(s=>s[0])];
const keep=()=>{try{localStorage.setItem('roam-cfg5',JSON.stringify(Object.fromEntries(KEYS.map(k=>[k,D[k]]))))}catch(e){}};
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
$('#cfgr').addEventListener('click',()=>{try{localStorage.removeItem('roam-cfg5')}catch(e){}location.reload()});
try{if(sessionStorage.getItem('roam-open'))openC(true);const g=sessionStorage.getItem('roam-go');if(g){sessionStorage.removeItem('roam-go');addEventListener('load',()=>setTimeout(()=>{const n=$(`[data-sec=${g}]`);if(n)scrollTo(0,n.getBoundingClientRect().top+scrollY-60)},250))}}catch(e){}
/* texte qui roule au survol */
$$('.rl').forEach(r=>{r.innerHTML=`<span class="rli">${r.innerHTML}</span>`});
if(!MO||!window.gsap)return;
gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
const small=innerWidth<=760;
/* scène sticky : le navigateur fixe la section, sans recalcul à chaque image. len = durée en % d'écran, extra = temps laissé à la section suivante pour passer par-dessus */
const stage=(el,len,extra=0)=>{const w=document.createElement('div');w.className='stk';el.before(w);w.append(el);w.style.height=`calc(100svh + ${len+extra}vh)`;return {w,st:{trigger:w,start:'top top',end:`+=${len}%`,scrub:true,invalidateOnRefresh:true}}};
const cover=(el,w,len,extra=100)=>gsap.fromTo(el,{scale:1},{scale:.95,ease:'none',transformOrigin:'center top',immediateRender:false,scrollTrigger:{trigger:w,start:()=>`top+=${innerHeight*len/100} top`,end:`+=${extra}%`,scrub:true}});
/* héros : le titre monte derrière la voiture, qui est là dès le début */
(()=>{const s=$('.h1g'),T=gsap.timeline({defaults:{ease:'power3.out'}});
  T.from('.bar .logo',{y:-14,opacity:0,duration:.6}).from('.links a',{y:-14,opacity:0,duration:.5,stagger:.06},'-=.4').from('.acts>*',{opacity:0,duration:.7},'-=.4')
   .from($$('.ln>span',s),{yPercent:110,duration:1,stagger:.12,ease:'power4.out'},.15).from($$('.foot p,.foot a',s),{y:24,opacity:0,duration:.7,stagger:.1},.6)})();
/* concept : scroll continu, chaque carte ralentit en arrivant, puis tout le paquet monte ensemble */
(()=>{const s=$('.c2s'),p=$$('.pg',s),{st}=stage(s,(p.length-1)*85),t=gsap.timeline({scrollTrigger:st});
  p.slice(1).forEach((c,k)=>{const j=k+1;t.fromTo(c,{y:()=>innerHeight},{y:0,duration:1,ease:'sine.out'},k*.92);for(let i=0;i<j;i++)t.to(p[i],{scale:1-.035*(j-i),duration:1,ease:'none'},k*.92)})})();
/* formats : le nom en grand, puis il remonte et la fiche et les photos arrivent */
(()=>{const f=$('.fst'),A=$$('.fy',f),len=small?640:720,{w,st}=stage(f,len,100),t=gsap.timeline({scrollTrigger:st});
  A.forEach((a,i)=>{const b=i*3,m=$('.mega',a),inf=$('.inf',a),g=$$('.gal figure',a);
   gsap.set(inf,{opacity:0});gsap.set(m,{y:()=>(innerHeight-74-m.offsetHeight)/2});
   if(i){t.fromTo(a,{yPercent:102},{yPercent:0,duration:1,ease:'none'},b-1).to(A[i-1],{scale:.95,duration:1,ease:'none'},b-1)}
   t.to(m,{y:0,scale:small?.6:.48,duration:.7,ease:'power1.inOut'},b+.3)
    .fromTo(g,{y:()=>innerHeight*.6,opacity:0},{y:0,opacity:1,stagger:.07,duration:.6,ease:'power2.out'},b+.5)
    .to(inf,{opacity:1,duration:.3},b+1.1)});t.to({}, {duration:.5});
  cover(f,w,len)})();
/* expertise : le titre reste, chaque carte arrive, se lit, puis va se poser. Le bouton ouvre le détail au clic, au toucher et au clavier */
const ex=$(`[data-sec=expertise]>[data-v="${D.expertise}"]`);
new IntersectionObserver(e=>ex.classList.toggle('play',e[0].isIntersecting)).observe(ex);
const close=()=>$$('.tk.open',ex).forEach(k=>{k.classList.remove('open');$('.more',k).hidden=true;$('.tkb',k).setAttribute('aria-expanded','false');$('.tkb span',k).textContent='Voir le détail';gsap.to($('.tki',k),{x:0,y:0,rotation:0,scale:1,duration:.35,ease:'power2.out'})});
$$('.tkb',ex).forEach((b,i)=>b.addEventListener('click',()=>{const k=b.closest('.tk'),was=k.classList.contains('open');close();if(was)return;k.classList.add('open');$('.more',k).hidden=false;b.setAttribute('aria-expanded','true');$('span',b).textContent='Fermer';
  if(small)return;
  const r=k.getBoundingClientRect(),cx=innerWidth*.62,cy=innerHeight*.56,dx=cx-(r.left+r.width/2),dy=cy-(r.top+r.height/2),a=-gsap.getProperty(k,'rotation')*Math.PI/180,sc=gsap.getProperty(k,'scale');
  gsap.to($('.tki',k),{x:(dx*Math.cos(a)-dy*Math.sin(a))/sc,y:(dx*Math.sin(a)+dy*Math.cos(a))/sc,rotation:-gsap.getProperty(k,'rotation'),scale:1/sc,duration:.4,ease:'power3.out'})}));
addEventListener('keydown',e=>{if(e.key==='Escape')close()});
if(small)$$('.tk',ex).forEach(k=>gsap.from(k,{y:60,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:k,start:'top 88%'}}));
else{const X=[-.37,-.14,.12,.37],Y=[.07,.29,.02,.25],Rt=[-7,5,-5,7],k=$$('.tk',ex),{w,st}=stage(ex,400,100),t=gsap.timeline({scrollTrigger:{...st,onUpdate:close}});
  gsap.set(k,{xPercent:-50,yPercent:-50,y:()=>innerHeight});
  k.forEach((c,i)=>{const b=i*1.6;t.fromTo(c,{x:()=>innerWidth*.14,y:()=>innerHeight,rotate:i%2?7:-7},{x:()=>innerWidth*.14,y:()=>innerHeight*.03,rotate:0,duration:.7,ease:'power2.out'},b)
   .to(c,{x:()=>innerWidth*X[i],y:()=>innerHeight*Y[i],scale:.76,rotate:Rt[i],duration:.7,ease:'power2.inOut'},b+1)});t.to({}, {duration:.7});cover(ex,w,400)}
/* application : uniquement des transformations et de l'opacité, pour rester fluide. Les explications s'empilent, la dernière est en grand */
(()=>{const ax=$(`[data-sec=app]>[data-v="${D.app}"]`),st=$('.stg',ax),li=$$('.ro li',st),ps=$$('.ps',st),tp=$('.tap',st),n=ps.length,S=stage(st,(n-1)*90),t=gsap.timeline({scrollTrigger:S.st}),h=small?0:42;
  gsap.set(ps,{xPercent:i=>i?100:0});gsap.set(li.slice(1),{opacity:0,y:small?0:88});
  for(let i=1;i<n;i++){t.fromTo(tp,{opacity:0,scale:1.5},{opacity:1,scale:1,duration:.12},i-.16).to(tp,{opacity:0,scale:.7,duration:.1},i-.03).to(ps[i-1],{xPercent:-28,opacity:.35,duration:.45,ease:'power2.inOut'},i).to(ps[i],{xPercent:0,duration:.45,ease:'power2.inOut'},i);
   if(small)t.to(li[i-1],{opacity:0,duration:.2},i).to(li[i],{opacity:1,duration:.3},i+.1);
   else{t.fromTo(li[i],{y:(i-1)*h+88,opacity:0},{y:i*h,opacity:1,duration:.3},i+.1);for(let j=0;j<i;j++)t.to(li[j],{y:j*h,scale:.62,opacity:.5,duration:.3},i+.1)}}
  t.to({}, {duration:.4})})();
/* bloc final : sticky jusqu'au bout, le footer vient se poser dessus sans le cacher entièrement */
gsap.to('.cta',{scale:.95,ease:'none',scrollTrigger:{trigger:'footer',start:'top bottom',end:'max',scrub:true}});
$$('.sb .big,.sb .eye,.cta h2,.cta p,.ct2,.ft').forEach(x=>gsap.from(x,{y:30,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:x,start:'top 88%'}}));
addEventListener('load',()=>ScrollTrigger.refresh());if(document.fonts)document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
