"use strict";

// <button class="create_task"></button>
// <input type="text" class="task_text" />
// <ul class="tasks"></ul>
const task_input = document.querySelector(".task_text");
const createTask_btn = document.querySelector(".create_task");
const ul_elm = document.querySelector(".tasks");
const done_ul_elm = document.querySelector("#done-list");
const task_date = document.querySelector("#task-date");
const task_outdoor = document.querySelector("#task-outdoor");
const task_arr = [];
const done_arr = [];

createTask_btn.addEventListener("click", createTask);

function createTask() {
  const task_obj = {
    taskTxt: task_input.value,
    taskDate: task_date.value,
    taskOutdoor: task_outdoor.checked,
    taskDone: false,
    id: self.crypto.randomUUID(),
  };

  task_arr.push(task_obj);

  console.log("task_arr", task_arr);

  renderList();
}

function renderList() {
  // Tømmer begge HTML-lister.
  ul_elm.innerHTML = "";
  done_ul_elm.innerHTML = "";

  //********************** Viser ToDo-opgaverne. ***********************//
  task_arr.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("task");

    let taskIcon;

    if (task.taskOutdoor === true) {
      taskIcon = `
    <img
      class="task_location_icon"
      src="./img/Landscape.svg"
      alt="Udendørs opgave"
    >
  `;
    } else {
      taskIcon = `
    <img
      class="task_location_icon"
      src="./img/Home.svg"
      alt="Indendørs opgave"
    >
  `;
    }

    li.innerHTML = `
  <input type="checkbox">

  <div class="task_content">
    <h3>${task.taskTxt}</h3>
    <p>${task.taskDate}</p>
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
      taskIcon = `
    <img
      class="task_location_icon"
      src="./img/Landscape.svg"
      alt="Udendørs opgave"
    >
  `;
    } else {
      taskIcon = `
    <img
      class="task_location_icon"
      src="./img/Home.svg"
      alt="Indendørs opgave"
    >
  `;
    }

    li.innerHTML = `
  <input type="checkbox" checked>

  <div class="task_content">
    <h3>${task.taskTxt}</h3>
    <p>${task.taskDate}</p>
  </div>

  <button class="delete_task" type="button">Slet</button>

  ${taskIcon}
`;
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
}

// flytte en opagve fra to do array til array done.
// check box skal skiftes ud med unchecked.svg til checked.svg
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
  }

  // Tegner listerne igen uden den slettede opgave.
  renderList();
}
