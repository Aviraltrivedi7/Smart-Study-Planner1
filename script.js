// DOM Elements
const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks-container');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const timelineList = document.getElementById('timeline-list');
const modeToggle = document.querySelector('.mode-toggle');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');

// State
let tasks = [];
let editMode = false;
let currentEditId = null;

// Initialize app
function init() {
    loadTasks();
    setupEventListeners();
    updateUI();
}

// Load tasks from localStorage
function loadTasks() {
    const saved = localStorage.getItem('smartStudyTasks');
    if (saved) {
        try {
            tasks = JSON.parse(saved);
        } catch {
            tasks = [];
        }
    }
}

// Save tasks
function saveTasks() {
    localStorage.setItem('smartStudyTasks', JSON.stringify(tasks));
}

// Setup event listeners
function setupEventListeners() {
    taskForm.addEventListener('submit', handleFormSubmit);
    modeToggle.addEventListener('click', toggleDarkMode);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editMode) cancelEdit();
    });
}

// Handle form submit
function handleFormSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const deadline = document.getElementById('deadline').value;
    if (!title || !deadline) return;

    if (editMode) {
        const taskIndex = tasks.findIndex(task => task.id === currentEditId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], title, description, deadline };
        }
        editMode = false;
        currentEditId = null;
    } else {
        const newTask = {
            id: Date.now().toString(),
            title,
            description,
            deadline,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.unshift(newTask);
    }
    saveTasks();
    updateUI();
    taskForm.reset();
    showNotification(editMode ? 'Task updated!' : 'Task added!');
}

// Toggle completion
function toggleTaskCompletion(taskId, completed) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = completed;
        saveTasks();
        updateUI();
        if (completed) showNotification('Task completed! 🎉');
    }
}

// Edit task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        document.getElementById('title').value = task.title;
        document.getElementById('description').value = task.description || '';
        document.getElementById('deadline').value = task.deadline;
        editMode = true;
        currentEditId = taskId;
        taskForm.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('title').focus();
    }
}

// Cancel edit
function cancelEdit() {
    editMode = false;
    currentEditId = null;
    taskForm.reset();
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            saveTasks();
            updateUI();
            showNotification('Task deleted');
        }
    }
}

// Format date
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const d = new Date(dateStr + 'T00:00:00');
    return isNaN(d) ? 'Invalid date' : d.toLocaleDateString(undefined, options);
}

// Update progress
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressBar.style.width = `${percentage}%`;
    progressPercent.textContent = `${percentage}%`;
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = total - completed;
}

// Update UI
function updateUI() {
    updateProgress();
    renderTasks();
    renderTimeline();
}

// Render tasks
function renderTasks() {
    tasksContainer.innerHTML = '';
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `
          <div class="empty-state">
            <p>No study tasks yet</p>
            <p>Add your first task to get started!</p>
          </div>`;
        return;
    }
    tasks.forEach(task => {
        const taskCard = document.createElement('article');
        taskCard.className = `task-card ${task.completed ? 'task-completed' : ''}`;
        taskCard.setAttribute('data-id', task.id);

        taskCard.innerHTML = `
          <div class="task-header">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}/>
            <h3 class="task-title">${escapeHtml(task.title)}</h3>
            <time class="task-deadline">${formatDate(task.deadline)}</time>
          </div>
          ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
          <div class="task-actions">
            <button class="btn-small">Edit</button>
            <button class="btn-small btn-delete">Delete</button>
          </div>
        `;

        taskCard.querySelector('.task-checkbox')
            .addEventListener('change', (e) => toggleTaskCompletion(task.id, e.target.checked));
        taskCard.querySelector('.btn-small').addEventListener('click', () => editTask(task.id));
        taskCard.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));

        tasksContainer.appendChild(taskCard);
    });
}

// Render timeline
function renderTimeline() {
    timelineList.innerHTML = '';
    const upcomingTasks = tasks.filter(t => !t.completed)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);
    if (upcomingTasks.length === 0) {
        timelineList.innerHTML = `<li class="timeline-item"><span>No upcoming deadlines</span></li>`;
        return;
    }
    upcomingTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'timeline-item';
        li.innerHTML = `<span>${escapeHtml(task.title)}</span>
                        <span>${formatDate(task.deadline)}</span>`;
        timelineList.appendChild(li);
    });
}

// Dark mode
function toggleDarkMode() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    modeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', newTheme);
}

// Notification
function showNotification(msg) {
    const note = document.createElement('div');
    note.textContent = msg;
    note.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: #6c9bcf; color: white;
      padding: 12px 20px; border-radius: 8px;
    `;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 3000);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Init
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    modeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}
init();
