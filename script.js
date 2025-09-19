const taskForm=document.getElementById('task-form');
const tasksContainer=document.getElementById('tasks-container');
const timelineList=document.getElementById('timeline-list');
const modeToggle=document.querySelector('.mode-toggle');
const totalTasksEl=document.getElementById('total-tasks');
const completedTasksEl=document.getElementById('completed-tasks');
const pendingTasksEl=document.getElementById('pending-tasks');
const searchBar=document.getElementById('search-bar');
let tasks=[],editMode=false,currentEditId=null;

// Load/Save
function loadTasks(){const s=localStorage.getItem('smartStudyTasks');if(s)tasks=JSON.parse(s);}
function saveTasks(){localStorage.setItem('smartStudyTasks',JSON.stringify(tasks));}

// Submit
taskForm.addEventListener('submit',e=>{
  e.preventDefault();
  const title=document.getElementById('title').value.trim();
  const description=document.getElementById('description').value.trim();
  const deadline=document.getElementById('deadline').value;
  const category=document.getElementById('category').value;
  const priority=document.getElementById('priority').value;
  if(!title||!deadline)return;
  if(editMode){
    const idx=tasks.findIndex(t=>t.id===currentEditId);
    if(idx!==-1){tasks[idx]={...tasks[idx],title,description,deadline,category,priority};}
    editMode=false;currentEditId=null;
  } else {
    tasks.unshift({id:Date.now().toString(),title,description,deadline,category,priority,completed:false});
  }
  saveTasks();updateUI();taskForm.reset();
});

// Render tasks
function renderTasks(){
  tasksContainer.innerHTML='';
  const searchVal=searchBar.value.toLowerCase();
  let filtered=tasks.filter(t=>t.title.toLowerCase().includes(searchVal)||t.category.toLowerCase().includes(searchVal));
  if(filtered.length===0){tasksContainer.innerHTML="<p>No tasks found</p>";return;}
  filtered.forEach(task=>{
    const card=document.createElement('div');
    card.className="task-card";
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
    card.querySelector('input').addEventListener('change',e=>{
      task.completed=e.target.checked;saveTasks();updateUI();
    });
    card.querySelector('.edit-btn').addEventListener('click',()=>{
      document.getElementById('title').value=task.title;
      document.getElementById('description').value=task.description;
      document.getElementById('deadline').value=task.deadline;
      document.getElementById('category').value=task.category;
      document.getElementById('priority').value=task.priority;
      editMode=true;currentEditId=task.id;
    });
    card.querySelector('.del-btn').addEventListener('click',()=>{
      tasks=tasks.filter(t=>t.id!==task.id);saveTasks();updateUI();
    });
    tasksContainer.appendChild(card);
  });
}

// Charts
let progressChart,categoryChart;
function updateCharts(){
  const total=tasks.length,completed=tasks.filter(t=>t.completed).length,pending=total-completed;
  if(progressChart)progressChart.destroy();
  progressChart=new Chart(document.getElementById('progressChart'),{
    type:'pie',
    data:{labels:['Completed','Pending'],datasets:[{data:[completed,pending],backgroundColor:['#48bb78','#f56565']}]}
  });
  const cats={Homework:0,Revision:0,Project:0,Exam:0};
  tasks.forEach(t=>cats[t.category]++);
  if(categoryChart)categoryChart.destroy();
  categoryChart=new Chart(document.getElementById('categoryChart'),{
    type:'bar',
    data:{labels:Object.keys(cats),datasets:[{label:'Tasks',data:Object.values(cats),backgroundColor:'#6c9bcf'}]}
  });
  totalTasksEl.textContent=total;completedTasksEl.textContent=completed;pendingTasksEl.textContent=pending;
}

// Timeline
function renderTimeline(){
  timelineList.innerHTML='';
  const upcoming=tasks.filter(t=>!t.completed).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).slice(0,5);
  if(upcoming.length===0){timelineList.innerHTML="<li>No upcoming deadlines</li>";return;}
  upcoming.forEach(t=>{const li=document.createElement('li');li.textContent=`${t.title} - ${t.deadline}`;timelineList.appendChild(li);});
}

// Search
searchBar.addEventListener('input',renderTasks);

// Dark mode
modeToggle.addEventListener('click',()=>{
  const cur=document.body.getAttribute('data-theme');
  const next=cur==='light'?'dark':'light';
  document.body.setAttribute('data-theme',next);
  modeToggle.textContent=next==='dark'?'☀️':'🌙';
  localStorage.setItem('theme',next);
});

// Update UI
function updateUI(){renderTasks();updateCharts();renderTimeline();}

// Init
loadTasks();const savedTheme=localStorage.getItem('theme');if(savedTheme){document.body.setAttribute('data-theme',savedTheme);}
updateUI();
