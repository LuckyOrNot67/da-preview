/* Espace conducteur : mises en scène propres à la page (photo, téléphones, formats, frise). */
(()=>{if(!window.gsap||!window.ScrollTrigger||!document.documentElement.classList.contains('mo'))return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],small=innerWidth<=760;
const on=(trigger,start='top 78%')=>({trigger,start});
/* haut de page : la photo s'ouvre, le titre monte ligne par ligne */
gsap.timeline({defaults:{ease:'power3.out'}})
 .fromTo('.dv-hc',{clipPath:'inset(6% 4% 6% 4% round 28px)'},{clipPath:'inset(0% 0% 0% 0% round 28px)',duration:1.3,ease:'power3.inOut'},0)
 .from('.dv-hc img',{scale:1.15,duration:1.8},0)
 .from($$('.dv-ht .ln>span'),{yPercent:110,duration:1,stagger:.1,ease:'power4.out'},.35)
 .from($$('.dv-ht>p,.dv-ha'),{y:20,opacity:0,duration:.7,stagger:.1},.75)
 .from($$('.dv-hb li'),{y:30,opacity:0,duration:.7,stagger:.08},.9);
gsap.to('.dv-hc img',{yPercent:8,ease:'none',scrollTrigger:{trigger:'.dv-h',start:'top top',end:'bottom top',scrub:true}});
/* application : le texte arrive, les téléphones montent puis bougent à des vitesses différentes */
gsap.from($$('.dv-at>*,.dv-af li'),{y:30,opacity:0,duration:.8,stagger:.08,ease:'power3.out',scrollTrigger:on('.dv-app')});
gsap.from($$('.phn'),{y:140,opacity:0,duration:1.1,stagger:.12,ease:'power3.out',scrollTrigger:on('.dv-ph','top 85%')});
if(!small)$$('.phn').forEach((p,i)=>gsap.to(p,{y:[-30,-90,-10][i],ease:'none',scrollTrigger:{trigger:'.dv-app',start:'top bottom',end:'bottom top',scrub:true}}));
/* formats : les fiches arrivent l'une après l'autre, la voiture glisse dans sa fiche */
gsap.from($$('.dv-st>*'),{y:30,opacity:0,duration:.8,stagger:.1,ease:'power3.out',scrollTrigger:on('.dv-fm')});
$$('.dv-fc').forEach((c,i)=>{const t=gsap.timeline({scrollTrigger:on(c,'top 88%')});t.from(c,{y:60,opacity:0,duration:.9,delay:small?0:i*.1,ease:'power3.out'}).from($('img',c),{x:60,opacity:0,duration:1,ease:'power3.out'},'-=.6')});
/* frise : la ligne se trace au défilement, chaque étape s'allume quand la ligne l'atteint */
const tl=$('.dv-tl ol');if(tl){const L=$$('li',tl);gsap.from($('.dv-tl h2'),{y:30,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:on('.dv-tl')});
 ScrollTrigger.create({trigger:tl,start:'top 75%',end:small?'bottom 55%':'bottom 45%',scrub:true,onUpdate:s=>{tl.style.setProperty('--d',s.progress);L.forEach((l,k)=>l.classList.toggle('on',s.progress>=k/(L.length-1)-.02))}})}
/* vie privée et questions */
gsap.from($$('.dv-pvt>*'),{yPercent:30,opacity:0,duration:.9,stagger:.12,ease:'power3.out',scrollTrigger:on('.dv-pv')});
gsap.from($$('.dv-pv li'),{y:30,opacity:0,duration:.7,stagger:.08,ease:'power3.out',scrollTrigger:on('.dv-pv ul','top 85%')});
gsap.from($$('.dv-fq h2,.dv-fq .qa'),{y:30,opacity:0,duration:.7,stagger:.06,ease:'power3.out',scrollTrigger:on('.dv-fq')});
})();
