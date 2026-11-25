// app.js - dashboard logic for the Smart Medicine Reminder Box

let data = loadData();
const PERIODS = ["Morning", "Afternoon", "Evening"];
const dueIds = new Set();      // medicines whose reminder is currently due (drives the LED)
const notified = new Set();    // reminders already shown today (so they don't repeat)
const lidOpen = { Morning: false, Afternoon: false, Evening: false }; // simulated lid state
let editId = null;             // id of medicine being edited (null = adding new)

const $ = (id) => document.getElementById(id);

// Prevent special characters from breaking the page
function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// "14:30" -> "2:30 PM"
function to12h(t) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

// ---------- Clock ----------
function updateClock() {
  const now = new Date();
  $("clockTime").textContent = now.toLocaleTimeString();
  $("clockDate").textContent = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// ---------- Rendering ----------
function renderCards() {
  const total = data.medicines.length;
  const taken = data.medicines.filter((m) => m.status === "Taken").length;
  $("cTotal").textContent = total;
  $("cToday").textContent = total;
  $("cTaken").textContent = taken;
  $("cPending").textContent = total - taken;
}

function renderTable() {
  const rows = [...data.medicines].sort((a, b) => a.time.localeCompare(b.time)).map((m) => `
    <tr>
      <td>${esc(m.name)}</td>
      <td>${esc(m.dosage)}</td>
      <td>${m.period}</td>
      <td>${to12h(m.time)}</td>
      <td>${m.food}</td>
      <td>Compartment ${PERIODS.indexOf(m.period) + 1}</td>
      <td><span class="badge ${m.status}">${m.status}</span></td>
      <td>
        <button class="btn small primary" onclick="markTaken(${m.id})" ${m.status === "Taken" ? "disabled" : ""}>Taken</button>
        <button class="btn small" onclick="openForm(${m.id})">Edit</button>
        <button class="btn small danger" onclick="deleteMedicine(${m.id})">Delete</button>
      </td>
    </tr>`).join("");
  $("medBody").innerHTML = rows || `<tr><td colspan="8" class="empty">No medicines yet. Click "Add Medicine" to start.</td></tr>`;
}

function renderBox() {
  $("boxGrid").innerHTML = PERIODS.map((p, i) => {
    const meds = data.medicines.filter((m) => m.period === p);
    const due = meds.some((m) => dueIds.has(m.id));
    const allTaken = meds.length > 0 && meds.every((m) => m.status === "Taken");
    const ledClass = due ? "due" : allTaken ? "ok" : "";
    const ledText = due ? "LED blinking: reminder due" : allTaken ? "LED green: all taken" : "LED off";
    const list = meds.map((m) => `<li>${esc(m.name)} (${to12h(m.time)})</li>`).join("") || "<li>Empty</li>";
    return `
      <div class="card compartment">
        <h3>${p} Compartment ${i + 1}</h3>
        <div class="led ${ledClass}"></div>
        <div class="led-text">${ledText} (DEMO)</div>
        <div class="lid ${lidOpen[p] ? "open" : ""}">
          Lid: <b>${lidOpen[p] ? "Open" : "Closed"}</b> (DEMO)
          <ul>${list}</ul>
        </div>
        <button class="btn small" onclick="toggleLid('${p}')">${lidOpen[p] ? "Close Lid" : "Open Lid"}</button>
      </div>`;
  }).join("");
}

function renderHistory() {
  const rows = [...data.history].reverse().map((h) => `
    <tr><td>${h.date}</td><td>${esc(h.name)}</td><td>${to12h(h.time)}</td><td><span class="badge ${h.status}">${h.status}</span></td></tr>`).join("");
  $("histBody").innerHTML = rows || `<tr><td colspan="4" class="empty">No history yet.</td></tr>`;
}

function renderChart() {
  const total = data.medicines.length;
  const taken = data.medicines.filter((m) => m.status === "Taken").length;
  const pct = total ? Math.round((taken / total) * 100) : 0;
  $("donut").style.background = `conic-gradient(#7c5cd6 0 ${pct}%, #cfd8ee ${pct}% 100%)`;
  $("donutText").textContent = pct + "%";
  $("lgTaken").textContent = taken;
  $("lgPending").textContent = total - taken;
}

function renderAll() {
  renderCards(); renderTable(); renderBox(); renderHistory(); renderChart();
}

function update() { saveData(data); renderAll(); }

// ---------- Actions ----------
function markTaken(id) {
  const m = data.medicines.find((x) => x.id === id);
  if (!m || m.status === "Taken") return;
  m.status = "Taken";
  dueIds.delete(id);
  data.history.push({ date: todayStr(), name: m.name, time: m.time, status: "Taken" });
  hideNotification();
  update();
}

function deleteMedicine(id) {
  const m = data.medicines.find((x) => x.id === id);
  if (!m || !confirm(`Delete ${m.name}?`)) return;
  data.medicines = data.medicines.filter((x) => x.id !== id);
  dueIds.delete(id);
  update();
}

// Lid button is only a demo: it never changes medicine status
function toggleLid(period) {
  lidOpen[period] = !lidOpen[period];
  $("lidMsg").textContent = lidOpen[period]
    ? `DEMO: ${period} lid opened. Opening the lid does not mark any medicine as taken. Use the Taken button.`
    : `DEMO: ${period} lid closed.`;
  renderBox();
}

// ---------- Reminder notification ----------
function showReminder(m) {
  dueIds.add(m.id);
  $("notification").innerHTML = `
    <h3>⏰ Medicine Reminder</h3>
    <p><b>Medicine:</b> ${esc(m.name)}</p>
    <p><b>Dosage:</b> ${esc(m.dosage)}</p>
    <p><b>Reminder time:</b> ${to12h(m.time)}</p>
    <p><b>Food instruction:</b> ${m.food}</p>
    <div class="btn-row">
      <button class="btn primary" onclick="markTaken(${m.id})">Taken</button>
      <button class="btn ghost" onclick="hideNotification()">Dismiss</button>
    </div>`;
  $("notification").classList.remove("hidden");
  renderBox();
}

function hideNotification() { $("notification").classList.add("hidden"); }

// Runs every 10 seconds: shows a reminder when the clock matches a pending medicine's time
function checkReminders() {
  const now = new Date();
  const hhmm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  data.medicines.forEach((m) => {
    const key = m.id + "-" + todayStr() + "-" + m.time;
    if (m.status === "Pending" && m.time === hhmm && !notified.has(key)) {
      notified.add(key);
      showReminder(m);
    }
  });
}

// For the faculty demo: show a reminder right now for the next pending medicine
function triggerDemoReminder() {
  const next = data.medicines.filter((m) => m.status === "Pending").sort((a, b) => a.time.localeCompare(b.time))[0];
  if (next) showReminder(next);
  else alert("All medicines are taken. Add a medicine or reset demo data.");
}

// ---------- Add / Edit form ----------
function openForm(id = null) {
  editId = id;
  const m = id ? data.medicines.find((x) => x.id === id) : null;
  $("modalTitle").textContent = m ? "Edit Medicine" : "Add Medicine";
  $("fName").value = m ? m.name : "";
  $("fDose").value = m ? m.dosage : "";
  $("fPeriod").value = m ? m.period : "Morning";
  $("fTime").value = m ? m.time : "08:00";
  $("fFood").value = m ? m.food : "After Food";
  $("modal").classList.remove("hidden");
  $("fName").focus();
}

function closeForm() { $("modal").classList.add("hidden"); }

$("medForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const values = {
    name: $("fName").value.trim(),
    dosage: $("fDose").value.trim(),
    period: $("fPeriod").value,
    time: $("fTime").value,
    food: $("fFood").value
  };
  if (editId) {
    const m = data.medicines.find((x) => x.id === editId);
    if (m.time !== values.time) m.status = "Pending";   // new time = new reminder
    Object.assign(m, values);
  } else {
    data.medicines.push({ id: data.nextId++, status: "Pending", ...values });
  }
  closeForm();
  update();
});

// ---------- Page setup ----------
$("addBtn").onclick = () => openForm();
$("cancelBtn").onclick = closeForm;
$("demoBtn").onclick = triggerDemoReminder;
$("resetBtn").onclick = () => {
  if (!confirm("Reset all data to the demo sample?")) return;
  data = sampleData();
  dueIds.clear(); notified.clear(); hideNotification();
  update();
};

// Highlight the clicked sidebar link
document.querySelectorAll("#nav a").forEach((a) => {
  a.addEventListener("click", () => {
    document.querySelectorAll("#nav a").forEach((x) => x.classList.remove("active"));
    a.classList.add("active");
  });
});

updateClock();
setInterval(updateClock, 1000);
setInterval(checkReminders, 10000);
renderAll();
checkReminders();
