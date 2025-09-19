const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks-container');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const timelineList = document.getElementById('timeline-list');
const modeToggle = document.querySelector('.mode-toggle');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');
const searchBar = document.getElementById('search-bar');

let tasks = [];
let editMode = false;
let currentEditId = null;

// Load tasks
function loadTasks() {
  const saved = localStorage.getItem('smartStudyTasks');
  if (saved) tasks = JSON.parse(saved);
}
function saveTasks() {
  localStorage.setItem('smartStudyTasks', JSON.stringify(tasks));
}

// Form submit
taskForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const deadline = document.getElementById('deadline').value;
  const category = document.getElementById('category').value;
  const priority = document.getElementById('priority').value;

  if(!title || !deadline) return;

  if(editMode){
    const idx = tasks.findIndex(t=>t.id===currentEditId);
    if(idx!==-1){
      tasks[idx] = {...tasks[idx], title, description, deadline, category, priority};
    }
    editMode=false; currentEditId=null;
  } else {
    tasks.unshift({id:Date.now().toString(), title, description, deadline, category, priority, completed:false});
  }

  saveTasks(); updateUI(); taskForm.reset();
});

// Render
function renderTasks(){
  tasksContainer.innerHTML='';
  const searchVal = searchBar.value.toLowerCase();
  let filtered = tasks.filter(t => t.title.toLowerCase().includes(searchVal) || t.category.toLowerCase().includes(searchVal));

  if(filtered.length===0){
    tasksContainer.innerHTML="<p>No tasks found</p>";
    return;
  }

  filtered.forEach(task=>{
    const card=document.createElement('div');
    card.className=`task-card ${task.completed?'task-completed':''}`;
    card.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <input type="checkbox" ${task.completed?'checked':''}>
        <h3>${task.title}</h3>
        <small>${task.deadline}</small>
      </div>
      <span class="task-category ${task.priority==="High"?"priority-high":task.priority==="Medium"?"priority-medium":"priority-low"}">
        ${task.category} - ${task.priority}
      </span>
      <p>${task.description||''}</p>
      <button class="edit-btn">Edit</button>
      <button class="del-btn">Delete</button>
    `;

    card.querySelector('input').addEventListener('change', e=>{
      task.completed=e.target.checked;
      saveTasks(); updateUI();
    });
    card.querySelector('.edit-btn').addEventListener('click', ()=>{
      document.getElementById('title').value=task.title;
      document.getElementById('description').value=task.description;
      document.getElementById('deadline').value=task.deadline;
      document.getElementById('category').value=task.category;
      document.getElementById('priority').value=task.priority;
      editMode=true; currentEditId=task.id;
    });
    card.querySelector('.del-btn').addEventListener('click', ()=>{
      tasks=tasks.filter(t=>t.id!==task.id);
      saveTasks(); updateUI();
    });

    tasksContainer.appendChild(card);
  });
}

// Progress
function updateProgress(){
  const total=tasks.length;
  const completed=tasks.filter(t=>t.completed).length;
  const percent=total>0?Math.round((completed/total)*100):0;
  progressBar.style.width=percent+"%";
  progressPercent.textContent=percent+"%";
  totalTasksEl.textContent=total;
  completedTasksEl.textContent=completed;
  pendingTasksEl.textContent=total-completed;
}

// Timeline
function renderTimeline(){
  timelineList.innerHTML='';
  const upcoming=tasks.filter(t=>!t.completed).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).slice(0,5);
  if(upcoming.length===0){
    timelineList.innerHTML="<li>No upcoming deadlines</li>";
    return;
  }
  upcoming.forEach(t=>{
    const li=document.createElement('li');
    li.textContent=`${t.title} - ${t.deadline}`;
    timelineList.appendChild(li);
  });
}

// Dark Mode
modeToggle.addEventListener('click', ()=>{
  const cur=document.body.getAttribute('data-theme');
  const next=cur==='light'?'dark':'light';
  document.body.setAttribute('data-theme',next);
  modeToggle.textContent=next==='dark'?'☀️':'🌙';
  localStorage.setItem('theme',next);
});

// Search
searchBar.addEventListener('input', renderTasks);

// Update UI
function updateUI(){ updateProgress(); renderTasks(); renderTimeline(); }

// Init
loadTasks();
const savedTheme=localStorage.getItem('theme');
if(savedTheme){document.body.setAttribute('data-theme',savedTheme);}
updateUI();
