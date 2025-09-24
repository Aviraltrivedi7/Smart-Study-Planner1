// ✅ Task Management
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = task.text;
    if (task.completed) li.classList.add("completed");
    li.draggable = true;

    li.addEventListener("click", () => toggleTask(index));
    li.addEventListener("dragstart", e => {
      e.dataTransfer.setData("index", index);
    });
    li.addEventListener("dragover", e => e.preventDefault());
    li.addEventListener("drop", e => {
      let draggedIndex = e.dataTransfer.getData("index");
      [tasks[draggedIndex], tasks[index]] = [tasks[index], tasks[draggedIndex]];
      saveTasks();
    });

    taskList.appendChild(li);
  });
}

function addTask() {
  if (taskInput.value.trim() === "") return;
  tasks.push({ text: taskInput.value, completed: false });
  taskInput.value = "";
  saveTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  updateChart();
  updateStreak();
}

addTaskBtn.addEventListener("click", addTask);
renderTasks();

// ✅ Dark Mode Toggle
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// ✅ Progress Chart
const ctx = document.getElementById("progressChart");
let progressChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ["Completed", "Pending"],
    datasets: [{
      data: [0, 0],
      backgroundColor: ["#4CAF50", "#f44336"]
    }]
  }
});

function updateChart() {
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  progressChart.data.datasets[0].data = [completed, pending];
  progressChart.update();
}
updateChart();

// ✅ Calendar
const calendar = document.getElementById("calendar");
function renderCalendar() {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  calendar.innerHTML = "";
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.textContent = i;
    if (i === today.getDate()) day.classList.add("today");
    calendar.appendChild(day);
  }
}
renderCalendar();

// ✅ Gamification
let streak = parseInt(localStorage.getItem("streak")) || 0;
const streakCounter = document.getElementById("streak-counter");
const badgesDiv = document.getElementById("badges");

function updateStreak() {
  const completedToday = tasks.some(t => t.completed);
  if (completedToday) {
    streak++;
    localStorage.setItem("streak", streak);
  }
  streakCounter.textContent = `Current Streak: ${streak} days`;
  updateBadges();
}

function updateBadges() {
  badgesDiv.innerHTML = "";
  if (streak >= 3) badgesDiv.innerHTML += `<span class="badge">🔥 3 Day Streak</span>`;
  if (streak >= 7) badgesDiv.innerHTML += `<span class="badge">🏆 7 Day Streak</span>`;
  if (streak >= 30) badgesDiv.innerHTML += `<span class="badge">🌟 30 Day Legend</span>`;
}
updateStreak();

// ✅ Notifications
const notifyBtn = document.getElementById("notify-btn");
notifyBtn.addEventListener("click", () => {
  if (Notification.permission === "granted") {
    new Notification("📖 Time to study! Stay consistent 💪");
  } else {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification("📖 Reminder enabled!");
      }
    });
  }
});
