import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://TON_PROJET.supabase.co'; // Remplace ici
const SUPABASE_KEY = 'TON_API_KEY_ANON';            // Remplace ici
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Initialise le compteur de vues réel pour chaque match
 */
async function initRealtimeViewers() {
  // On récupère tous les compteurs présents sur la page
  const viewerElements = document.querySelectorAll('[data-viewer-counter]');

  viewerElements.forEach(async (el) => {
    const matchId = el.getAttribute('data-viewer-counter') || 'global';
    
    // Création d'un canal unique par match
    const channel = supabase.channel(`viewers:${matchId}`, {
      config: {
        presence: { key: 'user' },
      },
    });

    // Écouter les changements de présence
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        // Le nombre de clés uniques correspond au nombre d'utilisateurs
        const count = Object.keys(newState).length;
        
        // Mise à jour de l'affichage
        el.textContent = count;
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // On "track" l'utilisateur dès qu'il est connecté
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });
  });
}

// Lancement au chargement du DOM
document.addEventListener('DOMContentLoaded', initRealtimeViewers);

