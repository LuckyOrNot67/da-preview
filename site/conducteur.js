/* Page conducteur : pose du covering, étapes sur la carte et estimation indicative. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],R=document.documentElement,MO=R.classList.contains('mo');
$$('.rl').forEach(r=>{r.innerHTML=`<span class="rli">${r.innerHTML}</span>`});
/* Montants à renseigner une fois validés : {min, max} en euros par mois pour le niveau maximal. Tant que c'est vide, aucun montant n'est affiché. */
const RATES=null,LV=['Faible','Moyen','Élevé'];
const f=$('.sf'),gau=$('#gau'),lvl=$('#lvl'),amt=$('#amt'),km=$('#simkm'),kmo=$('#kmo');
const up=()=>{const z=+f.z.value,c=+f.f.value,k=+km.value,s=(z/3*.35+c/3*.35+(k-200)/2800*.3);kmo.textContent=k.toLocaleString('fr-BE')+' km';gau.style.transform=`scaleX(${s})`;lvl.textContent=LV[s<.5?0:s<.78?1:2];if(RATES)amt.textContent=`De ${Math.round(RATES.min*s)} à ${Math.round(RATES.max*s)} € par mois, à titre indicatif`};
f.addEventListener('input',up);up();
if(!MO||!window.gsap)return;
gsap.registerPlugin(ScrollTrigger);
gsap.from('.dh .ln>span',{yPercent:110,duration:1,stagger:.12,ease:'power4.out'});gsap.from('.dh .foot p,.dh .foot .btn',{y:24,opacity:0,duration:.7,stagger:.12,delay:.5,ease:'power3.out'});
/* pose : le film s'étale sur la voiture, la voiture ne bouge pas */
const cs=$('.cvs'),w=document.createElement('div');w.className='stk';cs.before(w);w.append(cs);w.style.height='calc(100svh + 140vh)';
gsap.timeline({scrollTrigger:{trigger:w,start:'top top',end:'+=140%',scrub:true}}).to('.cvc .top',{clipPath:'inset(0 0% 0 0)',ease:'none'},0).to('.cvc .sq',{x:()=>$('.cvc').clientWidth,ease:'none'},0);
/* étapes : la route se trace sur la carte */
const rt=$('.rt'),pt=$('.pt'),L=rt.getTotalLength(),tl=$('.tl');gsap.set(rt,{strokeDasharray:L,strokeDashoffset:L});
ScrollTrigger.create({trigger:tl,start:'top 70%',end:'bottom 60%',scrub:true,onUpdate:s=>{rt.style.strokeDashoffset=L*(1-s.progress);const p=rt.getPointAtLength(L*s.progress);pt.setAttribute('cx',p.x);pt.setAttribute('cy',p.y)}});
$$('.tl li').forEach(l=>ScrollTrigger.create({trigger:l,start:'top 70%',end:'bottom 30%',toggleClass:'on'}));
gsap.from('.crit li',{y:40,opacity:0,stagger:.08,duration:.7,ease:'power3.out',scrollTrigger:{trigger:'.crit',start:'top 85%'}});
})();
