// data.js - sample data and saving/loading (uses the browser's localStorage)

const STORE_KEY = "smartMedicineBoxData";

// Today's date as YYYY-MM-DD
function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// Demo data shown when the page is opened for the first time
function sampleData() {
  return {
    nextId: 7,
    medicines: [
      { id: 1, name: "Metformin",     dosage: "500 mg",     period: "Morning",   time: "08:00", food: "After Food",  status: "Taken" },
      { id: 2, name: "Vitamin D3",    dosage: "1 capsule",  period: "Morning",   time: "08:30", food: "After Food",  status: "Pending" },
      { id: 3, name: "Amlodipine",    dosage: "5 mg",       period: "Afternoon", time: "14:00", food: "Before Food", status: "Pending" },
      { id: 4, name: "Paracetamol",   dosage: "650 mg",     period: "Afternoon", time: "14:30", food: "After Food",  status: "Pending" },
      { id: 5, name: "Atorvastatin",  dosage: "10 mg",      period: "Evening",   time: "20:00", food: "After Food",  status: "Pending" },
      { id: 6, name: "Calcium",       dosage: "1 tablet",   period: "Evening",   time: "21:00", food: "After Food",  status: "Pending" }
    ],
    history: [
      { date: todayStr(-1), name: "Metformin",    time: "08:00", status: "Taken" },
      { date: todayStr(-1), name: "Amlodipine",   time: "14:00", status: "Taken" },
      { date: todayStr(-1), name: "Atorvastatin", time: "20:00", status: "Missed" },
      { date: todayStr(-2), name: "Metformin",    time: "08:00", status: "Taken" },
      { date: todayStr(-2), name: "Atorvastatin", time: "20:00", status: "Taken" },
      { date: todayStr(),   name: "Metformin",    time: "08:00", status: "Taken" }
    ]
  };
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore and use sample data */ }
  return sampleData();
}

function saveData(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) { /* storage not available - app still works for this session */ }
}
