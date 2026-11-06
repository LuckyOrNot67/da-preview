# Audit éditorial V9

## Architecture retenue
- Homepage : annonceurs uniquement. Premier écran, concept, trois formats, expertise, espace annonceur, demande.
- Page `conducteur/` : parcours séparé, accessible depuis le menu et le footer.
- Page `demande/` : formulaire annonceur, cible de tous les boutons « Créer ma campagne ».

## Audit par section
| Section | Ce que le visiteur comprend | Questions sans réponse | Ajout retenu |
|---|---|---|---|
| Premier écran | Une marque sur une voiture | Qui êtes-vous, que vendez-vous ? | Phrase « agence de publicité sur véhicules », lien vers les formats |
| Concept | Trois étapes | Pourquoi pas une affiche ? Qu'est-ce qui est inclus ? | Comparaison avec l'affichage fixe, trois points concrets par étape |
| Formats | Trois niveaux d'habillage | À quoi sert chacun, quelles limites ? | Fiche par format : surfaces, intérêt, visibilité, graphisme, contraintes |
| Expertise | Quatre métiers | Que comprend chaque métier ? | Option A : détail à l'ouverture, au clic, au toucher et au clavier. Pas de cartes de remplissage |
| Application | Un téléphone qui change | Pour qui, que voit-on vraiment ? | Récit en cinq temps, mention claire de démonstration |
| Bloc final | Un appel à l'action | Où aller ? | Boutons reliés aux pages `demande/` et `conducteur/` |

## Page conducteur
Principe, pose du covering, six étapes, estimation indicative, véhicules, FAQ, candidature.

## Scroll : causes mesurées
- Épinglage en JavaScript : un calcul de mise en page à chaque image dans les deux sections. Remplacé par `position: sticky`.
- Application : animation de `font-size`, donc mise en page à chaque image. Remplacée par des transformations.
- Barre du haut : `backdrop-filter` redessiné au scroll. Retiré.
- Concept : cartes arrêtées net sur leur position. Décélération progressive.

## À valider avant publication
Voir le résumé de livraison : montants, critères véhicules, réponses FAQ, promesses de pose et de retrait, adresses d'envoi des formulaires.
