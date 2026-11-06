/* Panneau de réglages, détails au survol et animations de chaque variante. Seule la variante affichée s'anime. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],R=document.documentElement,D=R.dataset,MO=R.classList.contains('mo');
/* réglages */
const SEC=[['hero','Premier écran',['Titre géant','Voiture devant le titre','Diagonale et photo','Route tracée']],['concept','Concept',['Grande phrase et image','Pages qui arrivent','Objets 3D']],['formats','Styles de campagne',['Images qui arrivent','Pleine couleur','Mise en lumière','Au clic']],['expertise','Expertise',['Tickets','Mots géants','Liste fine']],['app','Application',['Téléphone fixe','Onglets','Pleine couleur','Deux téléphones']]];
const COL=[['noir','Noir et blanc'],['violet','Violet'],['rouge','Rouge'],['orange','Orange'],['jaune','Jaune']],FONT=[['1','Condensée'],['2','Grasse'],['3','Éditoriale'],['4','Arrondie']];
const KEYS=['c','m','f',...SEC.map(s=>s[0])];
const keep=()=>{try{localStorage.setItem('roam-cfg',JSON.stringify(Object.fromEntries(KEYS.map(k=>[k,D[k]]))))}catch(e){}};
const row=(key,t,opts)=>`<div><h2>${t}</h2><div class="o" data-k="${key}">${opts.map(([v,l])=>`<button data-v="${v}" aria-pressed="${D[key]===v}">${l}</button>`).join('')}</div></div>`;
const cfg=$('#cfg'),cb=$('#cfgb');
cfg.innerHTML=row('m','Mode',[['nuit','Nuit'],['jour','Jour']])+row('c','Couleur du site',COL)+row('f','Police',FONT)+SEC.map(([k,t,o])=>row(k,t,o.map((l,i)=>[String(i+1),`${i+1}. ${l}`]))).join('')+'<div class="ln2"><button id="cfgc">Copier mes choix</button><button id="cfgr">Réinitialiser</button><span class="ok" id="cfgs" role="status"></span></div>';
const openC=o=>{cfg.hidden=!o;cb.setAttribute('aria-expanded',o);try{sessionStorage.setItem('roam-open',o?'1':'')}catch(e){}};
cb.addEventListener('click',()=>openC(cfg.hidden));
addEventListener('keydown',e=>{if(e.key==='Escape'&&!cfg.hidden){openC(false);cb.focus()}});
cfg.addEventListener('click',e=>{const b=e.target.closest('.o button');if(!b)return;const k=b.parentElement.dataset.k;D[k]=b.dataset.v;$$('button',b.parentElement).forEach(x=>x.setAttribute('aria-pressed',x===b));keep();
  if(['c','m'].includes(k))return;
  if(k==='f'){window.ScrollTrigger&&ScrollTrigger.refresh();return}
  /* une variante change : la page recharge et revient sur la section modifiée */
  try{sessionStorage.setItem('roam-go',k)}catch(e){}location.search='';location.reload()});
$('#cfgc').addEventListener('click',async()=>{const t=['Couleur : '+COL.find(c=>c[0]===D.c)[1]+', '+D.m,'Police : '+FONT.find(f=>f[0]===D.f)[1],...SEC.map(([k,n,o])=>`${n} : ${D[k]}. ${o[D[k]-1]}`)].join('\n');try{await navigator.clipboard.writeText(t);$('#cfgs').textContent='Copié.'}catch(e){$('#cfgs').textContent=t}});
$('#cfgr').addEventListener('click',()=>{try{localStorage.removeItem('roam-cfg')}catch(e){}location.reload()});
try{if(sessionStorage.getItem('roam-open'))openC(true);const g=sessionStorage.getItem('roam-go');if(g){sessionStorage.removeItem('roam-go');addEventListener('load',()=>setTimeout(()=>{const n=$(`[data-sec=${g}]`);if(n)scrollTo(0,n.getBoundingClientRect().top+scrollY-60)},250))}}catch(e){}
/* texte qui roule au survol */
$$('.rl').forEach(r=>{r.innerHTML=`<span class="rli">${r.innerHTML}</span>`});
/* styles au clic : fonctionne aussi sans animation */
const f4=$('[data-formats="4"] .f4');
if(f4){let s=0,w=0;const up=()=>{$$('.pic',f4).forEach(p=>p.classList.toggle('on',+p.dataset.s===s&&+p.dataset.w===w));$$('.inf',f4).forEach(p=>p.classList.toggle('on',+p.dataset.s===s));$$('[role=tab]',f4).forEach((t,i)=>t.setAttribute('aria-selected',i===s));$('[role=tabpanel]',f4).setAttribute('aria-labelledby','f4t'+s);$$('.sw button',f4).forEach(b=>b.setAttribute('aria-pressed',+b.dataset.w===w))};
  $$('[role=tab]',f4).forEach(t=>{t.addEventListener('click',()=>{s=+t.dataset.i;w=0;up()});t.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches){s=+t.dataset.i;up()}})});
  $$('.sw button',f4).forEach(b=>b.addEventListener('click',()=>{w=+b.dataset.w;up()}));up()}
/* liste fine : l'image suit la souris */
const e3=$('[data-expertise="3"] .e3');
if(e3&&MO&&matchMedia('(hover:hover)').matches){const pv=$('.pv',e3),im=$$('img',pv),ls=$$('li',e3);pv.style.height='200px';
  ls.forEach((l,i)=>{l.addEventListener('mouseenter',()=>{pv.style.opacity=1;im.forEach((m,j)=>m.classList.toggle('on',j===i))});l.addEventListener('mouseleave',()=>pv.style.opacity=0)});
  addEventListener('mousemove',e=>{pv.style.transform=`translate(${e.clientX+24}px,${e.clientY-100}px) rotate(-3deg)`},{passive:true})}
if(!MO||!window.gsap)return;
gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
const pin=(el,end,scrub=.6)=>({trigger:el,start:'top top',end:'+='+end,pin:true,scrub,anticipatePin:1});
const small=innerWidth<=760;
/* héros : seuls les mots et les fonds bougent, jamais la voiture */
const H={
1(s){const l=$$('.ln>span',s);gsap.from(l,{yPercent:110,duration:1,stagger:.12,ease:'power4.out'});gsap.to(l[0],{xPercent:-8,scrollTrigger:{trigger:s,start:'top top',end:'bottom top',scrub:.4}});gsap.to(l[1],{xPercent:8,scrollTrigger:{trigger:s,start:'top top',end:'bottom top',scrub:.4}})},
2(s){gsap.from($$('.ln>span',s),{yPercent:110,duration:1,stagger:.12,ease:'power4.out'});gsap.to($('h1',s),{scale:.86,opacity:.25,scrollTrigger:{trigger:s,start:'top top',end:'bottom top',scrub:.4}})},
3(s){gsap.from($$('.ln>span',s),{yPercent:110,duration:1,stagger:.12,ease:'power4.out'});const t=gsap.timeline({scrollTrigger:pin(s,'90%')});t.fromTo($('.dg',s),{clipPath:small?'polygon(0% 0%,100% 0%,100% 34%,0% 48%)':'polygon(58% 0%,100% 0%,100% 100%,38% 100%)'},{clipPath:'polygon(0% 0%,100% 0%,100% 100%,0% 100%)',ease:'none'}).to($('.tx',s),{opacity:0,y:-40,ease:'none',duration:.5},0)},
4(s){gsap.from($$('.ln>span',s),{yPercent:110,duration:1,stagger:.12,ease:'power4.out'});const p=$('.route path',s),L=p.getTotalLength();gsap.set(p,{strokeDasharray:L,strokeDashoffset:L});gsap.to(p,{strokeDashoffset:L*.45,duration:1.6,ease:'power2.inOut',delay:.3});gsap.to(p,{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:s,start:'top top',end:'bottom 40%',scrub:.5}})}};
const C={
1(s){const w=$$('.w',s);ScrollTrigger.create({trigger:$('.st',s),start:'top 75%',end:'bottom 45%',scrub:true,onUpdate:o=>{const n=Math.round(o.progress*w.length);w.forEach((x,i)=>x.classList.toggle('on',i<n))}});gsap.from($('.im',s),{clipPath:'inset(14% 18% round 24px)',ease:'none',scrollTrigger:{trigger:$('.im',s),start:'top 95%',end:'top 20%',scrub:.5}});gsap.from($('.im img',s),{scale:1.22,ease:'none',scrollTrigger:{trigger:$('.im',s),start:'top 95%',end:'bottom top',scrub:.5}})},
2(s){const p=$$('.pg',s);p.slice(0,-1).forEach((x,i)=>{gsap.to(x,{scale:.94,ease:'none',scrollTrigger:{trigger:p[i+1],start:'top bottom',end:'top top',scrub:true}})});p.slice(1).forEach(x=>gsap.from($$('.huge,p,img',x),{y:50,opacity:0,stagger:.08,duration:.7,ease:'power3.out',scrollTrigger:{trigger:x,start:'top 55%'}}))},
3(s){$$('.row',s).forEach((r,i)=>{gsap.from($('img',r),{scale:.5,rotate:i%2?18:-18,ease:'none',scrollTrigger:{trigger:r,start:'top 95%',end:'top 35%',scrub:.5}});gsap.from($$('h3,p',r),{y:50,opacity:0,stagger:.1,duration:.8,ease:'power3.out',scrollTrigger:{trigger:r,start:'top 70%'}})})}};
/* styles : images et pages bougent, les voitures restent immobiles */
const F={
1(s){$$('.fw',s).forEach(a=>{const im=$$('.ims img',a),t=gsap.timeline({scrollTrigger:pin(a,small?'240%':'300%')});
  gsap.set(im,{y:()=>innerHeight*1.2});
  t.from($('.ct',a),{opacity:0,y:40,duration:.3},0);
  im.forEach((m,i)=>{const d=i*.09;t.to(m,{y:0,duration:.9,ease:'power2.out'},d).to(m,{y:()=>-innerHeight*1.2,duration:.9,ease:'power2.in'},2+d)});
  t.to($('.ct',a),{opacity:0,duration:.3},2.9).to($('.whole',a),{opacity:1,duration:.5},3).from($('.whole img',a),{scale:.72,duration:.8,ease:'power2.out'},3).to({}, {duration:.6})})},
2(s){$$('.fy',s).forEach(a=>{const sh=$('.sheetp',a),t=gsap.timeline({scrollTrigger:pin(a,'230%')});
  t.from($('.mega',a),{yPercent:30,opacity:0,duration:.4}).to({}, {duration:.3})
   .to(sh,{y:0,borderTopLeftRadius:0,borderTopRightRadius:0,duration:1,ease:'none'})
   .from($$('.w',sh),{opacity:.12,stagger:.06,duration:.2},'-=.5')
   .from($$('.fan img',sh),{y:()=>innerHeight*.5,rotate:i=>(i-1.5)*9,stagger:.08,duration:.6,ease:'power2.out'},'-=.6').to({}, {duration:.4})})},
3(s){const st=$('.st3',s),v=$$('.vw',st),T=$$('.t',st),l=$('.lamp',st),t=gsap.timeline({scrollTrigger:pin(st,'900%',.8)});
  v.forEach((x,i)=>{const k=Math.floor(i/2),b=i*1.5,hs=$$('.hs',x);
   t.set(x,{opacity:1},b).fromTo(l,{'--r':'0%'},{'--r':'70%',duration:.5,ease:'power2.out'},b);
   if(i%2===0)t.to(T[k],{opacity:1,duration:.3},b);
   hs.forEach((h,n)=>t.to(h,{opacity:1,duration:.12},b+.45+n*.14));
   t.to(l,{'--r':'0%',duration:.4,ease:'power2.in'},b+1.1).set(x,{opacity:0},b+1.5);
   if(i%2)t.to(T[k],{opacity:0,duration:.3},b+1.1)});
  t.set(l,{opacity:0},9).to($('.line',st),{opacity:1,duration:.5},9.05).from($$('.line figure',st),{opacity:0,stagger:.2,duration:.4},9.1).to({}, {duration:.5})}};
const E={
1(s){if(small){$$('.tk',s).forEach(k=>gsap.from(k,{y:60,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:k,start:'top 88%'}}));return}
  const k=$$('.tk',s),t=gsap.timeline({scrollTrigger:pin(s,'220%')});k.forEach((c,i)=>t.from(c,{y:()=>innerHeight,rotate:(i-1.5)*14,duration:1,ease:'power2.out'},i*.55));t.to({}, {duration:.5})},
2(s){$$('.giant',s).forEach((g,i)=>{gsap.from(g,{xPercent:i%2?7:-7,ease:'none',scrollTrigger:{trigger:g,start:'top bottom',end:'top 45%',scrub:.5}});gsap.to($('svg',g),{rotate:180,ease:'none',scrollTrigger:{trigger:g,start:'top bottom',end:'bottom top',scrub:.5}})})},
3(s){$$('li',s).forEach(l=>gsap.from(l,{y:30,opacity:0,duration:.6,ease:'power3.out',scrollTrigger:{trigger:l,start:'top 90%'}}))}};
const screens=ph=>$$('.ps',ph);
const A={
1(s){const st=$('.st4',s),ps=screens(st),T=$$('.t',st),d=$$('.dots i',st),t=gsap.timeline({scrollTrigger:{...pin(st,'320%'),onUpdate:o=>{const n=Math.min(3,Math.floor(o.progress*4));d.forEach((x,i)=>x.classList.toggle('on',i===n))}}});
  gsap.set(T[0],{opacity:1});gsap.set(ps,{yPercent:i=>i?100:0,opacity:1});
  for(let i=1;i<4;i++)t.to(T[i-1],{opacity:0,y:-30,duration:.3},i).fromTo(T[i],{opacity:0,y:30},{opacity:1,y:0,duration:.3},i+.15).to(ps[i-1],{yPercent:-22,scale:.92,duration:.6},i).to(ps[i],{yPercent:0,duration:.6},i);t.to({}, {duration:.6})},
2(s){const st=$('.st5',s),ps=screens(st),W=$$('.wd',st),tb=$('.tabs i',st),f=$('.flash',st),b=$$('.pill button',st),tr={...pin(st,'380%'),onUpdate:o=>{const n=Math.min(3,Math.floor(o.progress*4));b.forEach((x,i)=>x.classList.toggle('on',i===n))}},t=gsap.timeline({scrollTrigger:tr});
  gsap.set(ps,{xPercent:i=>i?100:0,opacity:1});gsap.set(W[0],{opacity:1});
  t.from($('.ph',st),{scale:.62,duration:.5},0);
  for(let i=1;i<4;i++){t.to(ps[i-1],{xPercent:-100,duration:.45,ease:'power2.inOut'},i).to(ps[i],{xPercent:0,duration:.45,ease:'power2.inOut'},i).to(tb,{xPercent:100*i,duration:.45,ease:'power2.inOut'},i).to(W[i-1],{opacity:0,duration:.2},i).to(W[i],{opacity:1,duration:.2},i+.25)
   if(i===2)t.to(f,{scaleY:1,duration:.25},i-.05).to(f,{scaleY:0,duration:.25},i+.4)}
  t.to({}, {duration:.6});
  b.forEach((x,i)=>x.addEventListener('click',()=>{const S=t.scrollTrigger;scrollTo({top:S.start+(S.end-S.start)*((i+.1)/4),behavior:'smooth'})}))},
3(s){const st=$('.st6',s),ps=screens(st),M=$$('.mega',st),P=$$('.cap p',st),t=gsap.timeline({scrollTrigger:pin(st,'320%')}),O=['var(--sig)','var(--ink)','var(--a)','var(--bg2)'];
  gsap.set(ps,{opacity:i=>i?0:1});gsap.set([M[0],P[0]],{opacity:1});
  for(let i=1;i<4;i++)t.to(ps[i-1],{opacity:0,duration:.3},i).to(ps[i],{opacity:1,duration:.3},i).to([M[i-1],P[i-1]],{opacity:0,duration:.2},i).to([M[i],P[i]],{opacity:1,duration:.2},i+.15);t.to({}, {duration:.6})},
4(s){$$('.one',s).forEach((o,i)=>gsap.from(o,{y:90,rotate:i?5:-5,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:o,start:'top 85%'}}))}};
const run=(k,M)=>{const n=$(`[data-sec=${k}]>[data-v="${D[k]}"]`);if(n&&M[D[k]])M[D[k]](n)};
run('hero',H);run('concept',C);run('formats',F);run('expertise',E);run('app',A);
$$('.sh .big,.sh .eye').forEach(x=>gsap.from(x,{y:30,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:x,start:'top 88%'}}));
addEventListener('load',()=>ScrollTrigger.refresh());if(document.fonts)document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
