# Portfólio SOC / Blue Team

Site estático (HTML + CSS + JS puro, sem framework, sem build) para publicar seus exercícios de laboratório — captura de tráfego, phishing, análise de logs, etc. — como se fossem tickets de incidente.

## Como funciona

- `data/cases.json` é a **única fonte de dados**. Cada objeto no array é um card no dashboard e uma página de detalhe.
- `assets/cases/<id>/` guarda os screenshots de cada caso.
- Não há build, servidor ou banco de dados — é só abrir/hospedar os arquivos.

## Como adicionar um novo caso

1. Copie a pasta `assets/cases/example-phishing-001` e renomeie para um id novo, ex.: `assets/cases/phishing-004`.
2. Coloque seus screenshots reais dentro dela (substituindo os placeholders).
3. Abra `data/cases.json` e adicione um novo objeto no array, seguindo o mesmo formato dos exemplos. Campos:

| campo | descrição |
|---|---|
| `id` | precisa bater com o nome da pasta em `assets/cases/` |
| `case_number` | rótulo tipo `INC-2026-004` (livre, é só exibição) |
| `title` | título do caso |
| `category` | `phishing`, `network-traffic`, `log-analysis`, `malware` ou `misc` (pode adicionar novas categorias — o filtro se atualiza sozinho) |
| `severity` | `critical`, `high`, `medium` ou `low` |
| `status` | `resolved`, `in-progress` ou `monitoring` |
| `date` | formato `AAAA-MM-DD` |
| `duration` | texto livre, ex. `2h 40min` |
| `tools` | lista de ferramentas usadas |
| `mitre` | lista de técnicas MITRE ATT&CK relacionadas (opcional) |
| `summary` | resumo curto (aparece no card) |
| `timeline` | lista de `{ time, action }` |
| `iocs` | lista de `{ type, value }` |
| `findings` | texto dos achados técnicos |
| `lessons` | texto de lições aprendidas |
| `screenshots` | lista de `{ file, caption }`, onde `file` é o nome do arquivo dentro de `assets/cases/<id>/` |

4. Salve, dê commit e push — pronto, o caso aparece automaticamente no dashboard, com filtro de categoria/severidade e busca funcionando sem nenhuma alteração de código.

Você pode remover os 3 casos de exemplo quando tiver os seus próprios (ou deixá-los como referência de formato).

## Rodar localmente

Como o site usa `fetch()` para carregar o JSON, não dá pra simplesmente abrir o `index.html` com duplo-clique (o navegador bloqueia fetch de arquivo local). Suba um servidor simples:

```bash
# Python
python3 -m http.server 8000

# ou Node
npx serve .
```

Depois abra `http://localhost:8000`.

## Deploy no GitHub Pages

1. Crie um repositório novo no GitHub e suba esta pasta:
   ```bash
   git init
   git add .
   git commit -m "Portfólio SOC inicial"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```
2. No GitHub: **Settings → Pages → Source → Deploy from branch → `main` / `root`**.
3. Em alguns minutos o site estará em `https://SEU_USUARIO.github.io/SEU_REPO/`.

Toda vez que você quiser adicionar um caso novo, é só editar `data/cases.json`, adicionar as imagens, e dar `git push` — o GitHub Pages republica sozinho.

## Personalizar

- Nome, e-mail e links: edite o `<header class="topbar">` em `index.html` e `case.html`.
- Cores/tipografia: tudo centralizado nas variáveis CSS no topo de `css/style.css` (`:root`).
- Categorias: adicione/renomeie em `CATEGORY_LABELS` no topo de `js/app.js` e `js/case.js` (mantenha os dois arquivos sincronizados).
