// Le point d'entrée de l'assistant, chargé à la demande par BaseLayout : React, le
// moteur du calculateur et les textes ne pèsent sur une page que si l'assistant y
// est affiché.

import { createRoot } from 'react-dom/client';
import { captureAdClickIds } from '../academy/track';
import Assistant from './Assistant';

export function monter(): void {
  if (document.getElementById('mdp-assistant')) return;
  // La provenance de la visite (annonce, source, page d'entrée) : Paul la lit dans la notification.
  captureAdClickIds();
  const lang = document.documentElement.lang?.startsWith('en') ? 'en' : 'fr';
  const racine = document.createElement('div');
  racine.id = 'mdp-assistant';
  document.body.appendChild(racine);
  createRoot(racine).render(<Assistant lang={lang} surelever={!!document.querySelector('[data-assistant-lift]')} />);
}
