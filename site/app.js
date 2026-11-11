/* Panneau de réglages, détails au survol et animations du site. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],R=document.documentElement,D=R.dataset,MO=R.classList.contains('mo');
/* réglages */
const SEC=[['app','Application',['Fond clair','Fond sombre']]];
const COL=[['noir','Noir et blanc'],['violet','Violet'],['rouge','Rouge'],['orange','Orange'],['jaune','Jaune']],FONT=[['1','Condensée'],['2','Grasse'],['3','Éditoriale'],['4','Arrondie']];
const KEYS=['m','ov'];
const keep=()=>{try{localStorage.setItem('adsmove-cfg1',JSON.stringify(Object.fromEntries(KEYS.map(k=>[k,D[k]]))))}catch(e){}};
const row=(key,t,opts)=>`<div><h2>${t}</h2><div class="o" data-k="${key}">${opts.map(([v,l])=>`<button data-v="${v}" aria-pressed="${D[key]===v}">${l}</button>`).join('')}</div></div>`;
const cfg=$('#cfg'),cb=$('#cfgb');
if(cfg){
const cfg=$('#cfg'),cb=$('#cfgb');
cfg.innerHTML=row('m','Mode',[['nuit','Nuit'],['jour','Jour']])+row('ov','Logo',[['non','OV séparés'],['oui','OV liés']])+'<div class="ln2"><button id="cfgc">Copier mes choix</button><button id="cfgr">Réinitialiser</button><span class="ok" id="cfgs" role="status"></span></div>';
const openC=o=>{cfg.hidden=!o;cb.setAttribute('aria-expanded',o);try{sessionStorage.setItem('roam-open',o?'1':'')}catch(e){}};
cb.addEventListener('click',()=>openC(cfg.hidden));
addEventListener('keydown',e=>{if(e.key==='Escape'&&!cfg.hidden){openC(false);cb.focus()}});
cfg.addEventListener('click',e=>{const b=e.target.closest('.o button');if(!b)return;const k=b.parentElement.dataset.k;D[k]=b.dataset.v;$$('button',b.parentElement).forEach(x=>x.setAttribute('aria-pressed',x===b));keep();
  if(k==='m'){location.reload();return}
  if(k==='ov')return;
  if(k==='f'){window.ScrollTrigger&&ScrollTrigger.refresh();return}
  try{sessionStorage.setItem('roam-go',k)}catch(e){}location.search='';location.reload()});
$('#cfgc').addEventListener('click',async()=>{const t='Mode : '+D.m+'\nLogo : OV '+(D.ov==='oui'?'liés':'séparés');try{await navigator.clipboard.writeText(t);$('#cfgs').textContent='Copié.'}catch(e){$('#cfgs').textContent=t}});
$('#cfgr').addEventListener('click',()=>{try{localStorage.removeItem('adsmove-cfg1')}catch(e){}location.reload()});
try{if(sessionStorage.getItem('roam-open'))openC(true);const g=sessionStorage.getItem('roam-go');if(g){sessionStorage.removeItem('roam-go');addEventListener('load',()=>setTimeout(()=>{const n=$(`[data-sec=${g}]`);if(n)scrollTo(0,n.getBoundingClientRect().top+scrollY-60)},250))}}catch(e){}
}
/* texte qui roule au survol */
$$('.rl').forEach(r=>{r.innerHTML=`<span class="rli">${r.innerHTML}</span>`});
/* titres sur une ligne : la taille s'ajuste pour que le texte ne soit jamais coupé */
const fit=()=>{const y=$$('.fy .say');y.forEach(x=>x.style.minHeight='');if(y.length){const m=Math.max(...y.map(x=>x.offsetHeight));y.forEach(x=>x.style.minHeight=m+'px')}
  $$('.fit').forEach(h=>{h.style.fontSize='';if(innerWidth<=760||h.scrollWidth<=h.clientWidth)return;h.style.fontSize=parseFloat(getComputedStyle(h).fontSize)*h.clientWidth/h.scrollWidth*.995+'px'})};
fit();addEventListener('resize',fit);if(document.fonts)document.fonts.ready.then(fit);
/* concept : un volet ouvert à la fois, au clic, au survol et au clavier ; l'image suit */
const nc=$('.nc');if(nc){const I=$$('.nc-i',nc),V=$$('.nc-v img',nc);nc.classList.add('js');
  const show=i=>{I.forEach((x,k)=>{x.classList.toggle('on',k===i);$('.nc-t',x).setAttribute('aria-expanded',k===i)});V.forEach((x,k)=>x.classList.toggle('on',k===i))};
  I.forEach((x,i)=>{const b=$('.nc-t',x);b.addEventListener('click',()=>show(i));b.addEventListener('focus',()=>show(i));if(matchMedia('(hover:hover)').matches)x.addEventListener('mouseenter',()=>show(i))})}
if(!MO||!window.gsap)return;
gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
const small=innerWidth<=760;
/* scène sticky : le navigateur fixe la section, sans recalcul à chaque image. len = durée en % d'écran, extra = temps laissé à la section suivante pour passer par-dessus */
const stage=(el,len,extra=0)=>{const w=document.createElement('div');w.className='stk';el.before(w);w.append(el);w.style.height=`calc(100svh + ${len+extra}vh)`;return {w,st:{trigger:w,start:'top top',end:`+=${len}%`,scrub:true,invalidateOnRefresh:true}}};
const cover=(el,w,len,extra=100)=>gsap.fromTo(el,{scale:1},{scale:.95,ease:'none',transformOrigin:'center top',immediateRender:false,scrollTrigger:{trigger:w,start:()=>`top+=${innerHeight*len/100} top`,end:`+=${extra}%`,scrub:true}});
/* héros : le titre monte derrière la voiture, qui est là dès le début */
(()=>{const s=$('.h1g');if(!s)return;const T=gsap.timeline({defaults:{ease:'power3.out'}});
  T.from('.bar .logo',{y:-14,opacity:0,duration:.6}).from('.links a',{y:-14,opacity:0,duration:.5,stagger:.06},'-=.4').from('.acts>*',{opacity:0,duration:.7},'-=.4')
   .from($$('.ln>span',s),{yPercent:110,duration:1,stagger:.12,ease:'power4.out'},.15).from($$('.foot p,.foot a',s),{y:24,opacity:0,duration:.7,stagger:.1},.6)})();
/* concept : scroll continu, chaque carte ralentit en arrivant, puis tout le paquet monte ensemble */
const lit=(trigger,start,endTrigger,end)=>ScrollTrigger.create({trigger,start,endTrigger,end,toggleClass:{targets:'.bar',className:'lite'}});
const sb=$('.sb');let sbW;
if(nc){gsap.from($$('.nc-h>*',nc),{y:36,opacity:0,duration:.8,stagger:.08,ease:'power3.out',scrollTrigger:{trigger:nc,start:'top 78%'}});gsap.from($$('.nc-i,.nc-v',nc),{y:40,opacity:0,duration:.8,stagger:.07,ease:'power3.out',scrollTrigger:{trigger:$('.nc-b',nc),start:'top 82%'}})}
if(sb&&!small)sbW=stage(sb,0,100).w;
/* formats : le nom en grand, puis il remonte et la fiche et les photos arrivent */
const f=$('.fst');if(f){const A=$$('.fy',f),len=A.length*(small?213:240),{w,st}=stage(f,len,100),t=gsap.timeline({scrollTrigger:st});
  if(sbW)w.classList.add('over');
  A.forEach((a,i)=>{const b=i*3,m=$('.mega',a),inf=$('.inf',a),g=$$('.gal figure',a);
   gsap.set(inf,{opacity:0});gsap.set(m,{y:()=>(innerHeight-74-m.offsetHeight)/2});
   if(i){t.fromTo(a,{yPercent:102},{yPercent:0,duration:1,ease:'none'},b-1).to(A[i-1],{scale:.95,duration:1,ease:'none'},b-1)}
   t.to(m,{y:0,scale:small?.6:.48,duration:.7,ease:'power1.inOut'},b+.3)
    .fromTo(g,{y:()=>innerHeight*.6,opacity:0},{y:0,opacity:1,stagger:.07,duration:.6,ease:'power2.out'},b+.5)
    .to(inf,{opacity:1,duration:.3},b+1.1);});t.to({}, {duration:.5});
  cover(f,w,len);
  /* le menu suit les pages blanches : Classique, puis Complet */
  const at=x=>()=>`top+=${innerHeight*len/100*x/t.duration()} top`;lit(w,'top 60px',w,at(2.9));lit(w,at(5.9),'[data-sec=expertise]','top 60px');}
/* page conducteur : la photo part d'une carte et s'ouvre sur tout l'écran, uniquement en transform */
const dh=$('.dh'),rd=$('.rd');let dhW,rdW;
if(dh&&!small){const fg=$('.dhi',dh),tx=$('.dht',dh),t2=$('.dh2',dh),len=170,S=stage(dh,len,100),t=gsap.timeline({scrollTrigger:S.st});dhW=S.w;dhW.style.marginTop=-$('.bar').offsetHeight+'px';
  const B=()=>{const W=dh.offsetWidth,H=dh.offsetHeight,G=parseFloat(getComputedStyle(dh).paddingLeft),e=$('h1',dh),y=tx.offsetTop+e.offsetTop+e.offsetHeight+14,h=H-y-22,w=Math.min(h*W/H,W*.6);return {x:W-G-w,y,s:w/W}};
  gsap.set(fg,{transformOrigin:'0 0'});gsap.from($('h1',dh),{y:40,opacity:0,duration:.9,ease:'power3.out'});gsap.from(fg,{opacity:0,duration:.9});
  t.fromTo(fg,{x:()=>B().x,y:()=>B().y,scale:()=>B().s,borderRadius:()=>24/B().s},{x:0,y:0,scale:1,borderRadius:0,duration:1,ease:'power2.inOut'},0).to(tx,{y:-60,opacity:0,duration:.4,ease:'none'},0).fromTo(t2,{opacity:0},{opacity:1,duration:.3,ease:'none'},.75).to({}, {duration:.3});
  cover(dh,S.w,len)}
/* les six étapes : toute la liste est visible, le point descend la ligne et allume chaque étape */
if(rd&&!small){const tr=$('.rt',rd),L=$$('li',tr),dot=$('.rdd',tr),len=L.length*35,S=stage(rd,len,100),t=gsap.timeline({scrollTrigger:S.st}),Y=l=>l.offsetTop+l.offsetHeight/2-8;rdW=S.w;S.w.classList.add('over');
  gsap.set(L.slice(1),{opacity:.3});
  t.fromTo(dot,{y:()=>Y(L[0])},{y:()=>Y(L[L.length-1]),duration:1,ease:'none'},0);
  L.slice(1).forEach((l,i)=>t.to(l,{opacity:1,duration:.05},(i+1)/(L.length-1)-.05));t.to({}, {duration:.12});
  cover(rd,S.w,len)}
if(dh){lit(dhW||dh,-1,rdW||rd,'top 60px');lit('.sim','top 60px','.sim','bottom 60px')}
/* expertise : les quatre étapes arrivent l'une après l'autre ; la section reste en place pendant que la suivante passe par-dessus */
const nx=$('.nx');if(nx){const C=$$('.nx-c',nx);
  if(small||innerWidth<=1000)C.forEach(k=>gsap.from(k,{y:40,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:k,start:'top 88%'}}));
  else{const S=stage(nx,70,100);gsap.from(C,{y:60,opacity:0,duration:.8,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:S.w,start:'top 70%'}});cover(nx,S.w,70)}}
/* application : uniquement des transformations et de l'opacité. L'étape active est en grand avec son exemple, les précédentes rétrécissent au-dessus */
const ax=$(`[data-sec=app]>[data-v="${D.app}"]`);if(ax){const st=$('.stg',ax),li=$$('.ro li',st),ps=$$('.ps',st),tp=$('.tap',st),spl=$('.spl',st),ttl=$('.ttl',st),n=ps.length,S=stage(st,n*90),t=gsap.timeline({scrollTrigger:S.st}),H=()=>small?0:$('b',li[0]).offsetHeight*.5+6;
  gsap.set(ps,{xPercent:i=>i?100:0});gsap.set(li,{opacity:0,y:small?0:40});
  /* l'application s'ouvre sur son logo, puis le titre laisse toute la place au parcours */
  t.to($('s',spl),{scaleX:1,duration:.85,ease:'none'},0).to(spl,{opacity:0,duration:.2},.85).to(ttl,{opacity:0,y:-50,duration:.25,ease:'power1.in'},.85).to(li[0],{opacity:1,y:0,duration:.3},1.12);
  for(let i=1;i<n;i++){const o=i+1.1;t.fromTo(tp,{opacity:0,scale:1.5},{opacity:1,scale:1,duration:.12},o-.16).to(tp,{opacity:0,scale:.7,duration:.1},o-.03).to(ps[i-1],{xPercent:-28,opacity:.35,duration:.45,ease:'power2.inOut'},o).to(ps[i],{xPercent:0,duration:.45,ease:'power2.inOut'},o);
   if(small)t.to(li[i-1],{opacity:0,duration:.2},o).to(li[i],{opacity:1,duration:.3},o+.1);
   else t.fromTo(li[i],{y:()=>(i-1)*H()+40,opacity:0},{y:()=>i*H(),opacity:1,duration:.3},o+.1).to($('.det',li[i-1]),{opacity:0,duration:.2},o).to($('b',li[i-1]),{scale:.5,opacity:.5,duration:.3},o+.05)}
  t.to({}, {duration:.4});
  if(D.app==='1')lit(S.w,'top 60px',S.w,'bottom 60px')}
/* bloc final : sticky jusqu'au bout, le footer vient se poser dessus sans le cacher entièrement */
const jw=$('.jnw'),sj=()=>{if(jw)jw.style.top=Math.min(0,innerHeight-jw.offsetHeight)+'px'};sj();addEventListener('resize',sj);
if($('.endw'))gsap.to('.cta',{scale:.95,ease:'none',scrollTrigger:{trigger:'footer',start:'top bottom',end:'max',scrub:true}});
$$('.sb .big,.sb .eye,.cta>h2,.cta>p,.jnh>*,.ct2,.ft').forEach(x=>gsap.from(x,{y:30,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:x,start:'top 88%'}}));
addEventListener('load',()=>{sj();ScrollTrigger.refresh()});if(document.fonts)document.fonts.ready.then(()=>{sj();ScrollTrigger.refresh()});
})();
