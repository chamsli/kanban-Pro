let state = [
  { id: '101', title: 'Dissenyar base de dades', description: 'Crear esquema ERD', status: 'todo' },
  { id: '102', title: 'Configurar servidor Node', description: 'Express i CORS', status: 'in-progress' }
];

const board = document.getElementById('board');
const form = document.getElementById('new-task-form');
const template = document.getElementById('task-card-template');

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderAllTasks();
  setupEventListeners();
  updateTaskCount();
}

// MÒDUL 1 & 2
function createTaskCard(task) {
  // TODO M1.1: Clonar el template (.content.cloneNode(true))
  const card =template.content.cloneNode(true);
  // TODO M2.1: Assignar l'ID a l'atribut data-task-id de la targeta
  card.querySelector('.task-card').setAttribute('data-task-id', task.id);
  // TODO M1.2: Omplir el títol (.task-title) i descripció (.task-desc)
  card.querySelector('.task-title').textContent=task.title
  card.querySelector('.task-desc').textContent=task.description
  // TODO M2.2: Assignar el valor del select (.task-status-select) segons task.status
  card.querySelector('.task-status-select').value=task.status
  // TODO M2.3: Si task.status === 'done', afegir la classe 'completed'
  if(task.status==='done'){
    card.querySelector('.task-card').classList.add('completed')
  }
  // TODO M1.3: Retornar el node clonat
  return card;
}

function renderAllTasks() {
  // TODO M1.4: Netejar els contenidors i renderitzar les tasques de 'state' al seu contenidor corresponent
  document.getElementById('todo-list').innerHTML = '';
  document.getElementById('in-progress-list').innerHTML = '';
  document.getElementById('done-list').innerHTML = '';
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
  
}

function setupEventListeners() {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // TODO M2.4: Afegir nova tasca a 'state' i renderitzar-la al DOM
    const title = form.querySelector('#task-title-input').value;
    const description = form.querySelector('#task-desc-input').value;
    const status = form.querySelector('#task-status-select').value;
    if (!title || !description) {
      return; 
    }
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      status
    };
    state.push(newTask);
    if (status === 'todo') {
      document.getElementById('todo-list').appendChild(createTaskCard(newTask));
    } else if (status === 'in-progress') {
      document.getElementById('in-progress-list').appendChild(createTaskCard(newTask));
    } else if (status === 'done') {
      document.getElementById('done-list').appendChild(createTaskCard(newTask));
    }
    form.reset();
    updateTaskCount();
    renderAllTasks();
  });

  // TODO M2.5: Escoltar l'esdeveniment 'change' al board per quan es canvia l'estat del select:
  // - Trobar la targeta amb closest('.task-card')
  // - Llegir el nou estat i moure la targeta al seu contenidor (#todo-list, #in-progress-list, #done-list) amb appendChild
  // - Actualitzar l'estat a 'state' i la classe '.completed'
  board.addEventListener('change', (e) => {

    if (e.target.matches('.task-status-select')) {

      const card = e.target.closest('.task-card');

      if (!card) return;

      const taskId = card.dataset.taskId;
      const newStatus = e.target.value;

      // Find the task in the state array
      const task = state.find(t => t.id === taskId);

      if (!task) return;

      // Update its status
      task.status = newStatus;

      // Update the completed class
      card.classList.toggle('completed', newStatus === 'done');

      // Move the existing card to the correct column
      if (newStatus === 'todo') {
        document.getElementById('todo-list').appendChild(card);
      }
      else if (newStatus === 'in-progress') {
        document.getElementById('in-progress-list').appendChild(card);
      }
      else if (newStatus === 'done') {
        document.getElementById('done-list').appendChild(card);
      }

    }

  });

  board.addEventListener('click', (e) => {
    const target = e.target;

    // TODO M4: Acordió (closest + nextElementSibling + .collapsed)
    // TODO M2: Botó eliminar (closest + dataset.taskId + .remove())
    // TODO M3: Botons pujar/baixar (previousElementSibling / nextElementSibling + insertBefore)
    // M4: ACCORDION
    const header = target.closest('.column-header');

    if (header) {

      const content = header.nextElementSibling;

      content.classList.toggle('collapsed');

      const icon = header.querySelector('.toggle-icon');

      if (content.classList.contains('collapsed')) {
        icon.textContent = '▲';
      }
      else {
        icon.textContent = '▼';
      }

      return;
    }

    // Find the task card containing the clicked button
    const card = target.closest('.task-card');

    if (!card) return;

    const taskId = card.dataset.taskId;
    // M2: DELETE TASK
    if (target.closest('.btn-delete')) {

      // Remove the task from the state array
      state = state.filter(task => task.id !== taskId);

      // Remove the card from the DOM
      card.remove();

      // Update the counter
      updateTaskCount();

      return;
    }
    // M3: MOVE TASK UP
    if (target.closest('.btn-up')) {

      const previousCard = card.previousElementSibling;

      if (previousCard) {
        card.parentElement.insertBefore(card, previousCard);
      }

      return;
    }


    // M3: MOVE TASK DOWN
    if (target.closest('.btn-down')) {

      const nextCard = card.nextElementSibling;

      if (nextCard) {
        card.parentElement.insertBefore(nextCard, card);
      }

      return;
    }

  });

}

// MÒDUL 5: WEB COMPONENT
class TaskBadge extends HTMLElement {
  constructor() {
    super();
    // TODO M5.1: Attach shadow root
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  static get observedAttributes() { return ['count']; }
  attributeChangedCallback(name, oldValue, newValue) { if (oldValue !== newValue) this.render(); }

  render() {
    // TODO M5.2: Renderització de l'etiqueta

    const count = this.getAttribute('count') || 0;
    this.shadowRoot.innerHTML = `
    <style>
       .badge {
          background-color: #2563eb;
          color: white;
          padding: 8px 14px;
          border-radius: 20px;
          font-weight: bold;
          display: inline-block;
          font-family: Arial, sans-serif;
        }
      </style>

      <span class="badge">
        Total tasques: ${count}
      </span>
    `;

  }
  
}
customElements.define('task-badge', TaskBadge);

function updateTaskCount() {
  // TODO M5.3: Actualitzar l'atribut count de #global-badge
  const badge = document.getElementById('global-badge');
  // Count all task cards inside the board
  const totalTasks = board.querySelectorAll('.task-card').length;

  // Update the count attribute
  badge.setAttribute('count', totalTasks);
}