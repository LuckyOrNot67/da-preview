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
{const ph=$('.dv-ph');if(ph){const P=$$('.phn',ph),W=$$('.phw',ph);
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
/* frise : la section reste à l'écran, la ligne avance au défilement et chaque étape s'allume quand la ligne touche son point */
{const sec=$('.dv-tl'),ol=sec&&$('ol',sec);if(ol){const L=$$('li',ol),D=$$('li i',ol),len=small?140:160;
 const w=document.createElement('div');w.className='dv-tlw';w.style.height=`calc(100svh + ${len}vh)`;sec.before(w);w.append(sec);sec.classList.add('pin');
 const geo=()=>{const r=ol.getBoundingClientRect(),c=D.map(d=>{const b=d.getBoundingClientRect();return small?b.top+b.height/2-r.top:b.left+b.width/2-r.left});ol.style.setProperty('--a',c[0]+'px');ol.style.setProperty('--z',c[c.length-1]+'px');return c};
 let C=geo();addEventListener('resize',()=>{C=geo()});
 gsap.from($$('.dv-tl h2'),{y:30,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:on(w,'top 70%')});
 ScrollTrigger.create({trigger:w,start:'top top',end:`+=${len}%`,scrub:true,onRefresh:()=>{C=geo()},onUpdate:s=>{const p=Math.min(1,s.progress*1.15);ol.style.setProperty('--d',p);const x=C[0]+(C[C.length-1]-C[0])*p;L.forEach((l,k)=>l.classList.toggle('on',x>=C[k]-1))}});}}
/* vie privée et questions */
gsap.from($$('.dv-pvt>*'),{yPercent:30,opacity:0,duration:.9,stagger:.12,ease:'power3.out',scrollTrigger:on('.dv-pv')});
gsap.from($$('.dv-pv li'),{y:30,opacity:0,duration:.7,stagger:.08,ease:'power3.out',scrollTrigger:on('.dv-pv ul','top 85%')});
gsap.from($$('.dv-fq h2,.dv-fq .qa'),{y:30,opacity:0,duration:.7,stagger:.06,ease:'power3.out',scrollTrigger:on('.dv-fq')});
})();
