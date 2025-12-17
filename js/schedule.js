// =======================
// DATA (startvärden)
// =======================
const schedule = {
  "måndag": [],
  "tisdag": [],
  "onsdag": [],
  "torsdag": [],
  "fredag": []
};

// =======================
// HJÄLPFUNKTIONER
// =======================
function getTodaySwedish() {
  const jsDay = new Date().getDay();
  return ["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"][jsDay];
}

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min) {
  const h = Math.floor(min / 60);
  return `${String(h).padStart(2,"0")}:00`;
}

// =======================
// SKAPA TIMSLOTAR 07–17
// =======================
const labels = [];
const hourSlots = [];

for (let h = 7; h < 17; h++) {
  const startMin = h * 60;
  const endMin = (h + 1) * 60;
  labels.push(`${minutesToTime(startMin)}–${minutesToTime(endMin)}`);
  hourSlots.push({ startMin, endMin });
}

// =======================
// CHART
// =======================
let scheduleChart;

window.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("scheduleChart").getContext("2d");

  scheduleChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Öppningar",
          data: new Array(labels.length).fill(0),
          backgroundColor: new Array(labels.length).fill("rgba(76,175,80,0.7)"),
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            generateLabels: function() {
              return [
                {
                  text: '1–2 öppningar',
                  fillStyle: 'rgba(76,175,80,0.7)',
                  strokeStyle: 'rgba(76,175,80,1)',
                  lineWidth: 1
                },
                {
                  text: '3–4 öppningar',
                  fillStyle: 'rgba(255,193,7,0.7)',
                  strokeStyle: 'rgba(255,193,7,1)',
                  lineWidth: 1
                },
                {
                  text: '5+ öppningar',
                  fillStyle: 'rgba(244,67,54,0.7)',
                  strokeStyle: 'rgba(244,67,54,1)',
                  lineWidth: 1
                }
              ];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.y + ' öppningar';
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            minRotation: 0
          }
        },
        y: {
          min: 0,
          max: 15,
          ticks: { stepSize: 1 },
          title: { display: true, text: "Antal öppningar" }
        }
      }
    }
  });

  document.querySelectorAll(".day-buttons button").forEach(btn =>
    btn.addEventListener("click", () => selectButton(btn.dataset.day))
  );

  selectButton(getTodaySwedish());
});

// =======================
// DAGVAL
// =======================
function selectButton(day) {
  document.querySelectorAll(".day-buttons button").forEach(b => {
    b.classList.toggle("selected", b.dataset.day === day);
    b.setAttribute("aria-selected", b.dataset.day === day);
  });
  
  // Uppdatera vald dag-visning
  const selectedDayDisplay = document.getElementById("selected-day-display");
  if (selectedDayDisplay) {
    selectedDayDisplay.textContent = day.charAt(0).toUpperCase() + day.slice(1);
  }
  
  updateChart(day);
}

// =======================
// UPPDATERA DIAGRAM
// =======================
function updateChart(day) {
  const dayIntervals = schedule[day] || [];

  const totals = new Array(labels.length).fill(0);
  const colors = new Array(labels.length).fill("rgba(76,175,80,0.7)");

  dayIntervals.forEach(({ start, end, count }) => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);

    hourSlots.forEach((slot, index) => {
      if (startMin < slot.endMin && endMin > slot.startMin) {
        totals[index] += count;
      }
    });
  });

  // Sätt färg baserat på totalt antal
  totals.forEach((total, index) => {
    if (total <= 2) {
      colors[index] = "rgba(76,175,80,0.7)"; // Grön
    } else if (total <= 4) {
      colors[index] = "rgba(255,193,7,0.7)"; // Gul
    } else {
      colors[index] = "rgba(244,67,54,0.7)"; // Röd
    }
  });

  scheduleChart.data.datasets[0].data = totals;
  scheduleChart.data.datasets[0].backgroundColor = colors;
  scheduleChart.update();
}

// =======================
// MQTT – LIVE DATA
// =======================

// ⚠️ ÄNDRA OM NI BYTER TOPIC
const MQTT_BROKER = "wss://test.mosquitto.org:8081";
const MQTT_TOPIC = "MDU/GRUPP4/Postkoll";

const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on("connect", () => {
  console.log("✅ MQTT ansluten");
  mqttClient.subscribe(MQTT_TOPIC);
});

mqttClient.on("message", (topic, message) => {
  const payload = message.toString().trim().toUpperCase();
  console.log("📩 MQTT:", payload);

  if (payload === "OPEN") {
    registerOpening();
  }
});

// =======================
// register opening
// =======================
function registerOpening() {
  const now = new Date();
  const day = getTodaySwedish();
  const minutes = now.getHours() * 60 + now.getMinutes();

  if (!schedule[day]) schedule[day] = [];

  hourSlots.forEach(slot => {
    if (minutes >= slot.startMin && minutes < slot.endMin) {
      const start = minutesToTime(slot.startMin);
      const end = minutesToTime(slot.endMin);

      let interval = schedule[day].find(i => i.start === start && i.end === end);

      if (interval) interval.count += 1;
      else schedule[day].push({ start, end, count: 1 });
    }
  });

  updateChart(day);
  console.log(`📊 Öppning registrerad (${day})`);
}
