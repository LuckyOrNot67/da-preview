/* Espace conducteur : mises en scène propres à la page (photo, téléphones, formats, frise). */
(()=>{if(!window.gsap||!window.ScrollTrigger||!document.documentElement.classList.contains('mo'))return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],small=innerWidth<=760;
const on=(trigger,start='top 78%')=>({trigger,start});
/* haut de page : la photo s'ouvre, le titre monte ligne par ligne, puis les trois atouts */
gsap.timeline({defaults:{ease:'power3.out'}})
 .fromTo('.dv-hc',{clipPath:'inset(6% 4% 6% 4% round 28px)'},{clipPath:'inset(0% 0% 0% 0% round 28px)',duration:1.3,ease:'power3.inOut'},0)
 .from('.dv-hc img',{scale:1.15,duration:1.8},0)
 .from($$('.dv-ht .ln>span'),{yPercent:110,duration:1,stagger:.1,ease:'power4.out'},.35)
 .from($$('.dv-ht>p,.dv-ha'),{y:20,opacity:0,duration:.7,stagger:.1},.75)
 .from($$('.dv-hb li'),{y:24,opacity:0,duration:.7,stagger:.08},.9);
gsap.to('.dv-hc img',{yPercent:8,ease:'none',scrollTrigger:{trigger:'.dv-h',start:'top top',end:'bottom top',scrub:true}});
/* application : le téléphone du milieu monte, les deux autres sortent de derrière lui et s'inclinent ; ensuite un léger mouvement au défilement, porté par les supports */
{const ph=$('.dv-ph');if(ph){const P=$$('.ipn',ph),W=$$('.phw',ph);
 gsap.from($$('.dv-at>*,.dv-af li'),{y:30,opacity:0,duration:.8,stagger:.08,ease:'power3.out',scrollTrigger:on('.dv-app')});
 gsap.set(P[0],{x:'60%',rotate:0,scale:.9,opacity:0});gsap.set(P[2],{x:'-60%',rotate:0,scale:.9,opacity:0});gsap.set(P[1],{y:120,opacity:0});
 gsap.timeline({scrollTrigger:on(ph,'top 80%')})
  .to(P[1],{y:0,opacity:1,duration:1,ease:'power3.out'})
  .to(P[0],{x:0,rotate:-6,scale:1,opacity:1,duration:1,ease:'power3.out'},.35)
  .to(P[2],{x:0,rotate:6,scale:1,opacity:1,duration:1,ease:'power3.out'},.35);
 if(!small)W.forEach((w,i)=>gsap.fromTo(w,{y:[40,0,60][i]},{y:[-40,-20,-60][i],ease:'none',scrollTrigger:{trigger:'.dv-app',start:'top bottom',end:'bottom top',scrub:true}}))}}
/* formats : chaque ligne arrive, la voiture entre par la gauche, le montant compte jusqu'à sa valeur */
gsap.from($$('.dv-st>*'),{y:30,opacity:0,duration:.8,stagger:.1,ease:'power3.out',scrollTrigger:on('.dv-fm')});
$$('.dv-fc').forEach(c=>{const N=$$('.n',c),t=gsap.timeline({scrollTrigger:on(c,'top 86%')});
 t.from(c,{opacity:0,y:40,duration:.8,ease:'power3.out'})
  .from($('img',c),{x:-120,opacity:0,duration:1.1,ease:'power3.out'},.1)
  .from($$('.dv-fi>*',c),{x:30,opacity:0,duration:.7,stagger:.07,ease:'power3.out'},.25)
  .add(()=>N.forEach(n=>{const v=+n.dataset.v,o={v:0};gsap.to(o,{v,duration:1,ease:'power2.out',onUpdate:()=>n.textContent=Math.round(o.v)})}),.35)});
/* étapes : l'app réelle tourne dans l'iPhone ; le défilement la pilote (inscription, campagnes, fiche, participation, accueil) */
{const sec=$('.dv-sy');if(sec){const T=$$('.sy-t',sec),Dd=$$('.sy-d li',sec),n=T.length,len=small?300:360,scr=$('.sy-i .iph-scr',sec),box=$('.iph-fr',sec),fr=$('iframe',sec);
 const w=document.createElement('div');w.className='dv-tlw';w.style.height=`calc(100svh + ${len}vh)`;sec.before(w);w.append(sec);sec.classList.add('pin');
 const HASH=['#/inscription/1','#/campagnes','#/campagne/studio-nord','#/'],TONE=['lt','lt','dk','dk'];
 let W=null,ready=false,P=0,cur=-1,sheet=false;
 const fit=()=>{const r=box.getBoundingClientRect();if(r.width)fr.style.transform=`scale(${r.width/390})`};addEventListener('resize',fit);
 const q=(s,all)=>{const d=W.document;const l=[...d.querySelectorAll(s)].filter(e=>e.offsetParent!==null);return all?l:l.pop()};
 const apply=()=>{const ph=Math.min(n-1,Math.floor(P*n)),lp=Math.min(1,P*n-ph);
  if(ph!==cur){cur=ph;T.forEach((x,k)=>x.classList.toggle('on',k===ph));Dd.forEach((x,k)=>x.classList.toggle('on',k<=ph));scr.classList.toggle('dk',TONE[ph]==='dk');scr.classList.toggle('lt',TONE[ph]==='lt')}
  if(!ready)return;
  try{
   if(sheet&&!(ph===2&&lp>.55)){W.document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));sheet=false}
   if(W.location.hash!==HASH[ph])W.location.hash=HASH[ph];
   if(ph===0){const i=q('input[type=text],input:not([type])');if(i){const v='Sam'.slice(0,Math.round(Math.min(1,lp*1.8)*3));if(i.value!==v)i.value=v}}
   if(ph===1){const c=q('.clist');if(c)c.scrollTop=lp*(c.scrollHeight-c.clientHeight)}
   if(ph===2){const c=q('[data-dscroll]');if(c)c.scrollTop=Math.min(1,lp/.5)*(c.scrollHeight-c.clientHeight)*.6;
    if(lp>.55&&!sheet){const btn=q('[data-sheet=participer]');if(btn){btn.click();sheet=true}}}
  }catch(e){}};
 fr.addEventListener('load',()=>{W=fr.contentWindow;fit();
  const start=()=>{const d=W.document,demo=[...d.querySelectorAll('button,a')].find(b=>/profil d.exemple/i.test(b.textContent));if(demo)demo.click();
   setTimeout(()=>{ready=true;cur=-1;apply();scr.classList.add('live')},700)};
  setTimeout(start,400)});
 const load=()=>{if(!fr.src)fr.src='../../app/index.html'};
 ScrollTrigger.create({trigger:w,start:'top 250%',onEnter:load,onEnterBack:load});
 gsap.from([$('h2',sec),$('.sy-i',sec)],{y:60,opacity:0,duration:1,stagger:.12,ease:'power3.out',scrollTrigger:on(w,'top 70%')});
 apply();
 ScrollTrigger.create({trigger:w,start:'top top',end:`+=${len}%`,onUpdate:s=>{P=s.progress;apply()}})}}
/* vie privée et questions */
gsap.from($$('.dv-pvt>*'),{yPercent:30,opacity:0,duration:.9,stagger:.12,ease:'power3.out',scrollTrigger:on('.dv-pv')});
gsap.from($$('.dv-pv li'),{y:30,opacity:0,duration:.7,stagger:.08,ease:'power3.out',scrollTrigger:on('.dv-pv ul','top 85%')});
gsap.from($$('.dv-fq h2,.dv-fq .qa'),{y:30,opacity:0,duration:.7,stagger:.06,ease:'power3.out',scrollTrigger:on('.dv-fq')});
})();
