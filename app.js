/* =========================================
   KANBAN PRO 
========================================= */

// 1. INITIAL DATA AND STORAGE

const STORAGE_KEY = "kanbanProData";

const initialTasks = [
  {
    id: "101",
    title: "Dissenyar base de dades",
    description: "Crear esquema ERD",
    status: "todo",
    createdAt: new Date().toISOString(),
    completedAt: null
  },
  {
    id: "102",
    title: "Configurar servidor Node",
    description: "Express i CORS",
    status: "in-progress",
    createdAt: new Date().toISOString(),
    completedAt: null
  }
];

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved && Array.isArray(saved.tasks)) {
      return {
        tasks: saved.tasks,
        dailyPlans: saved.dailyPlans || {}
      };
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }

  return {
    tasks: initialTasks,
    dailyPlans: {}
  };
}

const appData = loadData();

let state = appData.tasks;
let dailyPlans = appData.dailyPlans;

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    tasks: state,
    dailyPlans: dailyPlans
  }));
}


// 2. EXISTING KANBAN ELEMENTS

const board = document.getElementById('board');
const form = document.getElementById('new-task-form');
const template = document.getElementById('task-card-template');

const badge = document.getElementById('global-badge');

const todoList = document.getElementById('todo-list');
const progressList = document.getElementById('in-progress-list');
const doneList = document.getElementById('done-list');


// 3. INITIALIZE APPLICATION

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  renderAllTasks();
  setupEventListeners();
  updateTaskCount();
  setupNavigation();
  setupPlanner();
  saveData();
}


// 4. CREATE TASK CARDS

function createTaskCard(task) {
  const fragment = template.content.cloneNode(true);

  const card = fragment.querySelector('.task-card');

  card.dataset.taskId = task.id;

  card.querySelector('.task-title').textContent = task.title;
  card.querySelector('.task-desc').textContent = task.description;

  card.querySelector('.task-status-select').value = task.status;

  card.classList.toggle('completed', task.status === 'done');

  return fragment;
}


// 5. RENDER KANBAN TASKS

function renderAllTasks() {
  todoList.innerHTML = "";
  progressList.innerHTML = "";
  doneList.innerHTML = "";

  state.forEach(task => {
    const card = createTaskCard(task);
    if (task.status === 'todo') {
      document.getElementById('todo-list').appendChild(card);
    } else if (task.status === 'in-progress') {
      document.getElementById('in-progress-list').appendChild(card);
    } else if (task.status === 'done') {
      document.getElementById('done-list').appendChild(card);
    }
  });

  updateTaskCount();
}


// 6. TASK COUNTER

function updateTaskCount() {
  badge.setAttribute("count", state.length);
}


// 7. ADD A NEW TASK

function addTask(event) {
  event.preventDefault();

  const title = document.getElementById('task-title-input').value.trim();
  const description = document.getElementById('task-desc-input').value.trim();
  const status = document.getElementById('task-status-select').value;

  if (!title || !description) return;

  const task = {
    id: Date.now().toString(),
    title: title,
    description: description,
    status: status,
    createdAt: new Date().toISOString(),
    completedAt: status === "done" ? new Date().toISOString() : null
  };

  state.push(task);

  form.reset();

  renderAllTasks();
  saveData();
  refreshPlanner();

  if (status === "done") {
    celebrate();
  }
}


// 8. CHANGE TASK STATUS

function changeTaskStatus(event) {
  if (!event.target.matches(".task-status-select")) return;

  const card = event.target.closest(".task-card");
  if (!card) return;

  const task = state.find(t => t.id === card.dataset.taskId);
  if (!task) return;

  const oldStatus = task.status;
  const newStatus = event.target.value;

  task.status = newStatus;

  if (newStatus === "done" && oldStatus !== "done") {
    task.completedAt = new Date().toISOString();
    celebrate();
  } else if (oldStatus === "done" && newStatus !== "done") {
    task.completedAt = null;
  }

  renderAllTasks();
  saveData();
  refreshPlanner();
}


// 9. KANBAN CLICK EVENTS

function handleBoardClick(event) {
  const target = event.target;

  // Collapse / expand columns
  const header = target.closest('.column-header');

  if (header) {
    const content = header.nextElementSibling;
    content.classList.toggle("collapsed");

    header.querySelector(".toggle-icon").textContent =
      content.classList.contains("collapsed") ? "▲" : "▼";

    return;
  }

  const card = target.closest(".task-card");
  if (!card) return;

  const taskId = card.dataset.taskId;

  // Delete task
  if (target.closest(".btn-delete")) {
    state = state.filter(task => task.id !== taskId);

    // Also remove it from all daily plans
    Object.values(dailyPlans).forEach(plan => {
      plan.tasks = plan.tasks.filter(item => item.taskId !== taskId);
    });

    renderAllTasks();
    saveData();
    refreshPlanner();

    return;
  }

  // Move task up
  if (target.closest(".btn-up")) {
    const previous = card.previousElementSibling;

    if (previous) {
      card.parentElement.insertBefore(card, previous);
      updateTaskOrder();
    }

    return;
  }

  // Move task down
  if (target.closest(".btn-down")) {
    const next = card.nextElementSibling;

    if (next) {
      card.parentElement.insertBefore(next, card);
      updateTaskOrder();
    }
  }
}


// Save visual task order
function updateTaskOrder() {
  const orderedIds = [
    ...todoList.children,
    ...progressList.children,
    ...doneList.children
  ].map(card => card.dataset.taskId);

  state.sort((a, b) =>
    orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)
  );

  saveData();
}


// 10. EVENT LISTENERS

function setupEventListeners() {
  form.addEventListener("submit", addTask);

  board.addEventListener("change", changeTaskStatus);

  board.addEventListener("click", handleBoardClick);
}


// 11. CUSTOM WEB COMPONENT - TASK BADGE

class TaskBadge extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ["count"];
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const count = this.getAttribute("count") || 0;

    this.shadowRoot.innerHTML = `
            <style>
                .badge {
                    background: #35A99A;
                    color: white;
                    padding: 8px 14px;
                    border-radius: 20px;
                    font-weight: bold;
                    display: inline-block;
                }
            </style>

            <span class="badge">
                Total tasques: ${count}
            </span>
        `;
  }
}

if (!customElements.get("task-badge")) {
  customElements.define("task-badge", TaskBadge);
}


// =========================================
// DAILY PLANNER
// =========================================

// 12. PLANNER ELEMENTS

const plannerSection = document.getElementById("planner-section");

const dateInput = document.getElementById("planner-date");
const hoursInput = document.getElementById("available-hours");

const taskSelect = document.getElementById("planner-task-select");
const durationInput = document.getElementById("task-duration");

const plannedList = document.getElementById("planned-task-list");

const totalAvailable = document.getElementById("total-available");
const totalPlanned = document.getElementById("total-planned");
const remainingTime = document.getElementById("remaining-time");

let timeChart = null;


// 13. DATE HELPERS

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentPlan() {
  const date = dateInput.value;

  if (!dailyPlans[date]) {
    dailyPlans[date] = {
      availableMinutes: 240,
      tasks: []
    };
  }

  return dailyPlans[date];
}


// 14. INITIALIZE PLANNER

function setupPlanner() {
  dateInput.value = getToday();

  dateInput.addEventListener("change", () => {
    renderPlanner();
  });

  hoursInput.addEventListener("change", () => {
    const hours = Number(hoursInput.value);

    if (!Number.isFinite(hours) || hours < 0.5 || hours > 24) {
      alert("Enter a value between 0.5 and 24 hours.");
      renderPlanner();
      return;
    }

    const plan = getCurrentPlan();

    plan.availableMinutes = Math.round(hours * 60);

    saveData();
    renderPlanner();
  });

  document.getElementById("add-to-plan-btn")
    .addEventListener("click", addTaskToPlan);

  plannedList.addEventListener("change", updatePlannedDuration);

  plannedList.addEventListener("click", removePlannedTask);

  renderPlanner();
}


// 15. TASK SELECTOR

function renderTaskOptions() {
  const plan = getCurrentPlan();

  taskSelect.innerHTML = '<option value="">Choose a task</option>';

  state
    .filter(task => task.status !== "done")
    .filter(task => !plan.tasks.some(item => item.taskId === task.id))
    .forEach(task => {
      const option = document.createElement("option");

      option.value = task.id;
      option.textContent = task.title;

      taskSelect.appendChild(option);
    });
}


// 16. ADD TASK TO DAILY PLAN

function addTaskToPlan() {
  const taskId = taskSelect.value;
  const duration = Number(durationInput.value);

  if (!taskId) {
    alert("Please select a task.");
    return;
  }

  if (!Number.isInteger(duration) || duration <= 0) {
    alert("Please enter a valid duration in minutes.");
    return;
  }

  const plan = getCurrentPlan();

  const alreadyAdded = plan.tasks.some(item => item.taskId === taskId);

  if (alreadyAdded) {
    alert("This task is already in your daily plan.");
    return;
  }

  plan.tasks.push({
    taskId: taskId,
    durationMinutes: duration
  });

  saveData();
  renderPlanner();

  durationInput.value = 30;
}


// 17. DISPLAY PLANNED TASKS

function renderPlannedTasks() {
  const plan = getCurrentPlan();

  plannedList.innerHTML = "";

  if (plan.tasks.length === 0) {
    plannedList.innerHTML = `
            <p class="empty-message">
                No tasks planned yet. Add a task to get started!
            </p>
        `;

    return;
  }

  plan.tasks.forEach(item => {
    const task = state.find(t => t.id === item.taskId);

    if (!task) return;

    const row = document.createElement("div");
    row.className = "planned-task";

    const title = document.createElement("strong");
    title.textContent = task.title;

    const controls = document.createElement("div");
    controls.className = "planned-task-controls";

    const duration = document.createElement("input");
    duration.type = "number";
    duration.min = "5";
    duration.step = "5";
    duration.value = item.durationMinutes;
    duration.dataset.taskId = item.taskId;
    duration.className = "planned-duration";

    const label = document.createElement("span");
    label.textContent = "min";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.className = "btn-delete";
    remove.dataset.taskId = item.taskId;

    controls.append(duration, label, remove);
    row.append(title, controls);

    plannedList.appendChild(row);
  });
}


// 18. UPDATE TASK DURATION

function updatePlannedDuration(event) {
  if (!event.target.matches(".planned-duration")) return;

  const taskId = event.target.dataset.taskId;
  const duration = Number(event.target.value);

  if (!Number.isInteger(duration) || duration <= 0) {
    alert("Enter a valid duration.");
    renderPlanner();
    return;
  }

  const plan = getCurrentPlan();

  const item = plan.tasks.find(t => t.taskId === taskId);

  if (item) {
    item.durationMinutes = duration;
    saveData();
    renderPlanner();
  }
}


// 19. REMOVE TASK FROM DAILY PLAN

function removePlannedTask(event) {
  const button = event.target.closest(".planned-task-controls button");

  if (!button) return;

  const taskId = button.dataset.taskId;

  const plan = getCurrentPlan();

  plan.tasks = plan.tasks.filter(item => item.taskId !== taskId);

  saveData();
  renderPlanner();
}


// 20. TIME CALCULATIONS

function calculatePlan() {
  const plan = getCurrentPlan();

  const planned = plan.tasks.reduce(
    (total, item) => total + item.durationMinutes,
    0
  );

  const available = plan.availableMinutes;

  return {
    available,
    planned,
    remaining: available - planned
  };
}


// 21. RENDER PLANNER

function renderPlanner() {
  const plan = getCurrentPlan();

  hoursInput.value = plan.availableMinutes / 60;

  renderTaskOptions();
  renderPlannedTasks();

  const totals = calculatePlan();

  totalAvailable.textContent = totals.available;
  totalPlanned.textContent = totals.planned;
  remainingTime.textContent = Math.max(0, totals.remaining);

  let warning = document.getElementById("planner-warning");

  if (!warning) {
    warning = document.createElement("p");
    warning.id = "planner-warning";
    document.querySelector(".planner-summary").appendChild(warning);
  }

  if (totals.remaining < 0) {
    warning.textContent =
      `Over capacity! You need ${Math.abs(totals.remaining)} extra minutes.`;

    warning.className = "planner-warning";
  } else {
    warning.textContent = "Your plan fits your available time!";
    warning.className = "planner-success";
  }

  updateTimeChart();
}


// 22. INITIALIZE ECHARTS

function initializeChart() {
  if (timeChart || !window.echarts) return;

  const chartElement = document.getElementById("time-chart");

  timeChart = echarts.init(chartElement);

  updateTimeChart();
}


// 23. UPDATE ECHARTS DOUGHNUT CHART

function updateTimeChart() {
  if (!timeChart) return;

  const plan = getCurrentPlan();

  const totals = calculatePlan();

  const chartData = plan.tasks.map(item => {
    const task = state.find(t => t.id === item.taskId);

    return {
      name: task ? task.title : "Task",
      value: item.durationMinutes
    };
  });

  if (totals.remaining > 0) {
    chartData.push({
      name: "Remaining time",
      value: totals.remaining
    });
  }

  if (chartData.length === 0) {
    chartData.push({
      name: "Available time",
      value: totals.available
    });
  }

  timeChart.setOption({
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} minutes ({d}%)"
    },

    legend: {
      bottom: 5,
      left: "center",
      type: "scroll",
      selectedMode: true
    },

    series: [{
      name: "Time distribution",
      type: "pie",
      radius: ["45%", "70%"],
      center: ["50%", "45%"],

      avoidLabelOverlap: true,

      itemStyle: {
        borderRadius: 8,
        borderColor: "#ffffff",
        borderWidth: 3
      },

      label: {
        show: true,
        formatter: "{d}%"
      },

      data: chartData

      
    }]
    
  }, true);
}


// =========================================
// NAVIGATION
// =========================================

// 24. SWITCH BETWEEN BOARD AND PLANNER

function setupNavigation() {
  const boardSection = document.getElementById("board");
  const formSection = document.querySelector(".form-container");

  document.getElementById("show-board-btn")
    .addEventListener("click", () => {
      boardSection.classList.remove("hidden");
      formSection.classList.remove("hidden");
      plannerSection.classList.add("hidden");
    });

  document.getElementById("show-planner-btn")
    .addEventListener("click", showPlanner);

  document.getElementById("help-btn")
    .addEventListener("click", startTutorial);
}

function showPlanner() {
  document.getElementById("board").classList.add("hidden");

  document.querySelector(".form-container").classList.add("hidden");

  plannerSection.classList.remove("hidden");

  renderPlanner();

  initializeChart();

  if (timeChart) {
    timeChart.resize();
  }
}


// 25. REFRESH PLANNER AFTER KANBAN CHANGES

function refreshPlanner() {
  if (!dateInput.value) return;

  if (!plannerSection.classList.contains("hidden")) {
    renderPlanner();
  }
}


// =========================================
// DRIVER.JS TUTORIAL
// =========================================

function startTutorial() {
  showPlanner();

  const driverFactory = window.driver?.js?.driver;

  if (!driverFactory) {
    alert("Driver.js could not be loaded. Check your internet connection.");
    return;
  }

  const tutorial = driverFactory({
    showProgress: true,
    animate: true,
    steps: [
      {
        element: "#planner-date",
        popover: {
          title: "Choose your date",
          description: "Select the day you want to organize."
        }
      },
      {
        element: "#available-hours",
        popover: {
          title: "Available time",
          description: "Set how many hours you can work today."
        }
      },
      {
        element: "#planner-task-select",
        popover: {
          title: "Choose your tasks",
          description: "Select an existing task from your Kanban."
        }
      },
      {
        element: "#time-chart",
        popover: {
          title: "Your time distribution",
          description: "See how your available time is divided between tasks."
        }
       
      },
      {
        element: '#time-chart',
        popover: {
          title: 'Explore your possibilities',
          description: ' You can click a task name in the legend below the chart to temporarily hide its slice and see how the schedule looks without it.'
        }
      },
      {
        element: "#planned-task-list",
        popover: {
          title: "Manage your plan",
          description: "Change task durations or remove tasks from your plan."
        }
      }
    ]
  
  });

  requestAnimationFrame(() => tutorial.drive());
}


// =========================================
// FIREWORKS
// =========================================

function celebrate() {
  if (!window.confetti) return;

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}


// =========================================
// RESPONSIVE CHART
// =========================================

window.addEventListener("resize", () => {
  if (timeChart) {
    timeChart.resize();
  }
});
