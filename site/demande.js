/* Page demande : le titre monte ligne par ligne, puis le texte, les étapes et le formulaire arrivent. */
(()=>{if(!window.gsap||!document.documentElement.classList.contains('mo'))return;
const $$=s=>[...document.querySelectorAll(s)];
gsap.timeline({defaults:{ease:'power3.out'}})
 .from($$('.dq-t .ln>span'),{yPercent:110,duration:1,stagger:.12,ease:'power4.out'},.1)
 .from($$('.dq-l,.dq-n li'),{y:24,opacity:0,duration:.7,stagger:.08},.5)
 .from('.dq-f',{y:60,opacity:0,duration:.9},.35);
})();
