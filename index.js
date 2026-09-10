"use strict";
import { getWeather, wwCodes } from "./weather_open_meteo.js";

const task_input = document.querySelector(".task_text");
const createTask_btn = document.querySelector(".create_task");
const ul_elm = document.querySelector(".tasks");
const done_ul_elm = document.querySelector("#done-list");
const task_date = document.querySelector("#task-date");
const task_outdoor = document.querySelector("#task-outdoor");
// const taskIcon = getTaskIcon(task);
const feedback = document.querySelector("#feedback");
const task_arr = [];
const done_arr = [];

//*************************** Opretter opagver **************//
createTask_btn.addEventListener("click", createTask);

function createTask() {
  // Fjerner mellemrum før og efter teksten.
  const taskText = task_input.value.trim();

  // Stopper funktionen, hvis tekstfeltet er tomt.
  if (taskText === "") {
    feedback.textContent = "Du skal skrive en opgave først.";
    task_input.focus();
    return;
  }

  // Stopper funktionen, hvis der ikke er valgt en dato.
  if (task_date.value === "") {
    feedback.textContent = "Du skal vælge en dato.";
    task_date.focus();
    return;
  }

  const task_obj = {
    taskTxt: taskText,
    taskDate: task_date.value,
    taskOutdoor: task_outdoor.checked,
    weatherCode: null,
    weatherIcon: null,
    taskUnavailable: false,
    taskDone: false,
    id: crypto.randomUUID(),
  };

  task_arr.push(task_obj);

  feedback.textContent = "Opgaven blev tilføjet.";

  // Tømmer tekstfeltet, så det er klar til næste opgave.
  task_input.value = "";

  /**************** vejer funtion ***************/

  renderList();
  if (task_obj.taskOutdoor === true) {
    feedback.textContent = " Vejret bliver opdatret, når vi ved om regndansen fra indianerne har virket";

    getWeather(task_obj.taskDate, (data) => {
      console.log("Vejrdata:", data);

      // Henter vejrkode fra API-resultatet.
      const weatherCode = data.daily.weathercode[0];

      // Gemmer vejrkode og det tilhørende billednavn.
      task_obj.weatherCode = weatherCode;
      task_obj.weatherIcon = wwCodes[weatherCode];

      // Undersøger, om vejrtypen er regn.
      task_obj.taskUnavailable = itsRainingMen(weatherCode);

      console.log("Vejrkoden:", task_obj.weatherCode);
      console.log("Vejrikon:", task_obj.weatherIcon);
      console.log("Opgaven er utilgængelig:", task_obj.taskUnavailable);

      feedback.textContent = "Opgaven og vejret blev tilføjet.";

      // Opdaterer opgaven med vejrikon og eventuel regnadvarsel.
      renderList();
    });
  } else {
    feedback.textContent = "Opgaven blev tilføjet.";
  }

  /************************ Undersøger, om en vejrkode betyder regn og du ikke skal lave opagven udenfor ******/
  function itsRainingMen(weatherCode) {
    const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];

    // includes() undersøger, om weatherCode findes i arrayet.
    return rainCodes.includes(weatherCode);
  }
}

// ******************** Vælger hvilket ikon en opgave skal vise.*******//
function getTaskIcon(task) {
  // Indendørsopgaver viser altid hus-ikonet.
  if (task.taskOutdoor === false) {
    return `
      <img
        class="task_location_icon"
        src="./img/Home.svg"
        alt="Indendørs opgave"
      >
    `;
  }

  // Hvis vejret endnu ikke er hentet, vises landskabet som placeholder.
  if (task.weatherIcon === null) {
    return `
      <img
        class="task_location_icon"
        src="./img/Landscape.svg"
        alt="Vejret indlæses"
      >
    `;
  }

  // Når vejret er hentet, vises det ikon,
  // som passer til vejrkoden.
  return `
    <img
      class="task_location_icon"
      src="./outdoor_pakke/png/${task.weatherIcon}"
      alt="Vejret for den udendørs opgave"
    >
  `;
}
//*************************** Vister listerne **************//
function renderList() {
  // Tømmer begge HTML-lister.
  ul_elm.innerHTML = "";
  done_ul_elm.innerHTML = "";

  //********************** Viser ToDo-opgaverne. ***********************//
  task_arr.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("task");

    // Tilføjer en ekstra CSS-klasse, hvis opgaven ikke kan udføres.
    if (task.taskUnavailable === true) {
      li.classList.add("task_unavailable");
    }

    let weatherMessage = "";

    if (task.taskUnavailable === true) {
      weatherMessage = `
    <p class="weather_warning">
      Vejret er for dårligt til at lave denne opgave. Bliv indenfor og spille PlayStation! &#x1F60E;
    </p>
  `;
    } else {
      task.taskUnavailable === false;
      weatherMessage = `
    <p class="weather_warning">
      Vejret er godt nok til denne opagve. Men du burde blive indenfor og spil PlayStation! &#x1F60D;
    </p>
  `;
    }

    // Henter det rigtige ikon til denne opgave.
    const taskIcon = getTaskIcon(task);

    li.innerHTML = `
  <input type="checkbox">

  <div class="task_content">
    <h3>${task.taskTxt}</h3>
    <p>${task.taskDate}</p>
      ${weatherMessage}
  </div>

  ${taskIcon}
 
`;

    const checkBox = li.querySelector('[type="checkbox"]');

    checkBox.addEventListener("click", () => {
      moveTaskToDone(task.id);
    });

    ul_elm.appendChild(li);
  });

  //****************** Viser Done-opgaverne. **********************//
  done_arr.forEach((task) => {
    const li = document.createElement("li");

    li.classList.add("task", "checked");
    let taskIcon;

    if (task.taskOutdoor === true) {
      // Landscape.svg
    } else {
      // Home.svg
    }

    li.innerHTML = `
  <input type="checkbox" checked>

  <div class="task_content">
    <h3>${task.taskTxt}</h3>
    <p>${task.taskDate}</p>
  </div>
  <button class="delete_task" type="button">Slet</button>

`;
    //delete_task knap til at slette opagven helt
    const checkBox = li.querySelector('[type="checkbox"]');
    const deleteButton = li.querySelector(".delete_task");

    checkBox.addEventListener("click", () => {
      moveTaskBackToTodo(task.id);
    });

    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });

    done_ul_elm.appendChild(li);
  });

  //********************** Rykker de færdige opgaver tilbage til to do listen ************//
  function moveTaskBackToTodo(taskId) {
    // Finder opgaven i Done-arrayet.
    const taskIndex = done_arr.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      return;
    }

    // Fjerner opgaven fra Done-arrayet.
    const taskToMove = done_arr.splice(taskIndex, 1)[0];

    // Markerer opgaven som ikke færdig.
    taskToMove.taskDone = false;

    // Lægger opgaven tilbage i ToDo-arrayet.
    task_arr.push(taskToMove);

    // Tegner begge lister igen.
    renderList();
  }

  // Gemmer den nyeste version af begge lister.
  saveTasks();
}

//*************************** Flytter opagver **************//
function moveTaskToDone(taskId) {
  // Finder opgavens placering i task_arr.
  const taskIndex = task_arr.findIndex((task) => task.id === taskId);

  // Det er taskIndex, vi skal undersøge.
  if (taskIndex === -1) {
    return;
  }

  // Fjerner opgaven fra ToDo-arrayet.
  const finishedTask = task_arr.splice(taskIndex, 1)[0];

  finishedTask.taskDone = true;

  // Lægger opgaven i Done-arrayet.
  done_arr.push(finishedTask);

  renderList();
}

//*************************** Sletter opagver **************//
function deleteTask(taskId) {
  // Leder først efter opgaven i ToDo-arrayet.
  const todoIndex = task_arr.findIndex((task) => task.id === taskId);

  // Hvis opgaven blev fundet, fjernes den.
  if (todoIndex !== -1) {
    task_arr.splice(todoIndex, 1);
  }

  // Leder derefter efter opgaven i Done-arrayet.
  const doneIndex = done_arr.findIndex((task) => task.id === taskId);

  // Hvis opgaven blev fundet, fjernes den.
  if (doneIndex !== -1) {
    done_arr.splice(doneIndex, 1);

    // Tegner listerne igen uden den slettede opgave.
    renderList();
  }
}

// const storageData = JSON.parse(localStorage.getItem("data"));
// if (storageData) {
// }
// renderList();

// Gemmer både ToDo- og Done-opgaver i localStorage.
function saveTasks() {
  // Samler begge arrays i ét objekt.
  const storageData = {
    todoTasks: task_arr,
    doneTasks: done_arr,
  };

  // Omdanner objektet til tekst og gemmer det.
  localStorage.setItem("data", JSON.stringify(storageData));
}

// Henter tidligere gemte opgaver fra localStorage.
function loadTasks() {
  // getItem læser data. setItem gemmer data.
  const savedData = localStorage.getItem("data");

  // Stopper, hvis der ikke er gemt noget.
  if (savedData === null) {
    return;
  }

  // Omdanner den gemte tekst tilbage til et objekt.
  const storageData = JSON.parse(savedData);

  // Lægger de gemte ToDo-opgaver ind i task_arr.
  if (Array.isArray(storageData.todoTasks)) {
    task_arr.push(...storageData.todoTasks);
  }

  // Lægger de gemte Done-opgaver ind i done_arr.
  if (Array.isArray(storageData.doneTasks)) {
    done_arr.push(...storageData.doneTasks);
  }
}

// Henter først de gemte opgaver.
loadTasks();

// Viser derefter opgaverne på siden.
renderList();
