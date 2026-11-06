/* Réglages du site public. Tant que quoteEndpoint est vide, le formulaire n'envoie rien et le dit clairement. */
window.SITE_CONFIG={
  quoteEndpoint:'',   // URL HTTPS qui reçoit la demande de devis en POST JSON
  driverEndpoint:'',  // URL HTTPS qui reçoit les candidatures conducteur en POST JSON
  timeoutMs:12000
};
