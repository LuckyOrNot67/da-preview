/* Page conducteur : estimation indicative. Les animations sont communes avec la homepage (app.js). */
(()=>{
const $=s=>document.querySelector(s);
/* Montants à renseigner une fois validés : {min, max} en euros par mois pour le niveau maximal. Tant que c'est vide, aucun montant n'est affiché. */
const RATES=null,LV=['Faible','Moyen','Élevé'];
const f=$('.sf'),gau=$('#gau'),lvl=$('#lvl'),amt=$('#amt'),km=$('#simkm'),kmo=$('#kmo');
const up=()=>{const z=+f.z.value,c=+f.f.value,k=+km.value,s=(z/3*.35+c/3*.35+(k-200)/2800*.3);kmo.textContent=k.toLocaleString('fr-BE')+' km';gau.style.transform=`scaleX(${s})`;lvl.textContent=LV[s<.5?0:s<.78?1:2];if(RATES)amt.textContent=`De ${Math.round(RATES.min*s)} à ${Math.round(RATES.max*s)} € par mois, à titre indicatif`};
f.addEventListener('input',up);up();
})();
