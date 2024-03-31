// Variables for pulling form data
const projectNameInputEl = $('#title');
const projectTypeInputEl = $('#description');
const projectDateInputEl = $('#due-date');

function readProjectsFromStorage() {
  // Retrieve tasks from localStorage
  let taskList = JSON.parse(localStorage.getItem('tasks'));

  // If no projects were retrieved from localStorage, assign projects to a new empty array to push to later.
  if (taskList === null) {
    taskList = [];
  };

  return taskList;
}

function saveProjectsToStorage(taskListItems) {
  localStorage.setItem('tasks', JSON.stringify(taskListItems));
}

//function to generate a unique task id (helped by Xpert)
function generateTaskId() {
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000);

  const nextId = `${timestamp}-${randomNum}`;
  return nextId;
}

//create a task card
function createTaskCard(project) {
  const taskCard = $("<div>")
    .addClass("card project-card draggable my-3")
    .attr("data-project-id", project.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(project.name);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(project.type);
  const cardDueDate = $("<p>").addClass("card-text").text(project.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-project-id", project.id);
  cardDeleteBtn.on("click", handleDeleteTask);

  //Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (project.dueDate && project.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(project.dueDate, "DD/MM/YYYY");

    //If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  //append above to the correct elements.
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

//a function to render the task list and make cards draggable
function renderTaskList() {
  const projects = readProjectsFromStorage();

  //Empty existing project cards out of the lanes
  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

  //Loop through projects and create project cards for each status
  for (let project of projects) {
    if (project.status === "to-do") {
      todoList.append(createTaskCard(project));
    } else if (project.status === "in-progress") {
      inProgressList.append(createTaskCard(project));
    } else if (project.status === "done") {
      doneList.append(createTaskCard(project));
    }
  }
  //Used JQuery to make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {

      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

//function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

  const projectName = projectNameInputEl.val().trim();
  const projectType = projectTypeInputEl.val();
  const projectDate = projectDateInputEl.val(); 

  const newProject = {
    id: generateTaskId(),
    name: projectName,
    type: projectType,
    dueDate: projectDate,
    status: 'to-do',
  };
  
  let tasks = readProjectsFromStorage();
  tasks.push(newProject);

  saveProjectsToStorage(tasks);

  $("#task-modal").dialog("close");

  renderTaskList();

  projectNameInputEl.val('');
  projectTypeInputEl.val('');
  projectDateInputEl.val('');
}

//function to handle deleting a task
function handleDeleteTask() {
    const projectId = $(this).attr('data-project-id');
    const projects = readProjectsFromStorage();
  
    //Remove project from the array.
    projects.forEach((project) => {
      if (project.id === projectId) {
        projects.splice(projects.indexOf(project), 1);
      }
    });

    //save the projects to localStorage
    saveProjectsToStorage(projects);
  
    //render projects back to the screen
    renderTaskList();
}

//function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const projects = readProjectsFromStorage();

  //Get the project id from the event
  const taskId = ui.draggable[0].dataset.projectId;

  //Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let project of projects) {
    //Find the project card by the `id` and update the project status.
    if (project.id === taskId) {
      project.status = newStatus;
    }
  }
  //Save the updated projects array to localStorage and render
  saveProjectsToStorage(projects);
  renderTaskList();
}

//when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

  $("#task-modal").dialog({
    autoOpen: false,
  });
  $("#add-task-button").on("click", function () {
    projectNameInputEl.val('');
    projectTypeInputEl.val('');
    projectDateInputEl.val('');
    $("#task-modal").dialog("open");
  });

  $("#submit-button").on("click", handleAddTask);

  $("#due-date").datepicker({
    changeMonth: true,
    changeYear: true,
  });
    // ? Make lanes droppable
    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
      });

});
