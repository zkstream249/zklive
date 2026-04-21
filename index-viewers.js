import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGMzjuw6LEQT5tRUiXpBqoi0qLBQEcNaI",
  authDomain: "imftx-5be48.firebaseapp.com",
  databaseURL: "https://imftx-5be48-default-rtdb.firebaseio.com",
  projectId: "imftx-5be48",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const viewerState = new Map();

function getState(slug) {
  if (!viewerState.has(slug)) {
    viewerState.set(slug, {
      sessionCount: null,
      legacyCount: 0
    });
  }

  return viewerState.get(slug);
}

function getSafeCount(value) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function getFinalCount(state) {
  if (typeof state.sessionCount === "number") {
    return getSafeCount(state.sessionCount);
  }

  return getSafeCount(state.legacyCount);
}

function updateCard(slug) {
  const state = getState(slug);
  const safeCount = getFinalCount(state);

  document.querySelectorAll('[data-match-slug="' + slug + '"]').forEach((card) => {
    const target = card.querySelector("[data-viewers]");
    card.setAttribute("data-current-viewers", String(safeCount));

    if (target) {
      target.textContent = String(safeCount);
    }
  });
}

function watchRealViewers(slug) {
  const state = getState(slug);
  updateCard(slug);

  const sessionsRef = ref(db, "pages/" + slug + "/sessions");
  onValue(
    sessionsRef,
    (snapshot) => {
      const sessions = snapshot.val() || {};
      state.sessionCount = Object.keys(sessions).length;
      updateCard(slug);
    },
    () => {
      state.sessionCount = null;
      updateCard(slug);
    }
  );

  const countRef = ref(db, "pages/" + slug + "/count");
  onValue(
    countRef,
    (snapshot) => {
      const value = snapshot.val();
      state.legacyCount = typeof value === "number" ? value : 0;
      updateCard(slug);
    },
    () => {
      state.legacyCount = 0;
      updateCard(slug);
    }
  );
}

const watchedSlugs = new Set();

document.querySelectorAll("[data-match-slug]").forEach((card) => {
  const slug = card.getAttribute("data-match-slug");
  if (!slug || watchedSlugs.has(slug)) {
    return;
  }

  watchedSlugs.add(slug);
  watchRealViewers(slug);
});
