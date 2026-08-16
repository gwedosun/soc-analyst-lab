const CATEGORY_LABELS = {
  "phishing": "Phishing",
  "network-traffic": "Análise de tráfego",
  "log-analysis": "Análise de logs",
  "malware": "Malware",
  "misc": "Outros"
};

document.getElementById("year").textContent = new Date().getFullYear();

const params = new URLSearchParams(window.location.search);
const caseId = params.get("id");

fetch("data/cases.json")
  .then(r => r.json())
  .then(cases => {
    const c = cases.find(item => item.id === caseId);
    const container = document.getElementById("case-content");
    if (!c) {
      container.innerHTML = `<div class="not-found">Caso não encontrado. <a href="index.html">Voltar para a fila.</a></div>`;
      return;
    }
    document.title = `${c.case_number} — ${c.title}`;
    container.innerHTML = render(c);
  })
  .catch(() => {
    document.getElementById("case-content").innerHTML =
      `<div class="not-found">Não foi possível carregar data/cases.json.</div>`;
  });

function severityLabel(sev) {
  return { critical: "crítica", high: "alta", medium: "média", low: "baixa" }[sev] || sev;
}

function statusLabel(status) {
  return { resolved: "resolvido", "in-progress": "em andamento", monitoring: "em observação" }[status] || status;
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function render(c) {
  const timeline = (c.timeline || []).map(t => `
    <div class="timeline-item">
      <span class="t-time">${t.time}</span>
      <span class="t-action">${t.action}</span>
    </div>
  `).join("");

  const iocRows = (c.iocs || []).map(i => `
    <tr><td>${i.type}</td><td>${i.value}</td></tr>
  `).join("");

  const shots = (c.screenshots || []).map(s => `
    <div class="shot">
      <figure>
        <img src="assets/cases/${c.id}/${s.file}" alt="${s.caption || ''}" loading="lazy">
        <figcaption>${s.caption || ''}</figcaption>
      </figure>
    </div>
  `).join("");

  const tags = [...(c.tools || []).map(t => `<span class="tag">${t}</span>`),
                ...(c.mitre || []).map(t => `<span class="tag">${t}</span>`)].join("");

  return `
    <div class="ticket">
      <div class="ticket-top">
        <span class="ticket-id">${c.case_number}</span>
        <div class="badges">
          <span class="sev-tag sev-${c.severity}">${severityLabel(c.severity)}</span>
          <span class="status-badge">${statusLabel(c.status)}</span>
        </div>
      </div>
      <h1>${c.title}</h1>
      <div class="ticket-meta">
        <span><span class="m-label">categoria</span><span class="m-value">${CATEGORY_LABELS[c.category] || c.category}</span></span>
        <span><span class="m-label">data</span><span class="m-value">${formatDate(c.date)}</span></span>
        <span><span class="m-label">duração</span><span class="m-value">${c.duration || '—'}</span></span>
      </div>
      <div class="tag-row">${tags}</div>
    </div>

    <div class="section">
      <h2>Resumo</h2>
      <p>${c.summary}</p>
    </div>

    ${c.timeline && c.timeline.length ? `
    <div class="section">
      <h2>Linha do tempo</h2>
      <div class="timeline">${timeline}</div>
    </div>` : ""}

    ${c.iocs && c.iocs.length ? `
    <div class="section">
      <h2>Indicadores de comprometimento</h2>
      <table class="ioc-table">
        <thead><tr><th>Tipo</th><th>Valor</th></tr></thead>
        <tbody>${iocRows}</tbody>
      </table>
    </div>` : ""}

    ${c.findings ? `
    <div class="section">
      <h2>Achados técnicos</h2>
      <p>${c.findings}</p>
    </div>` : ""}

    ${c.lessons ? `
    <div class="section">
      <h2>Lições aprendidas</h2>
      <p>${c.lessons}</p>
    </div>` : ""}

    ${c.screenshots && c.screenshots.length ? `
    <div class="section">
      <h2>Evidências</h2>
      <div class="shots">${shots}</div>
    </div>` : ""}
  `;
}
