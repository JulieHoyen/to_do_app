// "use strict";

// //Navet der gemmer opgaverne i localStorges.
// const STORAGE_KEY = "todo-app-task";

// //Sætter kordinatern til København, da jeg ikke kan burge GPS location (endnu)

// const LOCATION = {
//   name: "København",
//   latitude: 55.6761,
//   longitude: 12.5683,
// };

// //Henter de gemte opgaver fra localStorage
// let tasks = loadTask();

// // Afgøre hvor lange feedback vises
// let feedbackTimer;

// // Venter med at starte scriptet til HTMLen er læst
// document.addEventListener("DOMContentLoaded", startApp);

// /**
//  * Starter appen.
//  *
//  * Funktionen:
//  * 1. Finder formularen og datovælgeren.
//  * 2. Forhindrer valg af datoer før i dag.
//  * 3. Lytter efter indsendelse af formularen.
//  * 4. Viser gemte opgaver.
//  */

// function startApp() {
//   const form = document.querySelector("#task-form");
//   const dateIndput = document.querySelector("task-date");

//   if (!form || !dateInput) {
//     console.error("Appen kunne ikke starte. Kontrollér #task-form og #task-date.");
//     return;
//   }

//   // Brugeren kan ikke vælge en dato før i dag.
//   dateInput.min = getTodayAsString();

//   // Kører handleCreateTask(), når formularen indsendes.
//   form.addEventListener("submit", handleCreateTask);

//   // Viser opgaver, som allerede ligger i tasks-arrayet.
//   renderTasks();
// }

// /**
//  * Opretter en ny opgave ud fra formularens værdier.
//  *
//  * Funktionen er async, fordi den muligvis skal vente på vejrdata fra Open-Meteo.
//  */

// async function handleCreateTask(event) {
//   //Sørge for formularen ikke genlæse siden
//   event.preventDefult();

//   const form = event.currentTarget;
//   const textInput = document.querySelector("#task-text");
//   const dateInput = document.querySelector("#task-date");
//   const outdoorInput = document.querySelector("#task-outdoor");

//   if (!textInput || !dataInput || !outdoorInput) {
//     showFeedback()("Der mangler et inputfelt i HTML-filen.", "error");
//   }
// }

"use strict";

/*
  SAMLET JAVASCRIPT TIL TODO-APPEN

  Din HTML skal indeholde elementer med disse id'er:

  #task-form      Formularen
  #task-text      Tekstfeltet til opgaven
  #task-date      Datovælgeren
  #task-outdoor   Checkboxen "Udendørs"
  #todo-list      Listen med aktive opgaver
  #done-list      Listen med færdige opgaver
  #feedback       Området til beskeder

  Forbind filen nederst i din HTML:

  <script src="script.js"></script>
*/

// Navnet, som opgaverne gemmes under i localStorage.
const STORAGE_KEY = "todo-app-tasks";

// Faste koordinater til København.
// Open-Meteo bruger koordinater i stedet for bynavne.
const LOCATION = {
  name: "København",
  latitude: 55.6761,
  longitude: 12.5683,
};

// Henter eventuelle gemte opgaver fra localStorage.
let tasks = loadTasks();

// Bruges til at styre, hvor længe feedback vises.
let feedbackTimer;

// Venter med at starte appen, indtil HTML'en er indlæst.
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
  const dateInput = document.querySelector("#task-date");

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

/**
 * Opretter en ny opgave ud fra formularens værdier.
 *
 * Funktionen er async, fordi den muligvis skal vente
 * på vejrdata fra Open-Meteo.
 */
async function handleCreateTask(event) {
  // Forhindrer formularen i at genindlæse siden.
  event.preventDefault();

  const form = event.currentTarget;
  const textInput = document.querySelector("#task-text");
  const dateInput = document.querySelector("#task-date");
  const outdoorInput = document.querySelector("#task-outdoor");

  if (!textInput || !dateInput || !outdoorInput) {
    showFeedback("Der mangler et inputfelt i HTML-filen.", "error");

    return;
  }

  // trim() fjerner mellemrum før og efter teksten.
  const text = textInput.value.trim();
  const date = dateInput.value;
  const outdoor = outdoorInput.checked;

  // Stopper, hvis brugeren ikke har skrevet en opgave.
  if (!text) {
    showFeedback("Skriv, hvad opgaven går ud på.", "error");
    textInput.focus();

    return;
  }

  // Stopper, hvis brugeren ikke har valgt en dato.
  if (!date) {
    showFeedback("Vælg en dato til opgaven.", "error");
    dateInput.focus();

    return;
  }

  /*
    Her oprettes task-objektet.

    Hver opgave indeholder:
    - Et unikt ID
    - En beskrivelse
    - En færdig-status
    - En dato
    - En udendørs-status
    - Eventuelle vejrdata
  */
  const newTask = {
    id: createUniqueId(),
    text: text,
    done: false,
    date: date,
    outdoor: outdoor,
    weather: null,
  };

  // push() tilføjer objektet til tasks-arrayet.
  tasks.push(newTask);

  // Gemmer opgaverne og opdaterer siden.
  saveTasks();
  renderTasks();

  // Nulstiller formularens felter.
  form.reset();
  dateInput.min = getTodayAsString();

  // Indendørsopgaver behøver ikke vejrdata.
  if (!outdoor) {
    showFeedback("Opgaven blev oprettet.", "success");

    return;
  }

  showFeedback("Opgaven blev oprettet. Henter vejret …", "loading");

  // Venter på, at vejret bliver hentet.
  const weather = await fetchWeatherForDate(date);

  /*
    Opgaven kan være blevet slettet, mens API'et arbejdede.

    Derfor finder vi opgaven igen ved hjælp af dens ID,
    før vi tilføjer vejret.
  */
  const taskToUpdate = tasks.find((task) => task.id === newTask.id);

  if (!taskToUpdate) {
    return;
  }

  // Gemmer vejrdata i opgavens weather-property.
  taskToUpdate.weather = weather;

  saveTasks();
  renderTasks();

  if (weather) {
    showFeedback("Opgaven og vejrudsigten blev gemt.", "success");
  } else {
    showFeedback("Opgaven blev gemt, men vejret kunne ikke hentes.", "error");
  }
}

/**
 * Opretter et unikt ID til en opgave.
 *
 * crypto.randomUUID() er browserens indbyggede
 * funktion til at lave unikke ID'er.
 */
function createUniqueId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  /*
    Dette er en reserve til ældre browsere.
    Den kombinerer tidspunktet med et tilfældigt tal.
  */
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Henter vejret fra Open-Meteo for én bestemt dato.
 *
 * Funktionen returnerer:
 * - Et objekt med vejrdata, hvis det lykkes.
 * - null, hvis noget går galt.
 */
async function fetchWeatherForDate(date) {
  /*
    URLSearchParams samler de forskellige oplysninger,
    der skal sendes til API'et.
  */
  const parameters = new URLSearchParams({
    latitude: LOCATION.latitude,
    longitude: LOCATION.longitude,
    daily: "weather_code,temperature_2m_max,precipitation_sum",
    timezone: "Europe/Copenhagen",
    start_date: date,
    end_date: date,
  });

  const url = `https://api.open-meteo.com/v1/forecast?${parameters}`;

  try {
    // fetch() sender forespørgslen til API'et.
    const response = await fetch(url);

    /*
      fetch() giver ikke automatisk en JavaScript-fejl,
      hvis serveren svarer med fx 404 eller 500.

      Derfor kontrollerer vi response.ok.
    */
    if (!response.ok) {
      throw new Error(`Vejr-API'et svarede med status ${response.status}.`);
    }

    // Laver API-svaret om til et JavaScript-objekt.
    const data = await response.json();

    // Kontrollerer, at API'et har sendt vejrdata tilbage.
    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      throw new Error("API'et returnerede ingen vejrdata for datoen.");
    }

    const precipitation = data.daily.precipitation_sum[0];

    const weatherCode = data.daily.weather_code[0];

    /*
      Returnerer kun de oplysninger,
      som resten af appen skal bruge.
    */
    return {
      date: data.daily.time[0],

      temperature: data.daily.temperature_2m_max[0],

      precipitation: precipitation,

      code: weatherCode,

      description: getWeatherDescription(weatherCode),

      // true hvis prognosen viser nedbør.
      isRainy: precipitation > 0,
    };
  } catch (error) {
    console.error("Fejl under hentning af vejr:", error);

    return null;
  }
}

/**
 * Oversætter Open-Meteos numeriske vejrkode
 * til en dansk beskrivelse.
 */
function getWeatherDescription(code) {
  const descriptions = {
    0: "Klart vejr",
    1: "Overvejende klart",
    2: "Delvist overskyet",
    3: "Overskyet",
    45: "Tåge",
    48: "Rimtåge",
    51: "Let støvregn",
    53: "Støvregn",
    55: "Kraftig støvregn",
    56: "Let isslag",
    57: "Kraftigt isslag",
    61: "Let regn",
    63: "Regn",
    65: "Kraftig regn",
    66: "Let isslag",
    67: "Kraftigt isslag",
    71: "Let sne",
    73: "Sne",
    75: "Kraftig sne",
    77: "Snekorn",
    80: "Lette regnbyger",
    81: "Regnbyger",
    82: "Kraftige regnbyger",
    85: "Lette snebyger",
    86: "Kraftige snebyger",
    95: "Tordenvejr",
    96: "Tordenvejr med let hagl",
    99: "Tordenvejr med kraftigt hagl",
  };

  /*
    Hvis koden findes i descriptions, returneres teksten.

    ?? betyder:
    Brug "Ukendt vejr", hvis beskrivelsen ikke findes.
  */
  return descriptions[code] ?? "Ukendt vejr";
}

/**
 * Viser alle opgaver på siden.
 *
 * Funktionen:
 * 1. Tømmer listerne.
 * 2. Gennemgår tasks-arrayet.
 * 3. Opretter HTML til hver opgave.
 * 4. Placérer opgaven i den rigtige liste.
 */
function renderTasks() {
  const todoList = document.querySelector("#todo-list");

  const doneList = document.querySelector("#done-list");

  if (!todoList || !doneList) {
    console.error("Kontrollér #todo-list og #done-list i HTML-filen.");

    return;
  }

  /*
    replaceChildren() fjerner det eksisterende indhold,
    så opgaverne ikke bliver vist flere gange.
  */
  todoList.replaceChildren();
  doneList.replaceChildren();

  // Gennemgår alle objekter i tasks-arrayet.
  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);

    // done afgør, hvilken liste opgaven skal placeres i.
    if (task.done) {
      doneList.append(taskElement);
    } else {
      todoList.append(taskElement);
    }
  });
}

/**
 * Opretter HTML-elementerne til én opgave.
 *
 * Funktionen returnerer et færdigt li-element,
 * som renderTasks() kan placere på siden.
 */
function createTaskElement(task) {
  const listItem = document.createElement("li");

  const heading = document.createElement("h3");

  const dateText = document.createElement("p");

  const typeText = document.createElement("p");

  const buttonContainer = document.createElement("div");

  listItem.classList.add("task");

  /*
    Gemmer opgavens ID som et data-attribut:

    <li data-id="opgavens-id">
  */
  listItem.dataset.id = task.id;

  if (task.done) {
    listItem.classList.add("task--done");
  }

  /*
    Regnfulde udendørsopgaver får en særlig CSS-klasse.
    Klassen kan fx give opgaven en grå eller rød baggrund.
  */
  if (task.outdoor && task.weather?.isRainy) {
    listItem.classList.add("task--unavailable");
  }

  /*
    textContent bruges i stedet for innerHTML.

    Det betyder, at brugerens tekst bliver behandlet
    som almindelig tekst og ikke som HTML-kode.
  */
  heading.textContent = task.text;

  dateText.textContent = `Dato: ${formatDate(task.date)}`;

  typeText.textContent = task.outdoor ? `Udendørs opgave i ${LOCATION.name}` : "Indendørs opgave";

  listItem.append(heading, dateText, typeText);

  // Vejret vises kun på udendørsopgaver.
  if (task.outdoor) {
    listItem.append(createWeatherElement(task));
  }

  // Knap til at ændre opgavens status.
  const statusButton = document.createElement("button");

  statusButton.type = "button";

  statusButton.textContent = task.done ? "Flyt tilbage" : "Markér som færdig";

  /*
    Når knappen klikkes, sendes opgavens ID
    til toggleTaskStatus().
  */
  statusButton.addEventListener("click", () => toggleTaskStatus(task.id));

  // Knap til at slette opgaven.
  const deleteButton = document.createElement("button");

  deleteButton.type = "button";
  deleteButton.textContent = "Slet";

  deleteButton.classList.add("delete-button");

  deleteButton.addEventListener("click", () => deleteTask(task.id));

  buttonContainer.classList.add("task__buttons");

  buttonContainer.append(statusButton, deleteButton);

  listItem.append(buttonContainer);

  return listItem;
}

/**
 * Opretter teksten med vejrinformation.
 */
function createWeatherElement(task) {
  const weatherText = document.createElement("p");

  weatherText.classList.add("task__weather");

  /*
    Hvis weather stadig er null,
    kunne vejret ikke hentes.
  */
  if (!task.weather) {
    weatherText.textContent = "Vejret kunne ikke hentes.";

    weatherText.classList.add("task__weather--error");

    return weatherText;
  }

  weatherText.textContent = `${task.weather.description}. ` + `Maks. ${task.weather.temperature} °C og ` + `${task.weather.precipitation} mm nedbør.`;

  // Tilføjer ekstra feedback ved regn.
  if (task.weather.isRainy) {
    weatherText.textContent += " Udendørsopgaven er markeret " + "som utilgængelig på grund af regn.";
  }

  return weatherText;
}

/**
 * Skifter en opgave mellem ToDo og Færdig.
 */
function toggleTaskStatus(id) {
  /*
    find() finder det task-objekt,
    som har det samme ID.
  */
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    showFeedback("Opgaven kunne ikke findes.", "error");

    return;
  }

  /*
    ! betyder "det modsatte".

    false bliver til true.
    true bliver til false.
  */
  task.done = !task.done;

  saveTasks();
  renderTasks();

  const message = task.done ? "Opgaven blev flyttet til Færdig." : "Opgaven blev flyttet tilbage til ToDo.";

  showFeedback(message, "success");
}

/**
 * Sletter en opgave.
 */
function deleteTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    showFeedback("Opgaven kunne ikke findes.", "error");

    return;
  }

  /*
    confirm() viser en dialogboks.

    true betyder, at brugeren klikkede OK.
    false betyder, at brugeren klikkede Annuller.
  */
  const shouldDelete = window.confirm(`Vil du slette "${task.text}"?`);

  if (!shouldDelete) {
    return;
  }

  /*
    filter() opretter et nyt array med alle opgaver,
    bortset fra opgaven med det valgte ID.
  */
  tasks = tasks.filter((item) => item.id !== id);

  saveTasks();
  renderTasks();

  showFeedback("Opgaven blev slettet.", "success");
}

/**
 * Gemmer tasks-arrayet i localStorage.
 *
 * localStorage kan kun gemme tekst.
 * Derfor bruger vi JSON.stringify().
 */
function saveTasks() {
  const tasksAsText = JSON.stringify(tasks);

  localStorage.setItem(STORAGE_KEY, tasksAsText);
}

/**
 * Henter gemte opgaver fra localStorage.
 *
 * JSON.parse() laver teksten tilbage
 * til et JavaScript-array.
 */
function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  // Hvis der ikke er gemt noget, returneres et tomt array.
  if (!savedTasks) {
    return [];
  }

  try {
    const parsedTasks = JSON.parse(savedTasks);

    /*
      Kontrollerer, at de gemte data er et array.
      Ellers starter appen med et tomt array.
    */
    return Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch (error) {
    console.error("De gemte opgaver kunne ikke læses:", error);

    return [];
  }
}

/**
 * Viser feedback til brugeren.
 *
 * type kan fx være:
 * - success
 * - error
 * - loading
 * - info
 */
function showFeedback(message, type = "info") {
  const feedback = document.querySelector("#feedback");

  /*
    Hvis feedback-elementet mangler,
    vises beskeden i konsollen i stedet.
  */
  if (!feedback) {
    console.log(message);

    return;
  }

  /*
    Stopper en tidligere timer,
    så en gammel besked ikke fjerner en ny.
  */
  clearTimeout(feedbackTimer);

  feedback.textContent = message;

  /*
    Eksempel på klasse:
    feedback feedback--success
  */
  feedback.className = `feedback feedback--${type}`;

  /*
    Loading-beskeden bliver stående,
    indtil vejrdata er hentet.

    Andre beskeder fjernes efter fire sekunder.
  */
  if (type !== "loading") {
    feedbackTimer = setTimeout(() => {
      feedback.textContent = "";
      feedback.className = "feedback";
    }, 4000);
  }
}

/**
 * Returnerer dags dato som yyyy-mm-dd.
 *
 * Det er det format, som input type="date" bruger.
 */
function getTodayAsString() {
  const today = new Date();

  const year = today.getFullYear();

  /*
    getMonth() begynder ved 0.
    Derfor lægger vi 1 til resultatet.
  */
  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Ændrer en dato fra eksempelvis:
 *
 * 2026-09-09
 *
 * til:
 *
 * 9. september 2026
 */
function formatDate(dateString) {
  /*
    T12:00:00 forhindrer, at datoen i nogle
    tidszoner bliver rykket til dagen før.
  */
  const date = new Date(`${dateString}T12:00:00`);

  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
