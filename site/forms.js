/* Formulaires : validation, états d'envoi et d'erreur. Sans adresse d'envoi configurée, rien n'est transmis et le visiteur le sait. */
(()=>{
const RULE={email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),phone:v=>!v||/^[+0-9 ()./-]{8,20}$/.test(v)};
document.querySelectorAll('[data-form]').forEach(f=>{
  const st=f.querySelector('[data-st]'),btn=f.querySelector('[type=submit]'),fields=[...f.querySelectorAll('[required],[name=phone]')],lab=btn.textContent;
  const msg=x=>{const v=(x.value||'').trim();if(x.type==='checkbox')return x.checked?'':'Merci de cocher cette case pour continuer.';if(x.required&&!v)return 'Ce champ est obligatoire.';if(x.name==='email'&&!RULE.email(v))return 'Vérifiez votre adresse e-mail.';if(x.name==='phone'&&!RULE.phone(v))return 'Vérifiez votre numéro de téléphone.';if(x.type==='number'&&v){const n=+v;if(x.min&&n<+x.min||x.max&&n>+x.max)return 'Vérifiez cette valeur.'}return ''};
  const check=x=>{const m=msg(x),e=f.querySelector('#'+(x.name==='consent'?'consent':x.id)+'-e');x.setAttribute('aria-invalid',!!m);if(e){e.textContent=m;x.setAttribute('aria-describedby',e.id)}return !m};
  fields.forEach(x=>{x.addEventListener('blur',()=>{if(x.value&&x.type!=='checkbox')check(x)});x.addEventListener('input',()=>{if(x.getAttribute('aria-invalid')==='true')check(x)})});
  f.addEventListener('submit',async e=>{e.preventDefault();
    const bad=fields.filter(x=>!check(x));if(bad.length){st.textContent='Merci de corriger les champs signalés.';bad[0].focus();return}
    if(f.website.value)return;
    const cfg=window.SITE_CONFIG||{},url=cfg[f.dataset.form];
    if(!url){st.textContent="L'envoi n'est pas encore activé : rien n'a été transmis. Vos informations restent dans ce formulaire.";return}
    const data=Object.fromEntries(new FormData(f));delete data.website;data.consent=true;data.page=location.pathname;
    btn.disabled=true;btn.textContent='Envoi en cours…';st.textContent='';
    const ac=new AbortController(),to=setTimeout(()=>ac.abort(),cfg.timeoutMs||12000);
    try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:ac.signal});if(!r.ok)throw 0;f.reset();st.textContent='Merci, votre demande est bien arrivée. Nous revenons vers vous.'}
    catch(_){st.textContent="L'envoi a échoué. Vos informations sont toujours là, vous pouvez réessayer."}
    finally{clearTimeout(to);btn.disabled=false;btn.textContent=lab}
  });
});
})();
