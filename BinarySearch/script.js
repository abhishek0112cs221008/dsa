const STORAGE_KEY = "binary-search-progress";

async function loadData() {
  try {
    const res = await fetch("data.json");

    if (!res.ok) {
      throw new Error(`Failed to load data.json (${res.status})`);
    }

    const data = await res.json();
    render(data);
  } catch (error) {
    renderError(error.message);
  }
}

function getSavedProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress(progressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
}

function getMergedCategories(data) {
  const progressMap = getSavedProgress();
  const categories = Array.isArray(data.categories) ? data.categories : [];

  return categories.map((category) => ({
    ...category,
    problems: (category.problems || []).map((problem) => ({
      ...problem,
      solved: Object.prototype.hasOwnProperty.call(progressMap, problem.id)
        ? progressMap[problem.id]
        : Boolean(problem.solved),
    })),
  }));
}

function render(data) {
  const container = document.getElementById("problemTable");
  const categories = getMergedCategories(data);

  container.innerHTML = "";

  let total = 0;
  let solved = 0;

  categories.forEach((category) => {
    const section = document.createElement("section");
    section.className = "category-card";

    const problems = category.problems || [];
    problems.forEach((problem) => {
      total += 1;
      if (problem.solved) {
        solved += 1;
      }
    });

    section.innerHTML = `
      <div class="category-header">
        <div>
          <p class="category-label">Category</p>
          <h3>${category.name}</h3>
        </div>
        <span class="category-count">${problems.length} problems</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Problem</th>
              <th>Difficulty</th>
              <th>Pattern</th>
              <th>Link</th>
              <th>Solved</th>
            </tr>
          </thead>
          <tbody>
            ${problems.map((problem) => createRow(problem)).join("")}
          </tbody>
        </table>
      </div>
    `;

    container.appendChild(section);
  });

  bindSolvedToggles();
  updateStats(total, solved, categories.length);
}

function createRow(problem) {
  const difficultyClass = String(problem.difficulty || "").toLowerCase();

  return `
    <tr>
      <td>${problem.id}</td>
      <td class="problem-name">${problem.problem}</td>
      <td><span class="difficulty ${difficultyClass}">${problem.difficulty}</span></td>
      <td>${problem.pattern}</td>
      <td><a href="${problem.leetcode}" target="_blank" rel="noopener noreferrer">Open</a></td>
      <td>
        <label class="checkbox-cell">
          <input type="checkbox" data-id="${problem.id}" ${problem.solved ? "checked" : ""}>
          <span>${problem.solved ? "Done" : "Pending"}</span>
        </label>
      </td>
    </tr>
  `;
}

function bindSolvedToggles() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"][data-id]');

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const progressMap = getSavedProgress();
      progressMap[checkbox.dataset.id] = checkbox.checked;
      saveProgress(progressMap);
      loadData();
    });
  });
}

function updateStats(total, solved, categoryCount) {
  const remaining = total - solved;
  const percent = total === 0 ? 0 : Math.round((solved / total) * 100);

  document.getElementById("total").innerText = total;
  document.getElementById("done").innerText = solved;
  document.getElementById("left").innerText = remaining;
  document.getElementById("category-count").innerText = `${categoryCount} categories`;
  document.getElementById("progress-text").innerText = `${percent}%`;
  document.getElementById("progress-bar").style.width = `${percent}%`;
}

function renderError(message) {
  document.getElementById("problemTable").innerHTML = `
    <div class="card error-card">
      <h3>Unable to load data</h3>
      <p>${message}</p>
    </div>
  `;
}

loadData();
