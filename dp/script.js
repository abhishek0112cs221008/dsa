const app = document.getElementById("app");

let flatList = [];

// Load JSON
async function loadData() {
  try {
    const res = await fetch("dp.json");

    if (!res.ok) {
      throw new Error(`Failed to load dp.json (${res.status})`);
    }

    const data = await res.json();
    render(data); // ✅ pass data properly

  } catch (error) {
    renderError(error.message);
  }
}

// Render UI
function render(data) {
  app.innerHTML = "";
  flatList = [];

  Object.entries(data).forEach(([section, problems]) => {
    const div = document.createElement("div");
    div.className = "section";

    let html = `<h2>${section}</h2>`;

    problems.forEach((p) => {
      const id = flatList.length;
      flatList.push({ ...p, done: false });

      html += `
        <div class="item">
          <div class="left">
            <input type="checkbox" onchange="toggle(${id})">
            <span class="problem">${p.problem}</span>
          </div>
          <a href="${p.leetcode}" target="_blank">Solve</a>
        </div>
      `;
    });

    div.innerHTML = html;
    app.appendChild(div);
  });

  updateStats();
}

// Toggle checkbox
function toggle(i) {
  flatList[i].done = !flatList[i].done;
  updateStats();
}

// Update dashboard
function updateStats() {
  const total = flatList.length;
  const done = flatList.filter(p => p.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  document.getElementById("total").innerText = total;
  document.getElementById("done").innerText = done;
  document.getElementById("percent").innerText = percent + "%";
  document.getElementById("progressFill").style.width = percent + "%";
}

// Error UI
function renderError(msg) {
  app.innerHTML = `<p style="color:red;">${msg}</p>`;
}

// 🚀 Start app
loadData();