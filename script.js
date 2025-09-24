// your code goes here
let streak = 0;
let tasks = [];
let timer;
let timeLeft = 1500; // 25 mins in seconds
let running = false;
let weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun

// Add Task
function addTask() {
  const taskInput = document.getElementById("taskInput");
  if (taskInput.value === "") return;
  tasks.push({ text: taskInput.value, done: false });
  taskInput.value = "";
  renderTasks();
}

function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  renderTasks();
  updateProgress();
}

function renderTasks() {
  const container = document.getElementById("taskContainer");
  container.innerHTML = "";
  tasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${task.done ? "checked" : ""} onclick="toggleTask(${i})">
      ${task.text}
    `;
    container.appendChild(li);
  });
}

function updateProgress() {
  const doneTasks = tasks.filter(t => t.done).length;
  const percent = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  document.getElementById("progressFill").style.width = percent + "%";
  document.getElementById("progressText").textContent = percent + "% Completed";

  if (percent === 100) {
    streak++;
    document.getElementById("streak").textContent = streak;
    awardBadge();
    updateWeeklyProgress();
    notifyUser("🎉 Great job! You completed all tasks today!");
  }
}

// Gamification Badge
function awardBadge() {
  let badge = "No Badge";
  if (streak >= 3 && streak < 7) badge = "Bronze 🥉";
  else if (streak >= 7 && streak < 14) badge = "Silver 🥈";
  else if (streak >= 14) badge = "Gold 🥇";
  document.getElementById("badge").textContent = badge;
}

// Pomodoro Timer
function startTimer() {
  if (running) return;
  running = true;
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timer);
      running = false;
      notifyUser("⏰ Time's up! Take a break.");
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  running = false;
}

function resetTimer() {
  clearInterval(timer);
  running = false;
  timeLeft = 1500;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  document.getElementById("timer").textContent =
    `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Notifications
function notifyUser(msg) {
  if (Notification.permission === "granted") {
    new Notification(msg);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(p => {
      if (p === "granted") new Notification(msg);
    });
  } else {
    alert(msg);
  }
}

// Weekly Progress Chart (Chart.js)
const ctx = document.getElementById("weeklyChart").getContext("2d");
let weeklyChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Tasks Completed",
      data: weeklyData,
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderRadius: 10
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

function updateWeeklyProgress() {
  const today = new Date().getDay(); // Sun=0, Mon=1...
  const dayIndex = today === 0 ? 6 : today - 1; // make Mon=0
  weeklyData[dayIndex] += tasks.length;
  weeklyChart.update();
}

// Dark Mode Toggle
document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
