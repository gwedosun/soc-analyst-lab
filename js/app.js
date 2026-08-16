const CATEGORY_LABELS = {
  "phishing": "Phishing",
  "network-traffic": "Análise de tráfego",
  "log-analysis": "Análise de logs",
  "malware": "Malware",
  "misc": "Outros"
};

let allCases = [];
let activeCategory = "all";
let searchTerm = "";

document.getElementById("year").textContent = new Date().getFullYear();

fetch("data/cases.json")
  .then(r => r.json())
  .then(cases => {
    allCases = cases;
    renderStats(cases);
    renderFilters(cases);
    renderGrid();
  })
  .catch(() => {
    document.getElementById("grid").innerHTML =
      `<div class="empty-state">Não foi possível carregar data/cases.json. Verifique se o arquivo existe e é um JSON válido.</div>`;
  });

function renderStats(cases) {
  const byCategory = {};
  cases.forEach(c => { byCategory[c.category] = (byCategory[c.category] || 0) + 1; });

  const strip = document.getElementById("stats-strip");
  const items = [
    { n: cases.length, l: "casos no total" },
    ...Object.entries(byCategory).map(([cat, n]) => ({ n, l: CATEGORY_LABELS[cat] || cat }))
  ];
  strip.innerHTML = items.map(i => `
    <div class="stat">
      <span class="n">${i.n}</span>
      <span class="l">${i.l}</span>
    </div>
  `).join("");
}

function renderFilters(cases) {
  const categories = [...new Set(cases.map(c => c.category))];
  const filters = document.getElementById("filters");
  const allChip = filters.querySelector('[data-filter-value="all"]');

  categories.forEach(cat => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.dataset.filterType = "category";
    chip.dataset.filterValue = cat;
    chip.textContent = CATEGORY_LABELS[cat] || cat;
    filters.insertBefore(chip, document.getElementById("search"));
  });

  filters.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    filters.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeCategory = chip.dataset.filterValue;
    renderGrid();
  });

  document.getElementById("search").addEventListener("input", (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderGrid();
  });
}

function renderGrid() {
  const grid = document.getElementById("grid");

  let filtered = allCases.filter(c => activeCategory === "all" || c.category === activeCategory);

  if (searchTerm) {
    filtered = filtered.filter(c => {
      const haystack = [
        c.title, c.summary, c.case_number,
        ...(c.tools || []), ...(c.iocs || []).map(i => i.value)
      ].join(" ").toLowerCase();
      return haystack.includes(searchTerm);
    });
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">Nenhum caso encontrado para esse filtro. Ajuste a busca ou escolha outra categoria.</div>`;
    return;
  }

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  grid.innerHTML = filtered.map(c => `
    <a class="card" href="case.html?id=${encodeURIComponent(c.id)}">
      <div class="card-top">
        <span class="case-id">${c.case_number}</span>
        <span class="sev-tag sev-${c.severity}">${severityLabel(c.severity)}</span>
      </div>
      <h3>${c.title}</h3>
      <p class="summary">${c.summary}</p>
      <div class="card-meta">
        <span class="category-label">${CATEGORY_LABELS[c.category] || c.category}</span>
        <span>${formatDate(c.date)}</span>
      </div>
    </a>
  `).join("");
}

function severityLabel(sev) {
  return { critical: "crítica", high: "alta", medium: "média", low: "baixa" }[sev] || sev;
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
