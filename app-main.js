const app = document.querySelector("#app");
const topnav = document.querySelector("#topnav");
const topbar = document.querySelector(".topbar");

const data = {
  authUsers: [
    { role: "admin", email: "admin@fokal.com", password: "admin123", redirect: "/admin", name: "Equipe Fokal" },
    { role: "cliente", email: "cliente@fokal.com", password: "cliente123", redirect: "/cliente", name: "Aurora Studio" },
  ],
  admin: {
    events: [
      { date: "14 Abr", title: "Reuniao de alinhamento com Aurora", description: "Validar andamento do cronograma, aprovar pauta e revisar pontos criticos." },
      { date: "17 Abr", title: "Fechamento financeiro da quinzena", description: "Consolidar faturamento, despesas e margem operacional dos clientes ativos." },
      { date: "22 Abr", title: "Entrega de midia do mes", description: "Checklist final antes de liberar midia e relatorio para os clientes." },
      { date: "28 Abr", title: "Planejamento do proximo ciclo", description: "Organizar visao macro de maio com prioridades, campanhas e roteiros." },
    ],
    finance: [
      { label: "Entradas / Faturamento", value: "R$ 48.600", note: "3 contratos ativos neste ciclo" },
      { label: "Saidas / Despesas Totais", value: "R$ 19.450", note: "Operacao, midia e fornecedores" },
      { label: "Despesas Fixas e Variaveis", value: "R$ 13.980", note: "Separadas para leitura operacional" },
      { label: "Saldo", value: "R$ 29.150", note: "Margem confortavel para expansao" },
    ],
    clients: [
      { id: "aurora", name: "Aurora Studio", segment: "Marca de moda", status: "Em execucao", months: ["abril-2026", "maio-2026", "junho-2026"] },
      { id: "atlas", name: "Atlas Engenharia", segment: "Servicos B2B", status: "Planejamento", months: ["abril-2026", "maio-2026"] },
      { id: "soma", name: "Soma Wellness", segment: "Saude e bem-estar", status: "Em aprovacao", months: ["abril-2026", "maio-2026", "junho-2026"] },
      { id: "viva", name: "Viva Foods", segment: "Alimentos", status: "Ativo", months: ["abril-2026", "maio-2026"] },
    ],
  },
  client: {
    currentMonth: "abril-2026",
    months: [
      {
        slug: "abril-2026",
        label: "Abril 2026",
        summary: "Mes focado em consistencia de marca, entregas de campanha e leitura de resultado.",
        modules: [
          { name: "Documentos", status: "Atualizado hoje", description: "Contratos, briefing, aprovacoes e arquivos-base centralizados.", bullets: ["Briefing estrategico aprovado", "Checklist operacional fechado", "Links de pasta e referencias"] },
          { name: "Cronograma", status: "3 marcos da semana", description: "Organizacao de entregas, revisoes e datas-chave do ciclo mensal.", bullets: ["Captacao no dia 16", "Aprovacao final no dia 21", "Publicacao principal no dia 25"] },
          { name: "Roteiros", status: "2 em revisao", description: "Estrutura narrativa dos conteudos previstos para o mes.", bullets: ["Roteiro institucional", "Roteiro de campanha sazonal", "Ajustes de CTA e timing"] },
          { name: "Midia", status: "4 pecas prontas", description: "Pecas, formatos e materiais visuais organizados por objetivo.", bullets: ["Carrossel principal", "Stories de apoio", "Variacoes de criativo"] },
          { name: "Analise de Resultados", status: "Parcial disponivel", description: "Leitura resumida de desempenho, alcance e proximos movimentos.", bullets: ["Aumento de 18% no alcance", "Melhora no engajamento", "Recomendacao para ampliar retargeting"] },
        ],
      },
      {
        slug: "maio-2026",
        label: "Maio 2026",
        summary: "Ciclo orientado a aceleracao de campanha e refinamento de posicionamento.",
        modules: [
          { name: "Documentos", status: "Preparando", description: "Base documental do novo ciclo em organizacao.", bullets: ["Nova pauta em aprovacao", "Briefing de campanha em rascunho", "Central de assets revisada"] },
          { name: "Cronograma", status: "Em montagem", description: "Proximas datas ja sugeridas para producao, revisao e entrega.", bullets: ["Kickoff no dia 03", "Captacao prevista para 10", "Relatorio final no dia 29"] },
          { name: "Roteiros", status: "1 pronto", description: "Novas pecas sendo construidas com foco em performance.", bullets: ["Roteiro manifesto aprovado", "Roteiro promocional em andamento"] },
          { name: "Midia", status: "Pre-producao", description: "Planejamento visual do proximo lote de conteudos.", bullets: ["Moodboard definido", "Referencias de enquadramento", "Mapeamento de formatos"] },
          { name: "Analise de Resultados", status: "Aguardando fechamento", description: "Area reservada para leitura consolidada no fim do ciclo.", bullets: ["Resumo executivo sera publicado no fechamento"] },
        ],
      },
      {
        slug: "junho-2026",
        label: "Junho 2026",
        summary: "Previa de planejamento ja aberta para visao futura do cliente.",
        modules: [
          { name: "Documentos", status: "Reservado", description: "Espaco pronto para receber materiais do proximo trimestre.", bullets: ["Pasta estrutural criada"] },
          { name: "Cronograma", status: "Rascunho", description: "Primeiros marcos serao definidos apos aprovacao de maio.", bullets: ["Dependente do fechamento anterior"] },
          { name: "Roteiros", status: "Sem itens", description: "Roteiros entram aqui assim que o planejamento for validado.", bullets: ["Aguardando pauta"] },
          { name: "Midia", status: "Sem itens", description: "Area preparada para receber pecas e formatos futuros.", bullets: ["Aguardando definicao visual"] },
          { name: "Analise de Resultados", status: "Sem leitura", description: "Resultados serao disponibilizados ao longo do ciclo.", bullets: ["Painel sera alimentado durante a execucao"] },
        ],
      },
    ],
  },
};

const navByRole = {
  admin: [
    { label: "Painel", href: "/admin" },
    { label: "Clientes", href: "/admin" },
  ],
  cliente: [
    { label: "Visao Geral", href: "/cliente" },
    { label: "Mes Atual", href: `/cliente/${data.client.currentMonth}` },
  ],
};

document.body.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-link]");
  if (!trigger) return;
  const href = trigger.getAttribute("href");
  if (!href) return;
  event.preventDefault();
  navigate(href);
});

window.addEventListener("popstate", renderRoute);

function navigate(path) {
  window.history.pushState({}, "", path);
  renderRoute();
}

function getSession() {
  try {
    return JSON.parse(window.localStorage.getItem("fokal-session") || "null");
  } catch {
    return null;
  }
}

function setSession(session) {
  window.localStorage.setItem("fokal-session", JSON.stringify(session));
}

function clearSession() {
  window.localStorage.removeItem("fokal-session");
}

function renderTopnav(pathname) {
  const session = getSession();
  const isLogin = pathname === "/";
  topbar.classList.toggle("is-login", isLogin);

  if (isLogin) {
    topnav.innerHTML = "";
    return;
  }

  const navItems = navByRole[session?.role] || [];
  topnav.innerHTML = `
    ${navItems
      .map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return `<a class="nav-pill ${isActive ? "is-active" : ""}" data-link href="${item.href}">${item.label}</a>`;
      })
      .join("")}
    <button class="nav-action" id="logout-button" type="button">Sair</button>
  `;

  const logoutButton = document.querySelector("#logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      clearSession();
      navigate("/");
    });
  }
}

function requireAuth(role) {
  const session = getSession();
  if (!session || session.role !== role) {
    navigate("/");
    return false;
  }
  return true;
}

function renderRoute() {
  const pathname = window.location.pathname;
  renderTopnav(pathname);

  if (pathname === "/") {
    app.innerHTML = renderLogin();
    bindLoginForm();
    return;
  }

  if (pathname === "/admin") {
    if (!requireAuth("admin")) return;
    app.innerHTML = renderAdminDashboard();
    return;
  }

  if (pathname.startsWith("/admin/cliente/")) {
    if (!requireAuth("admin")) return;
    const [, , , clientId, monthSlug] = pathname.split("/");
    app.innerHTML = renderAdminMonthDetail(clientId, monthSlug);
    return;
  }

  if (pathname === "/cliente") {
    if (!requireAuth("cliente")) return;
    app.innerHTML = renderClientDashboard();
    return;
  }

  if (pathname.startsWith("/cliente/")) {
    if (!requireAuth("cliente")) return;
    const monthSlug = pathname.split("/")[2];
    app.innerHTML = renderClientMonth(monthSlug);
    return;
  }

  app.innerHTML = renderNotFound();
}

function renderLogin() {
  return `
    <section class="login-screen">
      <article class="login-brand card">
        <div class="login-brand-inner">
          <div class="login-logo-badge">
            <img src="/assets/icon-white.png" alt="Icone Fokal" />
          </div>
          <p class="eyebrow">Fokal Platform</p>
          <h1>Login unico para dois ambientes.</h1>
          <p>Acesso centralizado para equipe administrativa e clientes. O proprio login define qual experiencia sera carregada dentro do sistema.</p>
          <div class="brand-bullets">
            <div class="brand-bullet">
              <strong>Admin</strong>
              <span>Calendario, financeiro e gestao completa por cliente e mes.</span>
            </div>
            <div class="brand-bullet">
              <strong>Cliente</strong>
              <span>Documentos, cronograma, roteiros, midia e analise de resultados.</span>
            </div>
          </div>
        </div>
      </article>
      <section class="login-form-wrap">
        <article class="login-card card">
          <div class="login-card-header">
            <img src="/assets/logo-blue.png" alt="Fokal" class="brand-logo" />
            <h2>Acesse sua area</h2>
            <p class="helper-text">Escolha o perfil, informe email e senha e o sistema direciona voce para a tela correta.</p>
          </div>
          <form class="form-grid" id="login-form">
            <div class="field">
              <label for="role">Perfil</label>
              <select id="role" name="role">
                <option value="admin">Administrador</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
            <div class="field">
              <label for="email">Email</label>
              <input id="email" name="email" type="email" placeholder="voce@fokal.com" required />
            </div>
            <div class="field">
              <label for="password">Senha</label>
              <input id="password" name="password" type="password" placeholder="Digite sua senha" required />
            </div>
            <div class="login-alert" id="login-alert"></div>
            <div class="form-actions">
              <button class="button button-primary" type="submit">Entrar</button>
            </div>
          </form>
          <div class="credentials-grid">
            <article class="credential-card">
              <img src="/assets/icon-blue.png" alt="" />
              <h3>Acesso admin</h3>
              <p><strong>Email:</strong> admin@fokal.com<br /><strong>Senha:</strong> admin123</p>
            </article>
            <article class="credential-card">
              <img src="/assets/icon-black.png" alt="" />
              <h3>Acesso cliente</h3>
              <p><strong>Email:</strong> cliente@fokal.com<br /><strong>Senha:</strong> cliente123</p>
            </article>
          </div>
        </article>
      </section>
    </section>
  `;
}

function bindLoginForm() {
  const form = document.querySelector("#login-form");
  const alertBox = document.querySelector("#login-alert");
  if (!form || !alertBox) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const role = String(formData.get("role") || "");
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    const user = data.authUsers.find((item) => item.role === role && item.email === email && item.password === password);

    if (!user) {
      alertBox.textContent = "Credenciais invalidas para o perfil selecionado. Use os acessos demonstrativos abaixo.";
      alertBox.classList.add("is-visible");
      return;
    }

    setSession({ role: user.role, email: user.email, name: user.name });
    navigate(user.redirect);
  });
}

function renderAdminDashboard() {
  const session = getSession();
  const clientCards = data.admin.clients
    .map((client) => {
      const latestMonth = client.months[0];
      return `
        <article class="client-card">
          <div>
            <h3>${client.name}</h3>
            <p>${client.segment}</p>
          </div>
          <div class="client-meta">
            <span class="chip">${client.status}</span>
            <span class="chip">${client.months.length} meses ativos</span>
          </div>
          <a class="button button-ghost" data-link href="/admin/cliente/${client.id}/${latestMonth}">Abrir mes mais recente</a>
        </article>
      `;
    })
    .join("");

  return `
    <section class="dashboard">
      <header class="page-title">
        <p class="eyebrow">Admin</p>
        <h1>Painel operacional da Fokal.</h1>
        <p>Bem-vindo, ${session?.name || "Equipe"}. Uma visao unica para organizar calendario, acompanhar financeiro e entrar no detalhe mensal dos clientes.</p>
      </header>
      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-header">
            <div>
              <span class="section-kicker">Calendario</span>
              <h2>Agenda estrategica da semana</h2>
              <p>Bloco de leitura rapida para alinhar entregas, aprovacoes e fechamento.</p>
            </div>
          </div>
          <div class="calendar-grid">
            ${data.admin.events
              .map(
                (event) => `
                  <article class="calendar-card">
                    <time>${event.date}</time>
                    <strong>${event.title}</strong>
                    <p>${event.description}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
        <section class="panel">
          <div class="panel-header">
            <div>
              <span class="section-kicker">Financeiro</span>
              <h2>Leitura financeira consolidada</h2>
              <p>Resumo dos indicadores principais para gestao interna.</p>
            </div>
          </div>
          <div class="metrics-grid">
            ${data.admin.finance
              .map(
                (item) => `
                  <article class="metric-card">
                    <small>${item.label}</small>
                    <strong>${item.value}</strong>
                    <span class="muted">${item.note}</span>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      </div>
      <section class="panel">
        <div class="panel-header">
          <div>
            <span class="section-kicker">Gestao Cliente > Mes</span>
            <h2>Clientes ativos e visao mensal</h2>
            <p>Entre no mes de cada cliente para ver documentos, cronograma, roteiros, midia e analise.</p>
          </div>
        </div>
        <div class="clients-grid">${clientCards}</div>
      </section>
    </section>
  `;
}

function renderAdminMonthDetail(clientId, monthSlug) {
  const client = data.admin.clients.find((item) => item.id === clientId);
  const month = getMonth(monthSlug);
  if (!client || !month) return renderNotFound();

  return `
    <section class="month-layout">
      <aside class="month-sidebar">
        <section class="panel">
          <p class="eyebrow">Admin > Cliente</p>
          <div class="month-head">
            <h1>${client.name}</h1>
            <p>${client.segment} com acesso administrativo ao ciclo de ${month.label}.</p>
          </div>
          <div class="module-tags">
            <span class="tag">${client.status}</span>
            <span class="tag">${month.label}</span>
          </div>
          <div class="hero-actions">
            <a class="button button-secondary" data-link href="/admin">Voltar ao admin</a>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Meses disponiveis</h2>
              <p>Atalhos para navegar pela operacao do cliente.</p>
            </div>
          </div>
          <div class="months-grid">
            ${client.months
              .map(
                (slug) => `
                  <a class="month-card ${slug === month.slug ? "active" : ""}" data-link href="/admin/cliente/${client.id}/${slug}">
                    <strong>${formatMonthLabel(slug)}</strong>
                    <p>Abrir visao administrativa do ciclo.</p>
                  </a>
                `,
              )
              .join("")}
          </div>
        </section>
      </aside>
      <section class="month-overview">
        <header class="page-title">
          <p class="eyebrow">Resumo mensal</p>
          <h1>${month.label}</h1>
          <p>${month.summary}</p>
        </header>
        <section class="modules-grid">
          ${month.modules
            .map(
              (module) => `
                <article class="module-card admin">
                  <div class="panel-header">
                    <div>
                      <h3>${module.name}</h3>
                      <p>${module.description}</p>
                    </div>
                    <span class="chip">${module.status}</span>
                  </div>
                  <ul>${module.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
                </article>
              `,
            )
            .join("")}
        </section>
      </section>
    </section>
  `;
}

function renderClientDashboard() {
  const session = getSession();
  const currentMonth = getMonth(data.client.currentMonth);

  return `
    <section class="dashboard">
      <header class="page-title">
        <p class="eyebrow">Cliente</p>
        <h1>Acompanhamento mensal com a identidade Fokal.</h1>
        <p>Bem-vindo, ${session?.name || "Cliente"}. Um ambiente leve para acessar documentos, cronograma, roteiros, midia e analise de resultados.</p>
      </header>
      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-header">
            <div>
              <span class="section-kicker">Mes Atual</span>
              <h2>${currentMonth.label}</h2>
              <p>${currentMonth.summary}</p>
            </div>
            <a class="button button-primary" data-link href="/cliente/${currentMonth.slug}">Abrir detalhes</a>
          </div>
          <div class="months-grid">
            ${data.client.months
              .map(
                (month) => `
                  <a class="month-card ${month.slug === currentMonth.slug ? "active" : ""}" data-link href="/cliente/${month.slug}">
                    <strong>${month.label}</strong>
                    <p>${month.modules.length} frentes organizadas para o ciclo.</p>
                  </a>
                `,
              )
              .join("")}
          </div>
        </section>
        <section class="panel">
          <div class="panel-header">
            <div>
              <span class="section-kicker">Modulos</span>
              <h2>O que voce encontra na area do cliente</h2>
              <p>Leitura rapida do tipo de conteudo disponivel dentro do mes.</p>
            </div>
          </div>
          <div class="modules-grid">
            ${currentMonth.modules
              .map(
                (module) => `
                  <article class="module-card client">
                    <h3>${module.name}</h3>
                    <p>${module.description}</p>
                    <span class="chip">${module.status}</span>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderClientMonth(monthSlug) {
  const month = getMonth(monthSlug);
  if (!month) return renderNotFound();

  return `
    <section class="month-layout">
      <aside class="month-sidebar">
        <section class="panel">
          <p class="eyebrow">Cliente > Mes</p>
          <div class="month-head">
            <h1>${month.label}</h1>
            <p>${month.summary}</p>
          </div>
          <div class="month-switcher">
            ${data.client.months
              .map(
                (item) => `
                  <a class="button ${item.slug === month.slug ? "button-primary" : "button-secondary"}" data-link href="/cliente/${item.slug}">
                    ${item.label}
                  </a>
                `,
              )
              .join("")}
          </div>
          <div class="hero-actions">
            <a class="button button-secondary" data-link href="/cliente">Voltar a visao geral</a>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Visao do ciclo</h2>
              <p>Resumo do que esta acontecendo neste mes.</p>
            </div>
          </div>
          <ul class="bullet-list">
            <li>Todos os materiais estao organizados por frente de trabalho.</li>
            <li>O cronograma traz datas-chave de producao, revisao e entrega.</li>
            <li>A analise resume os resultados e orienta proximos passos.</li>
          </ul>
        </section>
      </aside>
      <section class="month-overview">
        <header class="page-title">
          <p class="eyebrow">Entregaveis do mes</p>
          <h1>${month.label}</h1>
          <p>Os cinco modulos abaixo representam o nucleo da experiencia do cliente neste prototipo.</p>
        </header>
        <div class="modules-grid">
          ${month.modules
            .map(
              (module) => `
                <article class="module-card client">
                  <div class="panel-header">
                    <div>
                      <h3>${module.name}</h3>
                      <p>${module.description}</p>
                    </div>
                    <span class="chip">${module.status}</span>
                  </div>
                  <ul>${module.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </section>
  `;
}

function renderNotFound() {
  return `
    <section class="panel empty-state">
      <p class="eyebrow">Conteudo nao encontrado</p>
      <h1>Essa rota nao esta disponivel neste prototipo.</h1>
      <p>Volte para o login e entre novamente no ambiente adequado.</p>
      <div class="hero-actions">
        <a class="button button-primary" data-link href="/">Voltar ao login</a>
      </div>
    </section>
  `;
}

function getMonth(slug) {
  return data.client.months.find((month) => month.slug === slug);
}

function formatMonthLabel(slug) {
  return getMonth(slug)?.label ?? slug;
}

renderRoute();
