"use strict";

//Navet der gemmer opgaverne i localStorges.
const STORAGE_KEY = "todo-app-task";

//Sætter kordinatern til København, da jeg ikke kan burge GPS location (endnu)

const LOCATION = {
  name: "København",
  latitude: 55.6761,
  longitude: 12.5683,
};

//Henter de gemte opgaver fra localStorage
let tasks = loadTask();

// Afgøre hvor lange feedback vises
let feedbackTimer;

// Venter med at starte scriptet til HTMLen er læst
document.addEventListener("DOMContentLoaded", startApp);

/**
 * Starter appen.
 *
 * Funktionen:
 * 1. Finder formularen og datovælgeren.
 * 2. Forhindrer valg af datoer før i dag.
 * 3. Lytter efter indsendelse af formularen.
 * 4. Viser gemte opgaver.
 */

function startApp() {
  const form = document.querySelector("#task-form");
  const dateIndput = document.querySelector("task-date");

  if (!form || !dateInput) {
    console.error("Appen kunne ikke starte. Kontrollér #task-form og #task-date.");
    return;
  }

  // Brugeren kan ikke vælge en dato før i dag.
  dateInput.min = getTodayAsString();

  // Kører handleCreateTask(), når formularen indsendes.
  form.addEventListener("submit", handleCreateTask);

  // Viser opgaver, som allerede ligger i tasks-arrayet.
  renderTasks();
}
