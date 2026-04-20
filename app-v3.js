const app = document.querySelector("#app");

const state = {
  session: readSession(),
  ui: {
    adminActivityTab: "Todas",
    clientActivityTab: "Todas",
    clientSearch: "",
    clientPlanFilter: "Todos",
    selectedDealId: 101,
    adminVisibleMonth: getMonthStartIso(new Date()),
    clientVisibleMonth: getMonthStartIso(new Date()),
    adminSelectedDate: getTodayIso(),
    clientSelectedDate: getTodayIso(),
    adminClientFilter: "all",
    reportsClientFilter: "all",
    reportsMonthFilter: String(new Date().getMonth()),
    reportsYearFilter: String(new Date().getFullYear()),
    trafficClientFilter: "all",
    trafficMonthFilter: String(new Date().getMonth()),
    trafficYearFilter: String(new Date().getFullYear()),
    modal: null,
  },
  ready: false,
};

const planOptions = ["Produção de Conteúdo", "Gestão de Tráfego", "Ambos"];

let registeredUsers = [];
let calendarTasks = [];
let contentItems = [];
let trafficCampaigns = [];

const adminMenu = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/admin/financeiro", label: "Financeiro", icon: "money" },
  { href: "/admin/clientes", label: "Clientes", icon: "users" },
  { href: "/admin/calendario", label: "Calendário", icon: "calendar" },
  { href: "/admin/relatorios", label: "Relatórios", icon: "chart" },
];

const clientMenu = [
  { href: "/cliente/calendario", label: "Calendário", icon: "calendar" },
  { href: "/cliente/relatorios", label: "Relatórios", icon: "chart" },
];

const pipelineStages = [
  { name: "Prospeccao", color: "gray" },
  { name: "Qualificacao", color: "blue" },
  { name: "Proposta", color: "purple" },
  { name: "Negociacao", color: "orange" },
  { name: "Fechamento", color: "green" },
];

let deals = [
  { id: 101, title: "Implementacao CRM", value: "R$ 25.000,00", company: "Empresa Alpha", contact: "Marina Lopes", owner: "Joao Silva", date: "15/04", stage: "Prospeccao", status: "Novo lead", description: "Primeira conversa para implantar CRM comercial.", nextAction: "Agendar diagnostico" },
  { id: 102, title: "Sistema de Vendas", value: "R$ 18.000,00", company: "Beta Corp", contact: "Rafael Gomes", owner: "Maria Costa", date: "16/04", stage: "Prospeccao", status: "Mapeamento inicial", description: "Cliente quer centralizar processo de vendas.", nextAction: "Enviar materiais de apresentacao" },
  { id: 103, title: "Dashboard Analytics", value: "R$ 12.000,00", company: "Gamma Ltd", contact: "Bianca Melo", owner: "Pedro Santos", date: "17/04", stage: "Prospeccao", status: "Aguardando retorno", description: "Interesse em dashboards de performance e CAC.", nextAction: "Retomar contato em 48h" },
  { id: 104, title: "Consultoria em Cloud", value: "R$ 45.000,00", company: "Tech Solutions", contact: "Maria Santos", owner: "Joao Silva", date: "14/04", stage: "Qualificacao", status: "Fit validado", description: "Escopo aprovado para ambiente cloud e governanca.", nextAction: "Fechar diagnostico tecnico" },
  { id: 105, title: "Migracao de Dados", value: "R$ 32.000,00", company: "Delta Inc", contact: "Luis Prado", owner: "Maria Costa", date: "15/04", stage: "Qualificacao", status: "Stakeholders mapeados", description: "Necessidade de migrar base legado para novo stack.", nextAction: "Confirmar cronograma de descoberta" },
  { id: 106, title: "Licencas de Software", value: "R$ 52.000,00", company: "Startup Inovadora", contact: "Pedro Costa", owner: "Ana Ferreira", date: "12/04", stage: "Proposta", status: "Proposta enviada", description: "Pacote anual com suporte premium e onboarding.", nextAction: "Negociar prazo de pagamento" },
  { id: 107, title: "Treinamento Equipe", value: "R$ 8.000,00", company: "Epsilon SA", contact: "Camila Rocha", owner: "Pedro Santos", date: "13/04", stage: "Proposta", status: "Em aprovacao", description: "Treinamento comercial focado em conversao e funil.", nextAction: "Aguardar aprovacao do RH" },
  { id: 108, title: "Automacao Marketing", value: "R$ 28.000,00", company: "Zeta Group", contact: "Fernando Luz", owner: "Maria Costa", date: "14/04", stage: "Proposta", status: "Ajustes comerciais", description: "Fluxos de automacao, CRM e lead scoring.", nextAction: "Reenviar proposta revisada" },
  { id: 109, title: "ERP Personalizado", value: "R$ 78.000,00", company: "Corporation Inc", contact: "Ana Oliveira", owner: "Joao Silva", date: "10/04", stage: "Negociacao", status: "Negociacao ativa", description: "Projeto em fase final de validacao juridica.", nextAction: "Aprovar clausulas finais" },
  { id: 110, title: "App Mobile", value: "R$ 42.000,00", company: "Theta Co", contact: "Ricardo Viana", owner: "Ana Ferreira", date: "11/04", stage: "Negociacao", status: "Desconto solicitado", description: "Aplicativo com painel administrativo e notificacoes.", nextAction: "Definir contraproposta" },
];

let financeItems = [
  { id: 201, type: "receita-fixa", name: "Contrato Retainer Alpha", description: "Consultoria mensal recorrente", value: "R$ 12.000,00" },
  { id: 202, type: "receita-fixa", name: "Gestao de Midia Beta", description: "Fee mensal de performance", value: "R$ 8.500,00" },
  { id: 203, type: "receita-variavel", name: "Projeto Landing Page", description: "Recebimento avulso do mes", value: "R$ 4.200,00" },
  { id: 204, type: "receita-variavel", name: "Bonus de Campanha", description: "Pagamento adicional por meta batida", value: "R$ 2.800,00" },
  { id: 205, type: "despesa-fixa", name: "Ferramentas SaaS", description: "Assinaturas mensais da operacao", value: "R$ 1.350,00" },
  { id: 206, type: "despesa-fixa", name: "Folha Operacional", description: "Equipe fixa e apoio mensal", value: "R$ 9.000,00" },
  { id: 207, type: "despesa-variavel", name: "Compra de Midia Extra", description: "Impulsionamento adicional do mes", value: "R$ 3.200,00" },
  { id: 208, type: "despesa-variavel", name: "Freelancer de Edicao", description: "Demanda extra de conteudo", value: "R$ 1.150,00" },
];

let adminActivities = [
  { id: 1, section: "Hoje", title: "Reuniao de Apresentacao", who: "Maria Santos - Tech Solutions", time: "14:00", text: "Cliente demonstrou interesse em consultoria cloud", icon: "calendar", color: "blue", status: "Concluida", statusClass: "done" },
  { id: 2, section: "Hoje", title: "Follow-up Telefonico", who: "Pedro Costa - Startup Inovadora", time: "16:30", text: "Confirmar recebimento da proposta", icon: "phone", color: "green", status: "Agendada", statusClass: "scheduled" },
  { id: 3, section: "Amanha", title: "Enviar Proposta Comercial", who: "Ana Oliveira - Corporation Inc", time: "10:00", text: "Incluir valores de customizacao", icon: "mail", color: "purple", status: "Pendente", statusClass: "pending", actions: ["Marcar como Concluida", "Reagendar"] },
];

const clientActivities = [
  { section: "Hoje", title: "Reuniao de Alinhamento", description: "Discussao sobre estrategias de marketing digital para o proximo trimestre", time: "14:00", owner: "Joao Silva", icon: "calendar", color: "blue", status: "Agendada", statusClass: "scheduled" },
  { section: "Amanha", title: "Follow-up Telefonico", description: "Acompanhamento dos resultados da ultima campanha", time: "10:00", owner: "Maria Costa", icon: "phone", color: "green", status: "Agendada", statusClass: "scheduled" },
  { section: "Quinta-Feira, 9 De Abril", title: "Relatorio Mensal Enviado", description: "Analise de performance das campanhas de marco", time: "16:00", owner: "Pedro Santos", icon: "mail", color: "purple", status: "Concluida", statusClass: "done" },
  { section: "Quarta-Feira, 15 De Abril", title: "Revisao de Conteudos", description: "Checklist de aprovacao da semana", time: "09:30", owner: "Maria Costa", icon: "checksquare", color: "blue", status: "Agendada", statusClass: "scheduled" },
];

const teamPerformance = [
  { initials: "JS", name: "Joao Silva", deals: "18 negocios fechados", revenue: "R$ 245.000", conversion: "24% conversao", progress: 98 },
  { initials: "MC", name: "Maria Costa", deals: "15 negocios fechados", revenue: "R$ 198.000", conversion: "22% conversao", progress: 90 },
  { initials: "PS", name: "Pedro Santos", deals: "12 negocios fechados", revenue: "R$ 165.000", conversion: "19% conversao", progress: 78 },
  { initials: "AF", name: "Ana Ferreira", deals: "10 negocios fechados", revenue: "R$ 142.000", conversion: "18% conversao", progress: 74 },
];

document.body.addEventListener("click", (event) => {
  const link = event.target.closest("[data-link]");
  if (link) {
    event.preventDefault();
    navigate(link.getAttribute("href"));
    return;
  }

  const logout = event.target.closest("[data-logout]");
  if (logout) {
    clearSession();
    navigate("/");
    notify("Sessao encerrada.");
    return;
  }

  const action = event.target.closest("[data-action]");
  if (action) {
    if (action.classList.contains("modal-backdrop") && event.target !== action) {
      return;
    }
    handleAction(action.dataset.action, action.dataset.value || "");
    return;
  }

  const tab = event.target.closest("[data-tab-group]");
  if (tab) {
    handleTab(tab.dataset.tabGroup, tab.dataset.tabValue);
    return;
  }

  const day = event.target.closest("[data-calendar-role][data-date]");
  if (day) {
    handleCalendarDay(day.dataset.calendarRole, day.dataset.date);
  }
});

document.body.addEventListener("input", (event) => {
  if (event.target.matches("[data-client-search]")) {
    state.ui.clientSearch = event.target.value;
    renderRoute();
  }
});

document.body.addEventListener("change", (event) => {
  if (event.target.matches("[data-client-plan-filter]")) {
    state.ui.clientPlanFilter = event.target.value;
    renderRoute();
  }
  if (event.target.matches("[data-calendar-filter]")) {
    handleCalendarFilter(event.target.dataset.calendarFilter, event.target.value);
  }
  if (event.target.matches("[data-report-filter]")) {
    handleReportFilter(event.target.dataset.reportFilter, event.target.value);
  }
});

window.addEventListener("popstate", renderRoute);

function navigate(path) {
  window.history.pushState({}, "", path);
  renderRoute();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderRoute() {
  if (!state.ready) {
    app.innerHTML = `<section class="screen"><div class="content"><div class="page-head"><h1>Carregando</h1><p>Preparando os dados do sistema...</p></div></div></section>`;
    return;
  }

  const path = window.location.pathname;

  if (path === "/admin/atividades") {
    navigate("/admin/financeiro");
    return;
  }
  if (path === "/admin/contatos") {
    navigate("/admin/clientes");
    return;
  }

  if (path === "/cliente/atividades") {
    navigate("/cliente/calendario");
    return;
  }

  if (path === "/") {
    app.innerHTML = `${renderRoleSelect()}${renderModal()}${renderHelpFab()}`;
    return;
  }

  if (path === "/login/admin" || path === "/login/cliente") {
    const role = path.endsWith("cliente") ? "cliente" : "admin";
    app.innerHTML = `${renderLogin(role)}${renderModal()}${renderHelpFab()}`;
    bindLoginForm(role);
    return;
  }

  if (path.startsWith("/admin")) {
    if (!requireRole("admin")) return;
    app.innerHTML = `${renderAdminRoute(path)}${renderModal()}${renderHelpFab()}`;
    bindModalForms();
    return;
  }

  if (path.startsWith("/cliente")) {
    if (!requireRole("cliente")) return;
    app.innerHTML = `${renderClientRoute(path)}${renderModal()}${renderHelpFab()}`;
    bindModalForms();
    return;
  }

  app.innerHTML = `${renderNotFound()}${renderModal()}${renderHelpFab()}`;
}

function requireRole(role) {
  if (!state.session || state.session.role !== role) {
    navigate("/");
    return false;
  }
  return true;
}

function renderRoleSelect() {
  return `
    <section class="screen login-screen">
      ${renderLoginBrand()}
      <section class="login-panel">
        <div class="login-box login-box-wide">
          <h2>Bem-vindo de volta</h2>
          <p>Selecione o tipo de acesso para continuar</p>
          <div class="role-list role-list-large">
            <a class="role-card role-card-large" data-link href="/login/admin">
              <span class="role-icon admin">${icon("building")}</span>
              <div class="role-card-copy"><strong>Administrador</strong><span>Acesso completo ao sistema</span></div>
              <span class="role-card-arrow">${icon("chevronRight")}</span>
            </a>
            <a class="role-card role-card-large" data-link href="/login/cliente">
              <span class="role-icon client">${icon("user")}</span>
              <div class="role-card-copy"><strong>Cliente</strong><span>Acompanhe suas atividades</span></div>
              <span class="role-card-arrow">${icon("chevronRight")}</span>
            </a>
          </div>
          <div class="login-security-pill">${icon("shield")}Ambiente seguro e criptografado</div>
        </div>
      </section>
    </section>
  `;
}

function renderLogin(role) {
  const isAdmin = role === "admin";
  const label = isAdmin ? "Acesso Administrativo" : "Acesso do Cliente";
  const subtitle = isAdmin ? "Gestão completa do sistema" : "Visualização de atividades";
  const heading = "Entre na sua conta";
  const kicker = isAdmin ? "Acesso administrativo" : "Acesso do cliente";
  const remembered = readRememberedLogin(role);
  return `
    <section class="screen login-screen">
      ${renderLoginBrand()}
      <section class="login-panel">
        <div class="login-box">
          <h2>${heading}</h2>
          <p>${kicker}</p>
          <a class="login-back" data-link href="/">${icon("arrowLeft")}Voltar para seleção</a>
          <div class="login-badge ${isAdmin ? "is-admin" : "is-client"}">
            <span class="role-icon ${isAdmin ? "admin" : "client"}">${icon(isAdmin ? "building" : "user")}</span>
            <div class="login-badge-copy">
              <strong>${label}</strong>
              <span>${subtitle}</span>
            </div>
          </div>
          <form class="form-stack" id="login-form">
            <div class="field">
              <label>Email</label>
              <input name="email" type="email" placeholder="seu@email.com" value="${escapeHtml(remembered.email || "")}" required />
            </div>
            <div class="field">
              <label>Senha</label>
              <div class="password-field">
                <input name="password" data-password-input type="password" placeholder="Digite sua senha" required />
                <button type="button" class="password-toggle" data-action="toggle-password" aria-label="Mostrar senha">${icon("eye")}</button>
              </div>
            </div>
            <div class="login-feedback" id="login-feedback" aria-live="polite"></div>
            <div class="row-between">
              <label class="checkbox-row"><input type="checkbox" name="remember" ${remembered.email ? "checked" : ""} /> Lembrar-me</label>
              <a href="#" class="link-blue" data-action="forgot-password" data-value="${role}">Esqueceu a senha?</a>
            </div>
            <button class="btn btn-primary login-submit-btn ${isAdmin ? "is-admin" : "is-client"}" type="submit" id="login-submit">${icon("login")}Entrar no sistema${icon("chevronRight")}</button>
          </form>
          <p class="login-terms">Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade</p>
        </div>
      </section>
    </section>
  `;
}

function bindLoginForm(role) {
  const form = document.querySelector("#login-form");
  if (!form) return;
  const submitButton = form.querySelector("#login-submit");
  const feedback = form.querySelector("#login-feedback");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    const remember = Boolean(formData.get("remember"));
    const setFeedback = (message = "", kind = "") => {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.className = `login-feedback${kind ? ` ${kind}` : ""}`;
    };
    const setSubmitting = (submitting) => {
      if (!submitButton) return;
      submitButton.disabled = submitting;
      submitButton.innerHTML = submitting ? `${icon("spinner")}Entrando...` : `${icon("login")}Entrar`;
    };

    setFeedback();
    setSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback(payload.error || "Email ou senha invalidos.", "is-error");
        return;
      }

      const redirect = role === "admin" ? "/admin/dashboard" : "/cliente/calendario";
      state.session = {
        id: payload.id,
        role,
        email: payload.email,
        token: payload.token || "",
        redirect,
        initials: getInitials(payload.nome || payload.email || ""),
        name: payload.nome || (role === "admin" ? "Administrador" : "Cliente"),
        subtitle: payload.email,
        tipo: payload.tipo,
        telefone: payload.telefone || "",
      };
      writeSession(state.session);
      remember ? writeRememberedLogin(role, email) : clearRememberedLogin(role);
      setFeedback("Login realizado com sucesso. Redirecionando...", "is-success");
      window.location.assign(redirect);
    } catch {
      setFeedback("Não foi possível conectar. Verifique o servidor e tente novamente.", "is-error");
    } finally {
      setSubmitting(false);
    }
  });
}

function renderAdminRoute(path) {
  let content = "";
  if (path === "/admin/dashboard") content = renderAdminDashboard();
  else if (path === "/admin/financeiro") content = renderFinancePage();
  else if (path === "/admin/clientes") content = renderClients();
  else if (path === "/admin/calendario") content = renderAdminCalendar();
  else if (path === "/admin/relatorios") content = renderReports("admin");
  else if (path === "/admin/ajustes") content = renderSettings();
  else content = renderNotFoundInner();
  return renderShell("admin", content, "/assets/icon-white-custom.png", "FOKAL", "Admin");
}

function renderClientRoute(path) {
  let content = "";
  if (path === "/cliente" || path === "/cliente/calendario") content = renderClientCalendar();
  else if (path === "/cliente/relatorios") content = renderReports("cliente");
  else content = renderNotFoundInner();
  return renderShell("cliente", content, "/assets/icon-white-custom.png", "FOKAL", "Portal do Cliente");
}

function renderShell(role, content, logo, title, subtitle) {
  const menu = role === "admin" ? adminMenu : clientMenu;
  const activePath = window.location.pathname;
  const fallbackUser = {
    id: 0,
    email: "",
    initials: role === "admin" ? "AD" : "CL",
    name: role === "admin" ? "Administrador" : "Cliente",
    subtitle: "",
    tipo: role === "admin" ? "Administrador" : "Cliente",
  };
  const user = state.session && state.session.role === role ? state.session : fallbackUser;
  return `
    <section class="screen app-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          ${logo ? `<img src="${logo}" alt="Fokal" />` : `<span class="sidebar-brand-fallback">${icon("grid")}</span>`}
        </div>
        <nav class="sidebar-nav">
          ${menu
            .map((item) => `<a class="nav-item ${activePath === item.href ? "active" : ""}" data-link href="${item.href}">${icon(item.icon)}<span>${item.label}</span></a>`)
            .join("")}
        </nav>
        ${role === "cliente" ? renderSupportPanel() : ""}
        <div class="sidebar-bottom">
          <div class="user-card">
            <span class="avatar-circle sidebar-user-avatar"><img src="/assets/icon-blue.png" alt="Fokal" /></span>
            <div><strong>${user.name}</strong><span>${user.subtitle}</span></div>
          </div>
          ${role === "admin"
            ? `<button class="btn btn-outline btn-small profile-action-btn" data-action="new-user">${icon("plus")}Adicionar usuário</button>`
            : ""}
          <button class="logout-link" data-logout="true">${icon("logout")}Sair</button>
        </div>
      </aside>
      <section class="content">${content}</section>
    </section>
  `;
}

function renderAdminDashboard() {
  const finance = getFinanceSummary();
  const planSummary = getPlanSummary();
  const dashboardStats = [
    { icon: "users", value: String(planSummary.total), label: "Total de Clientes", trend: `${planSummary.total} cadastrados`, dir: "up" },
    { icon: "edit", value: String(planSummary.content), label: "Produção de Conteúdo", trend: `${planSummary.contentShare}% da base`, dir: "up" },
    { icon: "target", value: String(planSummary.traffic), label: "Gestão de Tráfego", trend: `${planSummary.trafficShare}% da base`, dir: "up" },
    { icon: "pulse", value: String(planSummary.both), label: "Ambos os Planos", trend: `${planSummary.bothShare}% da base`, dir: "up" },
  ];
  return `
      <div class="page-head">
        <h1>Dashboard</h1>
        <p>Visão geral da carteira de clientes por tipo de plano</p>
      </div>
      <section class="metrics-row">
        ${dashboardStats.map((item) => renderMetricCard(item)).join("")}
      </section>
    <section class="split-grid">
      <article class="panel">
        <h3>Lucro Mensal</h3>
        <div class="chart-box">${dashboardRevenueChart()}</div>
      </article>
    </section>
      <section class="bottom-grid dashboard-bottom-grid">
        <article class="panel">
          <h3>Resumo Financeiro</h3>
          <div class="recent-list">
            ${[
              ["Entradas", finance.totalEntradasLabel, "#2563eb"],
              ["Despesas", finance.totalDespesasLabel, "#ef4444"],
              ["Saldo Final", finance.saldoLabel, finance.saldo >= 0 ? "#22c55e" : "#ef4444"],
              ["Margem do Mes", finance.margemLabel, "#171a20"],
            ]
              .map(([name, desc, color]) => `<div class="recent-item"><span class="dot" style="background:${color}"></span><div><strong>${name}</strong><small>${desc}</small></div><span></span></div>`)
              .join("")}
          </div>
        </article>
      </section>
    `;
}

function renderClients() {
  const normalizedSearch = state.ui.clientSearch.trim().toLowerCase();
  const filteredClients = getClientUsers().filter((client) => {
    const matchesPlan =
      state.ui.clientPlanFilter === "Todos" ||
      normalizePlanType(client.planType) === state.ui.clientPlanFilter;
    const haystack = `${client.nome} ${client.email} ${client.telefone}`.toLowerCase();
    const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
    return matchesPlan && matchesSearch;
  });

  return `
    <div class="page-head-row">
      <div class="page-head">
        <h1>Clientes</h1>
        <p>Gerencie contas de acesso, perfil e plano de cada cliente.</p>
      </div>
      <button class="btn btn-primary" data-action="new-client">${icon("plus")}Novo Cliente</button>
    </div>
    <div class="search-row">
      <label class="search-box">${icon("search")}<input data-client-search type="text" placeholder="Buscar por nome, email ou telefone..." value="${escapeHtml(state.ui.clientSearch)}" /></label>
      <button class="filter-box" data-action="toggle-filter">${icon("filter")}</button>
      <label class="filter-box filter-select">
        <select data-client-plan-filter>
          ${["Todos", ...planOptions]
            .map((option) => `<option value="${option}" ${state.ui.clientPlanFilter === option ? "selected" : ""}>${option}</option>`)
            .join("")}
        </select>
        ${icon("chevronDown")}
      </label>
    </div>
    <section class="contacts-grid">${filteredClients.map(renderClientCard).join("") || `<article class="panel"><p>Nenhum cliente encontrado para esse filtro.</p></article>`}</section>
  `;
}

function renderFinancePage() {
  const sections = [
    { type: "receita-fixa", title: "Receitas fixas", description: "Rendas fixas mensais e contratos recorrentes." },
    { type: "receita-variavel", title: "Receitas variáveis", description: "Entradas extras, avulsas e pagamentos recebidos." },
    { type: "despesa-fixa", title: "Despesas fixas", description: "Assinaturas, contas recorrentes e custos mensais." },
    { type: "despesa-variavel", title: "Despesas variáveis", description: "Compras do mês, parcelas e gastos inesperados." },
  ];
  const summary = getFinanceSummary();

  return `
    <div class="page-head-row">
      <div class="page-head">
        <h1>Financeiro</h1>
        <p>Controle entradas, saídas e saldo final do mês em um só lugar</p>
      </div>
      <button class="btn btn-primary" data-action="new-finance-item">${icon("plus")}Novo lançamento</button>
    </div>
    <section class="panel finance-overview">
      <div class="finance-overview-head">
        <div>
          <h3>Resumo financeiro</h3>
          <p>Cálculo automático com base em todos os lançamentos cadastrados</p>
        </div>
      </div>
      <div class="finance-overview-grid">
        <div class="finance-overview-card">
          <span>Entradas</span>
          <strong>${summary.totalEntradasLabel}</strong>
          <small>${summary.receitasFixasLabel} fixas + ${summary.receitasVariaveisLabel} variáveis</small>
        </div>
        <div class="finance-overview-card">
          <span>Despesas</span>
          <strong>${summary.totalDespesasLabel}</strong>
          <small>${summary.despesasFixasLabel} fixas + ${summary.despesasVariaveisLabel} variáveis</small>
        </div>
        <div class="finance-overview-card">
          <span>Saldo final</span>
          <strong>${summary.saldoLabel}</strong>
          <small>${summary.saldo >= 0 ? "Resultado positivo no mês" : "Resultado negativo no mês"}</small>
        </div>
        <div class="finance-overview-card">
          <span>Margem</span>
          <strong>${summary.margemLabel}</strong>
          <small>${summary.margemPercentual}% das entradas restantes</small>
        </div>
      </div>
    </section>
    <section class="finance-sections">
      ${sections.map((section) => renderFinanceSection(section)).join("")}
    </section>
  `;
}

function renderFinanceSection(section) {
  const items = financeItems.filter((item) => item.type === section.type);
  const total = formatCurrencyFromNumber(items.reduce((sum, item) => sum + parseCurrency(item.value), 0));
  const toneClass = section.type.startsWith("receita") ? "finance-tone-income" : "finance-tone-expense";
  return `
    <article class="panel finance-section ${toneClass}">
      <div class="finance-section-head">
        <div>
          <h3>${section.title}</h3>
          <p>${section.description}</p>
        </div>
        <div class="finance-section-actions">
          <strong>${total}</strong>
          <button class="btn btn-outline btn-small" data-action="new-finance-item" data-value="${section.type}">${icon("plus")}Adicionar</button>
        </div>
      </div>
      <div class="finance-items">
        ${items.length ? items.map(renderFinanceItemCard).join("") : `<div class="finance-empty">Nenhum lançamento cadastrado nesta seção.</div>`}
      </div>
    </article>
  `;
}

function renderFinanceItemCard(item) {
  const toneClass = item.type.startsWith("receita") ? "finance-item-income" : "finance-item-expense";
  return `
    <article class="finance-item-card ${toneClass}">
      <div class="finance-item-copy">
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(formatFinanceDate(item.date))}</small>
        <p>${escapeHtml(item.description)}</p>
      </div>
      <div class="finance-item-side">
        <span>${escapeHtml(item.value)}</span>
        <div class="finance-item-actions">
          <button class="icon-action" data-action="edit-finance-item" data-value="${item.id}">${icon("edit")}</button>
          <button class="icon-action" data-action="delete-finance-item" data-value="${item.id}">${icon("trash")}</button>
        </div>
      </div>
    </article>
  `;
}

function renderPipeline() {
  const columns = getPipelineColumns();
  const selectedDeal = getSelectedDeal();
  const totalValue = formatCurrencyFromDeals(deals);
  return `
    <div class="page-head-row">
      <div class="page-head">
        <h1>Pipeline de Vendas</h1>
        <p>Acompanhe seus negocios em cada estagio</p>
      </div>
      <button class="btn btn-primary" data-action="new-deal">${icon("plus")}Novo Negocio</button>
    </div>
    <div class="stat-row pipeline-stats">
      <div class="stat-box"><span>Valor Total do Pipeline</span><strong>${totalValue}</strong></div>
      <div class="stat-box"><span>Total de Negocios</span><strong>${deals.length}</strong></div>
      <div class="stat-box"><span>Etapa Atual</span><strong>${selectedDeal ? selectedDeal.stage : "Nenhuma"}</strong></div>
    </div>
    <section class="pipeline-layout">
      <div class="pipeline-board">
        <div class="pipeline-columns">
          ${columns
            .map(
              (column) => `
                <article class="pipeline-column">
                  <div class="pipeline-column-header ${column.color}">
                    <div class="column-top"><strong>${column.name}</strong><span class="badge-count">${column.count}</span></div>
                    <span>${column.total}</span>
                  </div>
                  <div class="pipeline-stack">${column.deals.length ? column.deals.map((deal) => renderDealCard(deal)).join("") : `<div class="pipeline-empty">Sem negocios nesta etapa.</div>`}</div>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
      ${renderPipelineDetail(selectedDeal)}
    </section>
  `;
}

function renderAdminActivities() {
  const sections = groupBySection(adminActivities);
  const activeTab = state.ui.adminActivityTab;
  const filteredSections = filterActivitySections(sections, activeTab);
  return `
      <div class="page-head-row">
        <div class="page-head">
          <h1>Atividades</h1>
          <p>Gerencie suas tarefas e compromissos</p>
        </div>
        <button class="btn btn-primary" data-action="new-activity">${icon("plus")}Nova Atividade</button>
      </div>
    <div class="tabs">
      ${renderTabs("admin-activities", ["Todas", "Pendentes", "Agendadas", "Concluidas"], activeTab)}
    </div>
    ${Object.entries(filteredSections)
      .map(([section, items]) => `<h3 class="section-label">${section}</h3><div class="activity-stack">${items.map(renderAdminActivityCard).join("")}</div>`)
      .join("")}
  `;
}

function renderAdminCalendar() {
  const visibleMonth = parseIsoDate(state.ui.adminVisibleMonth);
  const selectedDate = state.ui.adminSelectedDate;
  const clients = getClientUsers();
  const filteredTasks = getTasksForCalendar("admin");
  const dayTasks = getTasksForDate(filteredTasks, selectedDate);
  const years = buildYearOptions(filteredTasks);
  return `
    <div class="page-head-row">
      <div class="page-head">
        <h1>Calendário</h1>
        <p>Gerencie tarefas por cliente com navegação dinâmica por mês e ano</p>
      </div>
      <div class="calendar-toolbar">
        <label class="filter-box filter-select calendar-filter">
          <select data-calendar-filter="admin-client">
            <option value="all">Todos os clientes</option>
            ${clients.map((client) => `<option value="${client.id}" ${String(state.ui.adminClientFilter) === String(client.id) ? "selected" : ""}>${escapeHtml(client.nome)}</option>`).join("")}
          </select>
          ${icon("chevronDown")}
        </label>
      </div>
    </div>
    <section class="calendar-layout">
      <article class="calendar-panel">
        <div class="calendar-head">
          <div class="calendar-nav">
            <button class="btn btn-outline btn-small" data-action="calendar-prev" data-value="admin">${icon("chevronLeft")}Mês anterior</button>
            <div class="month-title">${formatMonthYear(visibleMonth)}</div>
            <button class="btn btn-outline btn-small" data-action="calendar-next" data-value="admin">Próximo mês${icon("chevronRight")}</button>
          </div>
          <div class="calendar-selectors">
            <label class="filter-box filter-select calendar-filter">
              <select data-calendar-filter="admin-month">
                ${monthOptions().map((month, index) => `<option value="${index}" ${visibleMonth.getMonth() === index ? "selected" : ""}>${month}</option>`).join("")}
              </select>
              ${icon("chevronDown")}
            </label>
            <label class="filter-box filter-select calendar-filter">
              <select data-calendar-filter="admin-year">
                ${years.map((year) => `<option value="${year}" ${visibleMonth.getFullYear() === year ? "selected" : ""}>${year}</option>`).join("")}
              </select>
              ${icon("chevronDown")}
            </label>
          </div>
        </div>
        ${renderCalendarGrid("admin", visibleMonth, filteredTasks, selectedDate)}
        <div class="calendar-legend">
          <span class="legend-chip"><span class="dot" style="background:#2563eb"></span>Reunião</span>
          <span class="legend-chip"><span class="dot" style="background:#22c55e"></span>Ligação</span>
          <span class="legend-chip"><span class="dot" style="background:#a855f7"></span>Tarefa</span>
          <span class="legend-chip"><span class="dot" style="background:#ef4444"></span>Prazo</span>
        </div>
      </article>
      <article class="calendar-panel">
        <div class="side-date">
          <h2>${formatFullDate(selectedDate)}</h2>
          <button class="round-plus" data-action="new-calendar-event" data-value="admin">+</button>
        </div>
        <div class="day-summary">${dayTasks.length} tarefa(s) neste dia</div>
        <div class="event-stack">
          ${dayTasks.length
            ? dayTasks
            .map(
              (event) => `
                <article class="event-card ${taskToneClass(event.type)}">
                  <div class="row-between">
                    <div>
                      <span class="event-type-badge ${taskToneClass(event.type)}">${capitalize(event.type)}</span>
                      <h4>${event.title}</h4>
                    </div>
                    ${event.id ? `<div class="event-actions"><button data-action="edit-admin-event" data-value="${event.id}">${icon("edit")}</button><button data-action="delete-admin-event" data-value="${event.id}">${icon("trash")}</button></div>` : ""}
                  </div>
                  <div class="calendar-event-meta">${icon("clock")}${event.time}</div>
                  ${event.clientName ? `<div class="calendar-event-meta">${icon("user")}${escapeHtml(event.clientName)}</div>` : ""}
                  ${event.isRecurring ? `<div class="calendar-event-meta">${icon("calendar")}${escapeHtml(event.recurrenceLabel || "Recorrente")}</div>` : ""}
                  ${event.description ? `<div class="calendar-event-meta">${icon("message")}${event.description}</div>` : ""}
                </article>
              `,
            )
            .join("")
            : `<div class="empty-notice">Nenhum compromisso agendado</div>`}
        </div>
      </article>
    </section>
  `;
}

function renderReports(role = "admin") {
  const isAdmin = role === "admin";
  const clients = getClientUsers();
  const contentFilter = getContentReportFilter(role);
  const trafficFilter = getTrafficReportFilter(role);
  const filteredContents = getFilteredContentItems(role);
  const filteredCampaigns = getFilteredCampaigns(role);
  const contentMetrics = buildContentMetrics(filteredContents);
  const trafficMetrics = buildTrafficMetrics(filteredCampaigns);
  const months = buildReportMonthOptions();
  const years = buildReportYearOptions();

  return `
    <div class="page-head-row">
      <div class="page-head">
        <h1>Relatórios</h1>
        <p>${isAdmin ? "Acompanhe a operação de conteúdo e tráfego por cliente." : "Visualize somente os seus indicadores de conteúdo e tráfego."}</p>
      </div>
      <div class="reports-head-actions">
        ${isAdmin ? `<button class="btn btn-outline" data-action="new-content">${icon("plus")}Novo conteúdo</button>` : ""}
        ${isAdmin ? `<button class="btn btn-primary" data-action="new-campaign">${icon("plus")}Nova campanha</button>` : ""}
      </div>
    </div>
    <section class="reports-stack">
      <article class="panel report-section">
        <div class="report-section-head">
          <div>
            <span class="section-kicker">Conteúdo</span>
            <h3>Relatório de produção de conteúdo</h3>
            <p>Quantidade produzida, status de publicação, distribuição por cliente e por tipo.</p>
          </div>
          <div class="report-filters">
            ${renderReportFilterSelect("reports-client", contentFilter.clientId, clients, role)}
            ${renderMonthFilterSelect("reports-month", contentFilter.month, months)}
            ${renderYearFilterSelect("reports-year", contentFilter.year, years)}
          </div>
        </div>
        <section class="metrics-row reports">
          ${[
            { icon: "chart", value: String(contentMetrics.total), label: "Conteúdos no período" },
            { icon: "checksquare", value: String(contentMetrics.published), label: "Publicados" },
            { icon: "clock", value: String(contentMetrics.pending), label: "Pendentes" },
            { icon: "users", value: String(contentMetrics.uniqueClients), label: "Clientes atendidos" },
          ].map(renderMetricCardSimple).join("")}
        </section>
        ${renderContentTable(filteredContents, role)}
      </article>

      <article class="panel report-section">
        <div class="report-section-head">
          <div>
            <span class="section-kicker">Tráfego pago</span>
            <h3>Relatório de gestão de tráfego</h3>
            <p>Controle de campanhas, investimento e resultados por cliente e período.</p>
          </div>
          <div class="report-filters">
            ${renderReportFilterSelect("traffic-client", trafficFilter.clientId, clients, role)}
            ${renderMonthFilterSelect("traffic-month", trafficFilter.month, months)}
            ${renderYearFilterSelect("traffic-year", trafficFilter.year, years)}
          </div>
        </div>
        <section class="metrics-row reports">
          ${[
            { icon: "money", value: formatCurrency(trafficMetrics.budget), label: "Orçamento" },
            { icon: "target", value: String(trafficMetrics.clicks), label: "Cliques" },
            { icon: "mail", value: String(trafficMetrics.impressions), label: "Impressoes" },
            { icon: "trendUp", value: String(trafficMetrics.conversions), label: "Conversoes" },
            { icon: "chart", value: formatCurrency(trafficMetrics.avgCostPerResult), label: "Custo por resultado" },
          ].map(renderMetricCardSimple).join("")}
        </section>
        <div class="reports-grid report-grid-1 report-summary-grid">
          <article class="report-summary-card">
            <h3>Resumo por campanha</h3>
            <div class="report-summary-list">
              ${renderCampaignSummaries(filteredCampaigns)}
            </div>
          </article>
        </div>
        <article class="report-summary-card campaign-chart-card">
          <div class="report-table-head">
            <h3>Grafico por campanha</h3>
            <span>${filteredCampaigns.length} campanha(s)</span>
          </div>
          ${renderCampaignPerformanceChart(filteredCampaigns)}
        </article>
        ${renderCampaignTable(filteredCampaigns, role)}
      </article>
    </section>
  `;
}

function renderSettings() {
  return `
    <div class="page-head">
      <h1>Ajustes</h1>
      <p>Centralize configuracoes importantes da plataforma, acessos e preferencias gerais.</p>
    </div>
    <section class="reports-grid">
      <article class="panel">
        <h3>Conta e Acesso</h3>
        <div class="recent-list">
          <div class="recent-item"><span class="dot" style="background:#2563eb"></span><div><strong>Usuários</strong><small>Cadastre administradores e clientes com perfis distintos.</small></div></div>
          <div class="recent-item"><span class="dot" style="background:#10b981"></span><div><strong>Sessão</strong><small>Mantenha acessos organizados e revise quem tem permissão no sistema.</small></div></div>
        </div>
      </article>
      <article class="panel">
        <h3>Operação</h3>
        <div class="recent-list">
          <div class="recent-item"><span class="dot" style="background:#f59e0b"></span><div><strong>Calendário</strong><small>Revise atribuições entre tarefas e clientes antes de publicar demandas.</small></div></div>
          <div class="recent-item"><span class="dot" style="background:#a855f7"></span><div><strong>Integrações</strong><small>Use esta área como base para futuras configurações do Supabase e automações.</small></div></div>
        </div>
      </article>
    </section>
  `;
}

function renderClientActivities() {
  const sections = groupBySection(clientActivities);
  const activeTab = state.ui.clientActivityTab;
  const filteredSections = filterActivitySections(sections, activeTab);
  return `
    <div class="page-head client-page-head">
      <h1>Minhas Atividades</h1>
      <p>Acompanhe suas interações com a FOKAL</p>
    </div>
    <div class="tabs">
      ${renderTabs("client-activities", ["Todas", "Agendadas", "Concluídas"], activeTab)}
    </div>
    ${Object.entries(filteredSections)
      .map(([section, items]) => `<h3 class="section-label">${section}</h3><div class="activity-stack">${items.map(renderClientActivityCard).join("")}</div>`)
      .join("")}
  `;
}

function renderClientCalendar() {
  const visibleMonth = parseIsoDate(state.ui.clientVisibleMonth);
  const selectedDate = state.ui.clientSelectedDate;
  const visibleTasks = getTasksForCalendar("cliente");
  const dayTasks = getTasksForDate(visibleTasks, selectedDate);
  const years = buildYearOptions(visibleTasks);
  return `
    <div class="page-head">
      <h1>Calendário</h1>
      <p>Acompanhe apenas as suas tarefas e compromissos</p>
    </div>
    <section class="client-calendar-layout">
      <article class="calendar-panel">
        <div class="calendar-head">
          <div class="calendar-nav">
            <button class="btn btn-outline btn-small" data-action="calendar-prev" data-value="cliente">${icon("chevronLeft")}Mês anterior</button>
            <div class="month-title">${formatMonthYear(visibleMonth)}</div>
            <button class="btn btn-outline btn-small" data-action="calendar-next" data-value="cliente">Próximo mês${icon("chevronRight")}</button>
          </div>
          <div class="calendar-selectors">
            <label class="filter-box filter-select calendar-filter">
              <select data-calendar-filter="client-month">
                ${monthOptions().map((month, index) => `<option value="${index}" ${visibleMonth.getMonth() === index ? "selected" : ""}>${month}</option>`).join("")}
              </select>
              ${icon("chevronDown")}
            </label>
            <label class="filter-box filter-select calendar-filter">
              <select data-calendar-filter="client-year">
                ${years.map((year) => `<option value="${year}" ${visibleMonth.getFullYear() === year ? "selected" : ""}>${year}</option>`).join("")}
              </select>
              ${icon("chevronDown")}
            </label>
          </div>
        </div>
        ${renderCalendarGrid("cliente", visibleMonth, visibleTasks, selectedDate)}
        <div class="calendar-legend">
          <span class="legend-chip"><span class="dot" style="background:#2563eb"></span>Reunião</span>
          <span class="legend-chip"><span class="dot" style="background:#22c55e"></span>Ligação</span>
          <span class="legend-chip"><span class="dot" style="background:#a855f7"></span>Tarefa</span>
          <span class="legend-chip"><span class="dot" style="background:#ef4444"></span>Prazo</span>
        </div>
      </article>
      <article class="calendar-panel">
        <div class="side-date">
          <h2>${formatFullDate(selectedDate)}</h2>
        </div>
        <div class="day-summary">${dayTasks.length} tarefa(s) neste dia</div>
        ${dayTasks.length
          ? `<div class="event-stack">${dayTasks
              .map(
                (event) => `
                  <article class="event-card ${taskToneClass(event.type)}">
                    <div class="row-between">
                      <div>
                        <span class="event-type-badge ${taskToneClass(event.type)}">${capitalize(event.type)}</span>
                        <h4>${event.title}</h4>
                      </div>
                    </div>
                    <div class="calendar-event-meta">${icon("clock")}${event.time}</div>
                    ${event.isRecurring ? `<div class="calendar-event-meta">${icon("calendar")}${escapeHtml(event.recurrenceLabel || "Recorrente")}</div>` : ""}
                    ${event.description ? `<div class="calendar-event-meta">${icon("message")}${event.description}</div>` : ""}
                  </article>
                `,
              )
              .join("")}</div>`
          : `<div class="empty-notice">Nenhum compromisso agendado</div>`}
      </article>
    </section>
  `;
}

function renderClientCard(client) {
  return `
    <article class="contact-card">
      <div class="contact-head">
        <span class="avatar-circle large blue">${getInitials(client.nome)}</span>
        <div class="contact-head-actions">
          ${client.id ? `<button class="icon-action" data-action="edit-client" data-value="${client.id}">${icon("edit")}</button><button class="icon-action" data-action="delete-client" data-value="${client.id}">${icon("trash")}</button>` : ""}
        </div>
      </div>
      <h3>${client.nome}</h3>
      <p class="contact-role">${client.tipo}</p>
      <div class="contact-info">
        <div class="contact-line">${icon("mail")} ${client.email}</div>
        <div class="contact-line">${icon("phone")} ${client.telefone || "-"}</div>
      </div>
      <div class="contact-footer"><span>Perfil de Acesso</span><strong>${client.tipo}</strong></div>
      <div class="contact-footer"><span>Tipo de Plano</span><strong>${normalizePlanType(client.planType)}</strong></div>
    </article>
  `;
}

function renderDealCard(deal) {
  return `
    <article class="deal-card ${state.ui.selectedDealId === deal.id ? "is-selected" : ""}" data-action="select-deal" data-value="${deal.id}">
      <h4>${escapeHtml(deal.title)}</h4>
      <div class="deal-meta">${icon("money")}${escapeHtml(deal.value)}</div>
      <div class="deal-meta">${icon("building")}${escapeHtml(deal.company)}</div>
      <div class="deal-meta">${icon("user")}${escapeHtml(deal.contact || deal.owner || "-")}</div>
      <div class="deal-meta">${icon("calendar")}${escapeHtml(deal.date || "-")}</div>
    </article>
  `;
}

function renderPipelineDetail(deal) {
  if (!deal) {
    return `
      <aside class="panel pipeline-detail">
        <div class="pipeline-detail-empty">
          <h3>Selecione um negocio</h3>
          <p>Clique em um card do pipeline para abrir detalhes, editar dados e mudar a etapa.</p>
        </div>
      </aside>
    `;
  }

  return `
    <aside class="panel pipeline-detail">
      <div class="pipeline-detail-head">
        <div>
          <span class="detail-kicker">${escapeHtml(deal.stage)}</span>
          <h3>${escapeHtml(deal.title)}</h3>
          <p>${escapeHtml(deal.company)}</p>
        </div>
        <div class="pipeline-detail-actions">
          <button class="icon-action" data-action="edit-deal" data-value="${deal.id}">${icon("edit")}</button>
          <button class="icon-action" data-action="delete-deal" data-value="${deal.id}">${icon("trash")}</button>
        </div>
      </div>
      <div class="pipeline-detail-grid">
        <div class="detail-block"><span>Valor</span><strong>${escapeHtml(deal.value)}</strong></div>
        <div class="detail-block"><span>Contato</span><strong>${escapeHtml(deal.contact || "-")}</strong></div>
        <div class="detail-block"><span>Responsavel</span><strong>${escapeHtml(deal.owner || "-")}</strong></div>
        <div class="detail-block"><span>Proxima acao</span><strong>${escapeHtml(deal.nextAction || "-")}</strong></div>
      </div>
      <div class="detail-section">
        <span class="detail-label">Status atual</span>
        <p>${escapeHtml(deal.status || "Sem status definido.")}</p>
      </div>
      <div class="detail-section">
        <span class="detail-label">Descricao</span>
        <p>${escapeHtml(deal.description || "Sem descricao cadastrada.")}</p>
      </div>
      <div class="detail-section">
        <span class="detail-label">Mover etapa</span>
        <div class="stage-pill-row">
          ${pipelineStages
            .map(
              (stage) => `<button class="stage-pill ${deal.stage === stage.name ? "active" : ""}" data-action="move-deal-stage" data-value="${deal.id}|${stage.name}">${stage.name}</button>`,
            )
            .join("")}
        </div>
      </div>
      <div class="pipeline-quick-actions">
        <button class="btn btn-outline btn-small" data-action="move-deal-direction" data-value="${deal.id}|back" ${getDealStageIndex(deal.stage) === 0 ? "disabled" : ""}>${icon("chevronLeft")}Etapa anterior</button>
        <button class="btn btn-primary btn-small" data-action="move-deal-direction" data-value="${deal.id}|forward" ${getDealStageIndex(deal.stage) === pipelineStages.length - 1 ? "disabled" : ""}>Avancar etapa${icon("chevronRight")}</button>
      </div>
    </aside>
  `;
}

function renderAdminActivityCard(item) {
  return `
    <article class="activity-card">
      <span class="timeline-icon ${item.color}">${icon(item.icon)}</span>
      <div class="activity-content">
        <div class="row-between">
          <div>
            <h3>${item.title}</h3>
            <p>${item.who}</p>
          </div>
          <span class="status-pill ${activityStatusClass(item.statusClass)}">${item.status}</span>
        </div>
        <div class="activity-meta">${icon("clock")}${item.time}</div>
        <p>${item.text}</p>
        ${item.actions ? `<div class="activity-actions">${item.actions.map((label, index) => `<button class="btn ${index === 0 ? "btn-primary" : "btn-outline"} btn-small">${label}</button>`).join("")}</div>` : ""}
      </div>
    </article>
  `;
}

function renderClientActivityCard(item) {
  return `
    <article class="activity-card">
      <span class="timeline-icon ${item.color}">${icon(item.icon)}</span>
      <div class="activity-content">
        <div class="row-between">
          <div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </div>
          <span class="status-pill ${activityStatusClass(item.statusClass)}">${item.status}</span>
        </div>
        <div class="activity-meta">${icon("clock")}${item.time}<strong>Responsavel:</strong>${item.owner}</div>
      </div>
    </article>
  `;
}

function renderMetricCard(item) {
  return `
    <article class="metric-card">
      <div class="metric-top">
        <span class="metric-icon blue">${icon(item.icon)}</span>
        <span class="trend ${item.dir}">${item.dir === "up" ? icon("trendUp") : icon("trendDown")}${item.trend}</span>
      </div>
      <p class="metric-value">${item.value}</p>
      <p class="metric-label">${item.label}</p>
    </article>
  `;
}

function renderSupportPanel() {
  return `
    <div class="support-panel">
      <strong>${icon("message")}Precisa de ajuda?</strong>
      <p>Entre em contato com nosso time</p>
      <button class="btn btn-primary btn-small">Falar com Suporte</button>
    </div>
  `;
}

function renderCalendarGrid(mode, visibleMonth, tasks, selectedDate) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  const cells = getCalendarCells(visibleMonth);
  return `
    <div class="calendar-grid-wrap">
      ${days.map((day) => `<div class="weekday">${day}</div>`).join("")}
      ${cells
        .map((cell) => {
          if (!cell.inMonth) return `<div class="day-cell is-muted" aria-hidden="true"></div>`;
          const isoDate = toIsoDate(cell.date);
          const dots = getCalendarDots(tasks, isoDate);
          const taskCount = getTasksForDate(tasks, isoDate).length;
          const classes = [
            "day-cell",
            isSameDateIso(isoDate, selectedDate) ? "active" : "",
            isoDate === getTodayIso() ? "highlight" : "",
          ].filter(Boolean).join(" ");
          return `
            <button class="${classes}" data-calendar-role="${mode}" data-date="${isoDate}">
              <div>${cell.date.getDate()}</div>
              ${taskCount ? `<span class="day-count">${taskCount}</span>` : ""}
              ${dots.length ? `<div class="day-dots">${dots.map((color) => `<span class="day-dot" style="background:${color}"></span>`).join("")}</div>` : ""}
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderTeamCard(member) {
  return `
    <article class="team-card">
      <div class="team-head">
        <div class="team-head-left">
          <span class="team-avatar">${member.initials}</span>
          <div class="team-meta"><strong>${member.name}</strong><span>${member.deals}</span></div>
        </div>
        <div class="team-side"><strong>${member.revenue}</strong>${member.conversion}</div>
      </div>
      <div class="team-progress"><div class="team-progress-bar" style="width:${member.progress}%"></div></div>
    </article>
  `;
}

function renderLoginBrand() {
  return `
    <section class="login-brand">
      <div class="login-brand-top">
        <div class="login-brand-chip">
          <img class="login-brand-logo" src="/assets/icon-white-custom.png?v=2" alt="Fokal" />
        </div>
      </div>
      <div class="login-brand-main">
        <h1>Gerencie seus relacionamentos com eficiência</h1>
        <p>Sistema completo de CRM para gestão de contatos, pipeline de vendas e acompanhamento de atividades.</p>
        <ul class="login-brand-list">
          <li>Dashboard interativo com métricas em tempo real</li>
          <li>Gestão completa de contatos e oportunidades</li>
          <li>Calendário integrado e timeline de atividades</li>
          <li>Relatórios detalhados para análise de performance</li>
        </ul>
      </div>
      <div class="login-brand-footer">© 2026 FOKAL Company. Todos os direitos reservados.</div>
    </section>
  `;
}

function renderHelpFab() {
  return `<button class="help-fab" type="button">?</button>`;
}

// Re-declared below to keep login copy stable even if the source file encoding changes.
function renderLogin(role) {
  const isAdmin = role === "admin";
  const label = isAdmin ? "Acesso Administrativo" : "Acesso do Cliente";
  const subtitle = isAdmin ? "Gest\u00E3o completa do sistema" : "Visualiza\u00E7\u00E3o de atividades";
  const heading = "Entre na sua conta";
  const kicker = isAdmin ? "Acesso administrativo" : "Acesso do cliente";
  const remembered = readRememberedLogin(role);
  return `
    <section class="screen login-screen">
      ${renderLoginBrand()}
      <section class="login-panel">
        <div class="login-box">
          <h2>${heading}</h2>
          <p>${kicker}</p>
          <a class="login-back" data-link href="/">${icon("arrowLeft")}Voltar para sele\u00E7\u00E3o</a>
          <div class="login-badge ${isAdmin ? "is-admin" : "is-client"}">
            <span class="role-icon ${isAdmin ? "admin" : "client"}">${icon(isAdmin ? "building" : "user")}</span>
            <div class="login-badge-copy">
              <strong>${label}</strong>
              <span>${subtitle}</span>
            </div>
          </div>
          <form class="form-stack" id="login-form">
            <div class="field">
              <label>Email</label>
              <input name="email" type="email" placeholder="seu@email.com" value="${escapeHtml(remembered.email || "")}" required />
            </div>
            <div class="field">
              <label>Senha</label>
              <div class="password-field">
                <input name="password" data-password-input type="password" placeholder="Digite sua senha" required />
                <button type="button" class="password-toggle" data-action="toggle-password" aria-label="Mostrar senha">${icon("eye")}</button>
              </div>
            </div>
            <div class="login-feedback" id="login-feedback" aria-live="polite"></div>
            <div class="row-between">
              <label class="checkbox-row"><input type="checkbox" name="remember" ${remembered.email ? "checked" : ""} /> Lembrar-me</label>
              <a href="#" class="link-blue" data-action="forgot-password" data-value="${role}">Esqueceu a senha?</a>
            </div>
            <button class="btn btn-primary login-submit-btn ${isAdmin ? "is-admin" : "is-client"}" type="submit" id="login-submit">${icon("login")}Entrar no sistema${icon("chevronRight")}</button>
          </form>
          <p class="login-terms">Ao entrar, voc\u00EA concorda com nossos Termos de Servi\u00E7o e Pol\u00EDtica de Privacidade</p>
        </div>
      </section>
    </section>
  `;
}

function bindLoginForm(role) {
  const form = document.querySelector("#login-form");
  if (!form) return;
  const submitButton = form.querySelector("#login-submit");
  const feedback = form.querySelector("#login-feedback");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    const remember = Boolean(formData.get("remember"));
    const setFeedback = (message = "", kind = "") => {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.className = `login-feedback${kind ? ` ${kind}` : ""}`;
    };
    const setSubmitting = (submitting) => {
      if (!submitButton) return;
      submitButton.disabled = submitting;
      submitButton.innerHTML = submitting ? `${icon("spinner")}Entrando...` : `${icon("login")}Entrar no sistema${icon("chevronRight")}`;
    };

    setFeedback();
    setSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: role === "admin" ? "admin" : "cliente" }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFeedback(payload.error || "N\u00E3o foi poss\u00EDvel entrar.", "is-error");
        return;
      }
      if (remember) {
        writeRememberedLogin(role, email);
      } else {
        clearRememberedLogin(role);
      }
      const redirect = role === "admin" ? "/admin/dashboard" : "/cliente/calendario";
      state.session = {
        id: payload.id,
        role,
        email: payload.email,
        token: payload.token || "",
        redirect,
        initials: getInitials(payload.nome || payload.email || ""),
        name: payload.nome || (role === "admin" ? "Administrador" : "Cliente"),
        subtitle: payload.email,
        tipo: payload.tipo,
        telefone: payload.telefone || "",
      };
      writeSession(state.session);
      setFeedback("Login realizado com sucesso. Redirecionando...", "is-success");
      window.location.assign(redirect);
    } catch (error) {
      setFeedback(error?.message || "N\u00E3o foi poss\u00EDvel entrar.", "is-error");
    } finally {
      setSubmitting(false);
    }
  });
}

function renderLoginBrand() {
  return `
    <section class="login-brand">
      <div class="login-brand-top">
        <div class="login-brand-chip">
          <img class="login-brand-logo" src="/assets/icon-white-custom.png?v=2" alt="Fokal" />
        </div>
      </div>
      <div class="login-brand-main">
        <h1>Gerencie seus relacionamentos com efici\u00EAncia</h1>
        <p>Sistema completo para gest\u00E3o de clientes, calend\u00E1rio, relat\u00F3rios e acompanhamento de atividades.</p>
        <ul class="login-brand-list">
          <li>Dashboard interativo com m\u00E9tricas em tempo real</li>
          <li>Gest\u00E3o completa de contatos e oportunidades</li>
          <li>Calend\u00E1rio integrado e timeline de atividades</li>
          <li>Relat\u00F3rios detalhados para an\u00E1lise de performance</li>
        </ul>
      </div>
      <div class="login-brand-footer">\u00A9 2026 FOKAL Company. Todos os direitos reservados.</div>
    </section>
  `;
}

function renderClientSelectionField(clients, selectedIds = []) {
  const normalizedSelectedIds = selectedIds.map(Number);
  if (!clients.length) {
    return `
      <div class="field">
        <label>Clientes</label>
        <div class="client-selector-empty">Cadastre pelo menos um cliente antes de criar uma tarefa.</div>
      </div>
    `;
  }

  return `
    <div class="field">
      <label>Clientes</label>
      <div class="field-hint">Selecione um ou varios clientes para vincular a tarefa.</div>
      <div class="client-selector" role="group" aria-label="Selecao de clientes">
        ${clients.map((client) => `
          <label class="client-option ${normalizedSelectedIds.includes(Number(client.id)) ? "is-selected" : ""}">
            <input
              type="checkbox"
              name="clientIds"
              value="${client.id}"
              ${normalizedSelectedIds.includes(Number(client.id)) ? "checked" : ""}
            />
            <span class="client-option-copy">
              <strong>${escapeHtml(client.nome)}</strong>
              <small>${escapeHtml(normalizePlanType(client.planType))}</small>
            </span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function renderNotFound() {
  return `<section class="screen"><div class="content">${renderNotFoundInner()}</div></section>`;
}

function renderNotFoundInner() {
  return `<div class="page-head"><h1>Página não encontrada</h1><p>Volte para o login e escolha uma das telas disponíveis.</p></div><a class="btn btn-primary" data-link href="/">Ir para login</a>`;
}

function renderModal() {
  if (!state.ui.modal) return "";

  if (state.ui.modal.type === "client") {
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card">
          <div class="modal-head">
            <div><h3>Novo Cliente</h3><p>Crie uma conta individual de acesso para este cliente.</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <form id="client-form" class="modal-form">
            <div class="field"><label>Nome</label><input name="nome" required /></div>
            <div class="field"><label>Email</label><input name="email" type="email" required /></div>
            <div class="field"><label>Telefone</label><input name="telefone" required /></div>
            <div class="field"><label>Senha</label><input name="senha" type="password" required /></div>
            <div class="field"><label>Perfil de Acesso</label><input name="tipo" value="Cliente" readonly /></div>
            <div class="field"><label>Tipo de Plano</label><select name="planType">${planOptions.map((planType, index) => `<option ${index === 0 ? "selected" : ""}>${planType}</option>`).join("")}</select></div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar cliente</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (state.ui.modal.type === "user") {
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card">
          <div class="modal-head">
            <div><h3>Novo usuário</h3><p>Crie um acesso de administrador ou cliente no Supabase.</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <form id="user-form" class="modal-form">
            <div class="field"><label>Nome Completo</label><input name="nome" required /></div>
            <div class="field"><label>Telefone</label><input name="telefone" placeholder="(11) 99999-9999" required /></div>
            <div class="field"><label>Email</label><input name="email" type="email" required /></div>
            <div class="field"><label>Senha</label><input name="senha" type="password" required /></div>
            <div class="field">
              <label>Nível de acesso</label>
              <select name="tipo" required>
                <option value="Administrador">Administrador</option>
                <option value="Cliente">Cliente</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar usuário</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (state.ui.modal.type === "edit-client") {
    const client = getClientUsers().find((item) => String(item.id) === String(state.ui.modal.id));
    if (!client) return "";
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card">
          <div class="modal-head">
            <div><h3>Editar Cliente</h3><p>Atualize os dados da conta do cliente.</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <form id="edit-client-form" class="modal-form">
            <input type="hidden" name="id" value="${client.id}" />
            <div class="field"><label>Nome</label><input name="nome" value="${escapeHtml(client.nome)}" required /></div>
            <div class="field"><label>Email</label><input name="email" type="email" value="${escapeHtml(client.email)}" required /></div>
            <div class="field"><label>Telefone</label><input name="telefone" value="${escapeHtml(client.telefone || "")}" required /></div>
            <div class="field"><label>Senha</label><input name="senha" type="password" placeholder="Preencha para alterar" /></div>
            <div class="field"><label>Perfil de Acesso</label><input name="tipo" value="Cliente" readonly /></div>
            <div class="field"><label>Tipo de Plano</label><select name="planType">${planOptions.map((planType) => `<option ${normalizePlanType(client.planType) === planType ? "selected" : ""}>${planType}</option>`).join("")}</select></div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar alterações</button>
            </div>
          </form>
        </div>
      </div>
      `;
    }

  if (state.ui.modal.type === "activity") {
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card">
          <div class="modal-head">
            <div><h3>Nova atividade</h3><p>Cadastre uma nova tarefa ou compromisso do admin.</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <form id="activity-form" class="modal-form">
            <div class="field"><label>Título</label><input name="title" placeholder="Ex.: Reunião de alinhamento" required /></div>
            <div class="field"><label>Contato / Empresa</label><input name="who" placeholder="Ex.: Maria Santos - Tech Solutions" required /></div>
            <div class="field two-col">
              <div><label>Horário</label><input name="time" type="time" required /></div>
              <div><label>Seção</label><select name="section"><option>Hoje</option><option>Amanhã</option><option>Próxima Semana</option></select></div>
            </div>
            <div class="field two-col">
              <div><label>Status</label><select name="status"><option>Agendada</option><option>Pendente</option><option>Concluída</option></select></div>
              <div><label>Tipo</label><select name="icon"><option value="calendar">Reunião</option><option value="phone">Ligação</option><option value="mail">Email</option><option value="checksquare">Tarefa</option></select></div>
            </div>
            <div class="field"><label>Descrição</label><textarea name="text" rows="4" placeholder="Detalhes da atividade" required></textarea></div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar atividade</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (state.ui.modal.type === "finance-item" || state.ui.modal.type === "edit-finance-item") {
    const item = state.ui.modal.type === "edit-finance-item" ? financeItems.find((entry) => String(entry.id) === String(state.ui.modal.id)) : null;
    if (state.ui.modal.type === "edit-finance-item" && !item) return "";
    const selectedType = state.ui.modal.type === "finance-item" ? state.ui.modal.prefillType || "receita-fixa" : item.type;
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card">
          <div class="modal-head">
            <div><h3>${item ? "Editar lançamento" : "Novo lançamento financeiro"}</h3><p>${item ? "Atualize os dados do lançamento." : "Cadastre entradas e saídas do mês."}</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <form id="${item ? "edit-finance-item-form" : "finance-item-form"}" class="modal-form">
            ${item ? `<input type="hidden" name="id" value="${item.id}" />` : ""}
            <div class="field"><label>Seção</label><select name="type">${[
              ["receita-fixa", "Receitas fixas"],
              ["receita-variavel", "Receitas variáveis"],
              ["despesa-fixa", "Despesas fixas"],
              ["despesa-variavel", "Despesas variáveis"],
            ].map(([value, label]) => `<option value="${value}" ${selectedType === value ? "selected" : ""}>${label}</option>`).join("")}</select></div>
            <div class="field"><label>Nome</label><input name="name" value="${escapeHtml(item?.name || "")}" placeholder="Nome do lançamento" required /></div>
            <div class="field"><label>Data do lançamento</label><input name="date" type="date" value="${escapeHtml(item?.date || getTodayIso())}" required /></div>
            <div class="field"><label>Descrição</label><textarea name="description" rows="4" placeholder="Descreva esse valor" required>${escapeHtml(item?.description || "")}</textarea></div>
            <div class="field"><label>Valor</label><input name="value" value="${escapeHtml(item?.value || "")}" placeholder="R$ 0,00" required /></div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">${item ? "Salvar alterações" : "Salvar lançamento"}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (state.ui.modal.type === "deal" || state.ui.modal.type === "edit-deal") {
    const deal = state.ui.modal.type === "edit-deal" ? deals.find((item) => String(item.id) === String(state.ui.modal.id)) : null;
    if (state.ui.modal.type === "edit-deal" && !deal) return "";
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card">
          <div class="modal-head">
            <div><h3>${deal ? "Editar negócio" : "Novo negócio"}</h3><p>${deal ? "Atualize os dados do negócio selecionado." : "Cadastre uma nova oportunidade comercial."}</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <form id="${deal ? "edit-deal-form" : "deal-form"}" class="modal-form">
            ${deal ? `<input type="hidden" name="id" value="${deal.id}" />` : ""}
            <div class="field"><label>Título</label><input name="title" value="${escapeHtml(deal?.title || "")}" placeholder="Consultoria recorrente" required /></div>
            <div class="field two-col">
              <div><label>Valor</label><input name="value" value="${escapeHtml(deal?.value || "")}" placeholder="R$ 18.000,00" required /></div>
              <div><label>Data</label><input name="date" value="${escapeHtml(deal?.date || "")}" placeholder="18/04" required /></div>
            </div>
            <div class="field"><label>Empresa</label><input name="company" value="${escapeHtml(deal?.company || "")}" placeholder="Nome da empresa" required /></div>
            <div class="field two-col">
              <div><label>Contato</label><input name="contact" value="${escapeHtml(deal?.contact || "")}" placeholder="Nome do contato" /></div>
              <div><label>Responsável</label><input name="owner" value="${escapeHtml(deal?.owner || "")}" placeholder="Responsável interno" /></div>
            </div>
            <div class="field two-col">
              <div><label>Etapa</label><select name="stage">${pipelineStages.map((stage) => `<option ${deal?.stage === stage.name ? "selected" : ""}>${stage.name}</option>`).join("")}</select></div>
              <div><label>Status</label><input name="status" value="${escapeHtml(deal?.status || "")}" placeholder="Ex.: Proposta enviada" /></div>
            </div>
            <div class="field"><label>Próxima ação</label><input name="nextAction" value="${escapeHtml(deal?.nextAction || "")}" placeholder="Próxima movimentação do negócio" /></div>
            <div class="field"><label>Descrição</label><textarea name="description" rows="4" placeholder="Contexto comercial e pontos importantes">${escapeHtml(deal?.description || "")}</textarea></div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">${deal ? "Salvar alterações" : "Criar negócio"}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (state.ui.modal.type === "admin-event") {
    const clients = getClientUsers();
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card">
          <div class="modal-head">
            <div><h3>Nova tarefa</h3><p>${formatFullDate(state.ui.adminSelectedDate)}</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <form id="admin-event-form" class="modal-form">
            <div class="field"><label>Titulo</label><input name="title" placeholder="Reuniao de alinhamento" required /></div>
            <div class="field"><label>Descricao</label><textarea name="description" rows="4" placeholder="Detalhes da tarefa"></textarea></div>
            <div class="field"><label>Data</label><input name="date" type="date" value="${state.ui.adminSelectedDate}" required /></div>
            <div class="field"><label>Horario</label><input name="time" type="time" required /></div>
            ${renderClientSelectionField(clients)}
            <div class="field"><label>Tipo</label><select name="type"><option value="reuniao">Reuniao</option><option value="ligacao">Ligacao</option><option value="tarefa">Tarefa</option><option value="prazo">Prazo</option></select></div>
            <div class="field"><label>Status</label><select name="status"><option value="agendada">Agendada</option><option value="pendente">Pendente</option><option value="concluida">Concluida</option><option value="cancelada">Cancelada</option></select></div>
            ${renderRecurrenceFields()}
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar tarefa</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (state.ui.modal.type === "client-event") {
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card modal-card-small">
          <div class="modal-head">
            <div><h3>Confirmar horário</h3><p>Selecione um horário para confirmar.</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <div class="slot-grid">
            ${["09:00", "10:00", "11:00", "14:00", "15:30", "16:30"].map((slot) => `<button class="btn btn-outline slot-btn" data-action="confirm-client-slot" data-value="${slot}">${slot}</button>`).join("")}
          </div>
        </div>
      </div>
    `;
  }

  if (state.ui.modal.type === "edit-admin-event") {
    const event = findAdminEventById(state.ui.modal.id);
    if (!event) return "";
    const clients = getClientUsers();
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card">
          <div class="modal-head">
            <div><h3>Editar tarefa</h3><p>Ajuste os dados da tarefa.</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <form id="edit-admin-event-form" class="modal-form">
            <input type="hidden" name="id" value="${event.id}" />
            <div class="field"><label>Título</label><input name="title" value="${escapeHtml(event.title)}" required /></div>
            <div class="field"><label>Descrição</label><textarea name="description" rows="4">${escapeHtml(event.description || "")}</textarea></div>
            <div class="field"><label>Data</label><input name="date" type="date" value="${event.date}" required /></div>
            <div class="field"><label>Horário</label><input name="time" type="time" value="${event.time}" required /></div>
            ${renderClientSelectionField(clients, (event.clientIds || []).map(Number))}
            <div class="field"><label>Tipo</label><select name="type">${["reuniao", "ligacao", "tarefa", "prazo"].map((type) => `<option value="${type}" ${event.type === type ? "selected" : ""}>${capitalize(type)}</option>`).join("")}</select></div>
            <div class="field"><label>Status</label><select name="status">${[
              ["agendada", "Agendada"],
              ["pendente", "Pendente"],
              ["concluida", "Concluída"],
              ["cancelada", "Cancelada"],
            ].map(([value, label]) => `<option value="${value}" ${event.status === value ? "selected" : ""}>${label}</option>`).join("")}</select></div>
            ${renderRecurrenceFields(event)}
            ${event.isRecurring ? `
              <div class="field">
                <label>Aplicar em</label>
                <select name="scope">
                  <option value="single">Apenas este evento</option>
                  <option value="series">Toda a sequência</option>
                </select>
              </div>
            ` : `<input type="hidden" name="scope" value="single" />`}
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar alterações</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (state.ui.modal.type === "edit-client-event") {
    const event = findClientEventById(state.ui.modal.id);
    if (!event) return "";
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card modal-card-small">
          <div class="modal-head">
            <div><h3>Editar horário</h3><p>Escolha um novo horário para confirmar.</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <div class="slot-grid">
            ${["09:00", "10:00", "11:00", "14:00", "15:30", "16:30"].map((slot) => `<button class="btn ${event.time === slot ? "btn-primary" : "btn-outline"} slot-btn" data-action="update-client-slot" data-value="${event.id}|${slot}">${slot}</button>`).join("")}
          </div>
        </div>
      </div>
    `;
  }

  if (state.ui.modal.type === "content" || state.ui.modal.type === "edit-content") {
    const item = state.ui.modal.type === "edit-content" ? contentItems.find((entry) => Number(entry.id) === Number(state.ui.modal.id)) : null;
    const clients = getClientUsers();
    if (state.ui.modal.type === "edit-content" && !item) return "";
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card">
          <div class="modal-head">
            <div><h3>${item ? "Editar conteúdo" : "Novo conteúdo"}</h3><p>${item ? "Atualize as informações deste conteúdo." : "Cadastre um novo conteúdo para alimentar o dashboard."}</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <form id="${item ? "edit-content-form" : "content-form"}" class="modal-form">
            ${item ? `<input type="hidden" name="id" value="${item.id}" />` : ""}
            <div class="field"><label>Título</label><input name="titulo" value="${escapeHtml(item?.titulo || "")}" required /></div>
            <div class="field"><label>Tipo</label><select name="tipo">${["post", "video", "story", "carrossel"].map((type) => `<option value="${type}" ${item?.tipo === type ? "selected" : ""}>${capitalize(type)}</option>`).join("")}</select></div>
            <div class="field"><label>Descrição</label><textarea name="descricao" rows="4">${escapeHtml(item?.descricao || "")}</textarea></div>
            <div class="field two-col">
              <div><label>Data de publicação</label><input name="data_publicacao" type="date" value="${escapeHtml(item?.data_publicacao || getTodayIso())}" required /></div>
              <div><label>Status</label><select name="status">${[["publicado", "Publicado"], ["pendente", "Pendente"], ["rascunho", "Rascunho"]].map(([value, label]) => `<option value="${value}" ${item?.status === value ? "selected" : ""}>${label}</option>`).join("")}</select></div>
            </div>
            <div class="field"><label>Cliente</label><select name="cliente_id" required>${clients.map((client) => `<option value="${client.id}" ${Number(item?.cliente_id || 0) === Number(client.id) ? "selected" : ""}>${escapeHtml(client.nome)}</option>`).join("")}</select></div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">${item ? "Salvar alterações" : "Salvar conteúdo"}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (state.ui.modal.type === "campaign" || state.ui.modal.type === "edit-campaign") {
    const item = state.ui.modal.type === "edit-campaign" ? trafficCampaigns.find((entry) => Number(entry.id) === Number(state.ui.modal.id)) : null;
    const clients = getClientUsers();
    if (state.ui.modal.type === "edit-campaign" && !item) return "";
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal-card">
          <div class="modal-head">
            <div><h3>${item ? "Editar campanha" : "Nova campanha"}</h3><p>${item ? "Atualize os indicadores da campanha." : "Cadastre uma campanha de tráfego pago."}</p></div>
            <button type="button" class="modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          </div>
          <form id="${item ? "edit-campaign-form" : "campaign-form"}" class="modal-form">
            ${item ? `<input type="hidden" name="id" value="${item.id}" />` : ""}
            <div class="field"><label>Nome</label><input name="nome" value="${escapeHtml(item?.nome || "")}" required /></div>
            <div class="field"><label>Cliente</label><select name="cliente_id" required>${clients.map((client) => `<option value="${client.id}" ${Number(item?.cliente_id || 0) === Number(client.id) ? "selected" : ""}>${escapeHtml(client.nome)}</option>`).join("")}</select></div>
            <div class="field two-col">
              <div><label>Orçamento</label><input name="orcamento" value="${escapeHtml(item?.orcamento || "")}" placeholder="R$ 0,00" required /></div>
              <div><label>Plataforma</label><select name="plataforma">${["Meta Ads", "Google Ads", "LinkedIn Ads", "TikTok Ads"].map((platform) => `<option value="${platform}" ${item?.plataforma === platform ? "selected" : ""}>${platform}</option>`).join("")}</select></div>
            </div>
            <div class="field two-col">
              <div><label>Data início</label><input name="data_inicio" type="date" value="${escapeHtml(item?.data_inicio || getTodayIso())}" required /></div>
              <div><label>Data fim</label><input name="data_fim" type="date" value="${escapeHtml(item?.data_fim || getTodayIso())}" required /></div>
            </div>
            <div class="field two-col">
              <div><label>Cliques</label><input name="cliques" type="number" min="0" value="${escapeHtml(String(item?.cliques || 0))}" /></div>
              <div><label>Impressões</label><input name="impressoes" type="number" min="0" value="${escapeHtml(String(item?.impressoes || 0))}" /></div>
            </div>
            <div class="field two-col">
              <div><label>Conversões</label><input name="conversoes" type="number" min="0" value="${escapeHtml(String(item?.conversoes || 0))}" /></div>
              <div><label>Custo por resultado</label><input name="custo_resultado" type="number" min="0" step="0.01" value="${escapeHtml(String(item?.custo_resultado || 0))}" /></div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">${item ? "Salvar alterações" : "Salvar campanha"}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  return "";
}

function bindModalForms() {
  const userForm = document.querySelector("#user-form");
  if (userForm) {
    userForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(userForm).entries());
      const created = await postJson("/api/usuarios", payload);
      if (!created) return;
      registeredUsers = [created, ...registeredUsers];
      state.ui.modal = null;
      renderRoute();
      notify("Usuário criado com sucesso.");
    });
  }

  const clientForm = document.querySelector("#client-form");
  if (clientForm) {
    clientForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(clientForm);
      const payload = Object.fromEntries(formData.entries());
      const created = await postJson("/api/clientes", payload);
      if (!created) return;
      registeredUsers = [created, ...registeredUsers];
      state.ui.modal = null;
      renderRoute();
      notify("Cliente criado com sucesso.");
    });
  }

  const editClientForm = document.querySelector("#edit-client-form");
  if (editClientForm) {
    editClientForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(editClientForm);
      const id = formData.get("id");
      if (!formData.get("senha")) formData.delete("senha");
      formData.delete("id");
      const updated = await requestJson(`/api/clientes/${id}`, "PUT", Object.fromEntries(formData.entries()));
      if (!updated) return;
      replaceClientInState(updated);
      state.ui.modal = null;
      renderRoute();
      notify("Cliente atualizado com sucesso.");
    });
  }

  const activityForm = document.querySelector("#activity-form");
  if (activityForm) {
    activityForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(activityForm).entries());
      adminActivities = [
        {
          id: Date.now(),
          section: payload.section,
          title: payload.title,
          who: payload.who,
          time: payload.time,
          text: payload.text,
          icon: payload.icon,
          color: activityColorByIcon(payload.icon),
          status: payload.status,
          statusClass: activityStatusKeyFromLabel(payload.status),
        },
        ...adminActivities,
      ];
      state.ui.modal = null;
      renderRoute();
      notify("Atividade criada com sucesso.");
    });
  }

  const financeItemForm = document.querySelector("#finance-item-form");
  if (financeItemForm) {
    financeItemForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const created = await postJson("/api/finance-items", Object.fromEntries(new FormData(financeItemForm).entries()));
      if (!created) return;
      financeItems = [created, ...financeItems];
      state.ui.modal = null;
      renderRoute();
      notify("Lançamento financeiro criado.");
    });
  }

  const editFinanceItemForm = document.querySelector("#edit-finance-item-form");
  if (editFinanceItemForm) {
    editFinanceItemForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(editFinanceItemForm);
      const id = formData.get("id");
      formData.delete("id");
      const updated = await requestJson(`/api/finance-items/${id}`, "PUT", Object.fromEntries(formData.entries()));
      if (!updated) return;
      replaceFinanceItemInState(updated);
      state.ui.modal = null;
      renderRoute();
      notify("Lançamento financeiro atualizado.");
    });
  }

  const dealForm = document.querySelector("#deal-form");
  if (dealForm) {
    dealForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(dealForm).entries());
      const created = await postJson("/api/deals", payload);
      if (!created) return;
      deals = [created, ...deals];
      state.ui.selectedDealId = created.id;
      state.ui.modal = null;
      renderRoute();
      notify("Negócio criado com sucesso.");
    });
  }

  const editDealForm = document.querySelector("#edit-deal-form");
  if (editDealForm) {
    editDealForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(editDealForm);
      const id = formData.get("id");
      formData.delete("id");
      const updated = await requestJson(`/api/deals/${id}`, "PUT", Object.fromEntries(formData.entries()));
      if (!updated) return;
      replaceDealInState(updated);
      state.ui.selectedDealId = updated.id;
      state.ui.modal = null;
      renderRoute();
      notify("Negócio atualizado com sucesso.");
    });
  }

  const contentForm = document.querySelector("#content-form");
  if (contentForm) {
    contentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(contentForm).entries());
      const created = await postJson("/api/conteudos", payload);
      if (!created) return;
      await refreshAppState();
      state.ui.modal = null;
      renderRoute();
      notify("Conteúdo criado com sucesso.");
    });
  }

  const editContentForm = document.querySelector("#edit-content-form");
  if (editContentForm) {
    editContentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(editContentForm);
      const id = formData.get("id");
      formData.delete("id");
      const updated = await requestJson(`/api/conteudos/${id}`, "PUT", Object.fromEntries(formData.entries()));
      if (!updated) return;
      await refreshAppState();
      state.ui.modal = null;
      renderRoute();
      notify("Conteúdo atualizado.");
    });
  }

  const campaignForm = document.querySelector("#campaign-form");
  if (campaignForm) {
    campaignForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(campaignForm).entries());
      const created = await postJson("/api/campanhas", payload);
      if (!created) return;
      await refreshAppState();
      state.ui.modal = null;
      renderRoute();
      notify("Campanha criada com sucesso.");
    });
  }

  const editCampaignForm = document.querySelector("#edit-campaign-form");
  if (editCampaignForm) {
    editCampaignForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(editCampaignForm);
      const id = formData.get("id");
      formData.delete("id");
      const updated = await requestJson(`/api/campanhas/${id}`, "PUT", Object.fromEntries(formData.entries()));
      if (!updated) return;
      await refreshAppState();
      state.ui.modal = null;
      renderRoute();
      notify("Campanha atualizada.");
    });
  }

  const adminEventForm = document.querySelector("#admin-event-form");
  if (adminEventForm) {
    adminEventForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(adminEventForm);
      const payload = Object.fromEntries(formData.entries());
      payload.clientIds = formData.getAll("clientIds");
      payload.recurrenceWeekdays = formData.getAll("recurrenceWeekdays");
      if (!payload.clientIds.length) {
        notify("Selecione pelo menos um cliente para a tarefa.");
        return;
      }
      const created = await postJson("/api/admin-events", payload);
      if (!created) return;
      await refreshAppState();
      state.ui.modal = null;
      state.ui.adminSelectedDate = created.date;
      state.ui.adminVisibleMonth = getMonthStartIso(parseIsoDate(created.date));
      renderRoute();
      notify("Tarefa criada no calendário do admin.");
    });
  }

  const editAdminEventForm = document.querySelector("#edit-admin-event-form");
  if (editAdminEventForm) {
    editAdminEventForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(editAdminEventForm);
      const id = formData.get("id");
      formData.delete("id");
      const payload = {
        ...Object.fromEntries(formData.entries()),
        clientIds: formData.getAll("clientIds"),
        recurrenceWeekdays: formData.getAll("recurrenceWeekdays"),
      };
      if (!payload.clientIds.length) {
        notify("Selecione pelo menos um cliente para a tarefa.");
        return;
      }
      const updated = await requestJson(`/api/admin-events/${encodeURIComponent(id)}`, "PUT", payload);
      if (!updated) return;
      await refreshAppState();
      state.ui.modal = null;
      state.ui.adminSelectedDate = updated.date;
      state.ui.adminVisibleMonth = getMonthStartIso(parseIsoDate(updated.date));
      renderRoute();
      notify("Tarefa do admin atualizada.");
    });
  }
}

function renderTabs(group, items, activeTab) {
  return items
    .map(
      (item) => `<button class="tab ${item === activeTab ? "active" : ""}" data-tab-group="${group}" data-tab-value="${item}">${item}</button>`,
    )
    .join("");
}

function groupBySection(items) {
  return items.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});
}

function filterActivitySections(sections, tab) {
  if (tab === "Todas") return sections;
  const labelMap = {
    Pendentes: "Pendente",
    Agendadas: "Agendada",
    Concluídas: "Concluída",
  };
  const filtered = Object.entries(sections).reduce((acc, [section, items]) => {
    const matches = items.filter((item) => item.status === labelMap[tab]);
    if (matches.length) acc[section] = matches;
    return acc;
  }, {});
  return filtered;
}

function handleTab(group, value) {
  if (group === "admin-activities") state.ui.adminActivityTab = value;
  if (group === "client-activities") state.ui.clientActivityTab = value;
  renderRoute();
}

function handleCalendarDay(role, date) {
  if (role === "admin") state.ui.adminSelectedDate = date;
  if (role === "cliente") state.ui.clientSelectedDate = date;
  renderRoute();
}

function handleAction(action, value) {
  if (action === "new-user") {
    state.ui.modal = { type: "user" };
    return renderRoute();
  }
  if (action === "new-client") {
    state.ui.modal = { type: "client" };
    return renderRoute();
  }
  if (action === "new-finance-item") {
    state.ui.modal = { type: "finance-item", prefillType: value || "receita-fixa" };
    return renderRoute();
  }
  if (action === "edit-finance-item") {
    state.ui.modal = { type: "edit-finance-item", id: Number(value) };
    return renderRoute();
  }
  if (action === "delete-finance-item") {
    return deleteFinanceItem(value);
  }
  if (action === "new-activity") {
    state.ui.modal = { type: "activity" };
    return renderRoute();
  }
  if (action === "new-deal") {
    state.ui.modal = { type: "deal" };
    return renderRoute();
  }
  if (action === "new-content") {
    state.ui.modal = { type: "content" };
    return renderRoute();
  }
  if (action === "edit-content") {
    state.ui.modal = { type: "edit-content", id: Number(value) };
    return renderRoute();
  }
  if (action === "delete-content") {
    return deleteContent(value);
  }
  if (action === "new-campaign") {
    state.ui.modal = { type: "campaign" };
    return renderRoute();
  }
  if (action === "edit-campaign") {
    state.ui.modal = { type: "edit-campaign", id: Number(value) };
    return renderRoute();
  }
  if (action === "delete-campaign") {
    return deleteCampaign(value);
  }
  if (action === "edit-deal") {
    state.ui.modal = { type: "edit-deal", id: Number(value) };
    return renderRoute();
  }
  if (action === "delete-deal") {
    return deleteDeal(value);
  }
  if (action === "edit-client") {
    state.ui.modal = { type: "edit-client", id: value };
    return renderRoute();
  }
  if (action === "delete-client") {
    return deleteClient(value);
  }
  if (action === "toggle-filter") return notify("Filtro visual ativo. Escolha um tipo de plano ao lado.");
  if (action === "toggle-password") {
    const input = document.querySelector("[data-password-input]");
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
    return;
  }
  if (action === "forgot-password") {
    return notify("Para recuperar a senha, redefina o usuário no painel ou configure o fluxo de recuperação no Supabase Auth.");
  }
  if (action === "export-pdf") return notify("Exportação PDF simulada com sucesso.");
  if (action === "new-calendar-event") {
    if (value === "cliente") return notify("Clientes podem apenas visualizar as próprias tarefas.");
    state.ui.modal = { type: value === "admin" ? "admin-event" : "client-event" };
    return renderRoute();
  }
  if (action === "edit-admin-event") {
    state.ui.modal = { type: "edit-admin-event", id: String(value) };
    return renderRoute();
  }
  if (action === "delete-admin-event") {
    return deleteAdminEvent(value);
  }
  if (action === "edit-client-event") {
    state.ui.modal = { type: "edit-client-event", id: String(value) };
    return renderRoute();
  }
  if (action === "delete-client-event") {
    return deleteClientEvent(value);
  }
  if (action === "close-modal") {
    state.ui.modal = null;
    return renderRoute();
  }
  if (action === "select-deal") {
    state.ui.selectedDealId = Number(value);
    renderRoute();
    const selected = getSelectedDeal();
    return notify(`Negócio selecionado: ${selected?.title || "registro"}.`);
  }
  if (action === "move-deal-stage") {
    const [id, stage] = value.split("|");
    return updateDealStage(Number(id), stage);
  }
  if (action === "move-deal-direction") {
    const [id, direction] = value.split("|");
    return moveDealByDirection(Number(id), direction);
  }
  if (action === "confirm-client-slot") {
    return notify("Clientes podem apenas visualizar as próprias tarefas.");
  }
  if (action === "update-client-slot") {
    return notify("Clientes não podem editar tarefas.");
  }
  if (action === "calendar-prev" || action === "calendar-next") {
    const key = value === "admin" ? "adminVisibleMonth" : "clientVisibleMonth";
    const selectedKey = value === "admin" ? "adminSelectedDate" : "clientSelectedDate";
    state.ui[key] = getMonthStartIso(addMonths(parseIsoDate(state.ui[key]), action === "calendar-prev" ? -1 : 1));
    state.ui[selectedKey] = state.ui[key];
    return renderRoute();
  }
  if (action === "reports-filter") {
    return renderRoute();
  }
}

async function deleteClient(id) {
  const ok = await requestJson(`/api/clientes/${id}`, "DELETE");
  if (!ok) return;
  registeredUsers = registeredUsers.filter((item) => Number(item.id) !== Number(id));
  calendarTasks = calendarTasks
    .map((task) => ({ ...task, clientIds: (task.clientIds || []).filter((clientId) => Number(clientId) !== Number(id)) }))
    .filter((task) => (task.clientIds || []).length);
  renderRoute();
  notify("Cliente removido.");
}

async function deleteFinanceItem(id) {
  const ok = await requestJson(`/api/finance-items/${id}`, "DELETE");
  if (!ok) return;
  financeItems = financeItems.filter((item) => Number(item.id) !== Number(id));
  state.ui.modal = null;
  renderRoute();
  notify("Lançamento removido.");
}

async function deleteDeal(id) {
  const ok = await requestJson(`/api/deals/${id}`, "DELETE");
  if (!ok) return;
  deals = deals.filter((item) => Number(item.id) !== Number(id));
  const fallback = deals[0] || null;
  state.ui.selectedDealId = fallback ? fallback.id : null;
  state.ui.modal = null;
  renderRoute();
  notify("Negócio removido.");
}

async function deleteContent(id) {
  const ok = await requestJson(`/api/conteudos/${id}`, "DELETE");
  if (!ok) return;
  await refreshAppState();
  renderRoute();
  notify("Conteúdo removido.");
}

async function deleteCampaign(id) {
  const ok = await requestJson(`/api/campanhas/${id}`, "DELETE");
  if (!ok) return;
  await refreshAppState();
  renderRoute();
  notify("Campanha removida.");
}

async function updateDealStage(id, stage) {
  const current = deals.find((item) => Number(item.id) === Number(id));
  if (!current || current.stage === stage) return;
  const updated = await requestJson(`/api/deals/${id}`, "PUT", { ...current, stage });
  if (!updated) return;
  replaceDealInState(updated);
  state.ui.selectedDealId = updated.id;
  renderRoute();
  notify(`Negócio movido para ${stage}.`);
}

async function moveDealByDirection(id, direction) {
  const current = deals.find((item) => Number(item.id) === Number(id));
  if (!current) return;
  const currentIndex = getDealStageIndex(current.stage);
  const nextIndex = direction === "back" ? currentIndex - 1 : currentIndex + 1;
  if (nextIndex < 0 || nextIndex >= pipelineStages.length) return;
  return updateDealStage(id, pipelineStages[nextIndex].name);
}

async function deleteAdminEvent(id) {
  const scope = "single";
  const ok = await requestJson(`/api/admin-events/${encodeURIComponent(id)}?scope=${scope}`, "DELETE");
  if (!ok) return;
  await refreshAppState();
  renderRoute();
  notify("Evento removido.");
}

async function deleteClientEvent(id) {
  return notify("Clientes não podem remover tarefas.");
}

function notify(message) {
  document.querySelectorAll(".toast").forEach((node) => node.remove());
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 220);
  }, 2200);
}

async function loadBootstrap() {
  try {
    if (!state.session) {
      return;
    }

    if (state.session && !state.session.token) {
      clearSession();
      throw new Error("Sessão antiga sem token.");
    }

    await refreshAppState();
  } catch {
    notify("Não foi possível carregar dados persistidos.");
  } finally {
    state.ready = true;
    renderRoute();
  }
}

async function refreshAppState() {
  const response = await fetch("/api/state", { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Falha ao carregar");
  const data = await response.json();
  if (Array.isArray(data.users)) {
    registeredUsers = data.users.map(normalizeClientUser);
  }
  if (Array.isArray(data.deals)) {
    deals = data.deals;
    if (!deals.some((item) => Number(item.id) === Number(state.ui.selectedDealId))) {
      state.ui.selectedDealId = deals[0]?.id || null;
    }
  }
  if (Array.isArray(data.financeItems)) {
    financeItems = data.financeItems;
  }
  if (Array.isArray(data.contents)) {
    contentItems = data.contents;
  }
  if (Array.isArray(data.campaigns)) {
    trafficCampaigns = data.campaigns;
  }
  if (Array.isArray(data.tasks)) {
    calendarTasks = data.tasks;
  } else if (Array.isArray(data.adminEvents) || Array.isArray(data.clientEvents)) {
    calendarTasks = [...(data.adminEvents || []), ...(data.clientEvents || [])];
  }
}

async function postJson(url, payload) {
  return requestJson(url, "POST", payload);
}

async function requestJson(url, method, payload) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    };
      if (payload !== undefined) {
        options.body = JSON.stringify(payload);
      }
      const response = await fetch(url, options);
      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();
      let data = { ok: true };

      if (text) {
        if (contentType.includes("application/json")) {
          data = JSON.parse(text);
        } else {
          notify("Servidor desatualizado ou rota invalida. Reinicie o app e tente novamente.");
          return null;
        }
      }

      if (!response.ok) {
        notify(data.error || "Erro ao salvar.");
        return null;
      }
      return data;
    } catch {
      notify("Falha de conexao com o servidor. Verifique se o node server.js esta rodando.");
      return null;
    }
  }

function replaceClientInState(updated) {
  const normalized = normalizeClientUser(updated);
  registeredUsers = registeredUsers.map((item) => (Number(item.id) === Number(normalized.id) ? normalized : item));
}

function normalizeClientUser(client) {
  const planType = normalizePlanType(client.planType || client.statusLabel || client.status);
  return {
    ...client,
    nome: client.nome || client.name || "",
    telefone: client.telefone || client.phone || "",
    tipo: client.tipo || "Cliente",
    initials: getInitials(client.nome || client.name || ""),
    planType,
  };
}

function normalizePlanType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "producao de conteudo" || normalized === "produção de conteúdo") return "Produção de Conteúdo";
  if (normalized === "gestao de trafego" || normalized === "gestão de tráfego") return "Gestão de Tráfego";
  if (normalized === "ambos") return "Ambos";
  if (normalized === "quente" || normalized === "hot") return "Ambos";
  if (normalized === "frio" || normalized === "cold") return "Gestão de Tráfego";
  return "Produção de Conteúdo";
}

function getPlanSummary() {
  const clients = getClientUsers();
  const total = clients.length;
  const content = clients.filter((client) => normalizePlanType(client.planType) === "Produção de Conteúdo").length;
  const traffic = clients.filter((client) => normalizePlanType(client.planType) === "Gestão de Tráfego").length;
  const both = clients.filter((client) => normalizePlanType(client.planType) === "Ambos").length;
  return {
    total,
    content,
    traffic,
    both,
    contentShare: total ? Math.round((content / total) * 100) : 0,
    trafficShare: total ? Math.round((traffic / total) * 100) : 0,
    bothShare: total ? Math.round((both / total) * 100) : 0,
  };
}

function replaceDealInState(updated) {
  deals = deals.map((item) => (Number(item.id) === Number(updated.id) ? updated : item));
}

function replaceFinanceItemInState(updated) {
  financeItems = financeItems.map((item) => (Number(item.id) === Number(updated.id) ? updated : item));
}

function getSelectedDeal() {
  return deals.find((item) => Number(item.id) === Number(state.ui.selectedDealId)) || null;
}

function getDealStageIndex(stageName) {
  return pipelineStages.findIndex((stage) => stage.name === stageName);
}

function getPipelineColumns() {
  return pipelineStages.map((stage) => {
    const items = deals.filter((deal) => deal.stage === stage.name);
    return {
      ...stage,
      count: items.length,
      total: formatCurrencyFromDeals(items),
      deals: items,
    };
  });
}

function formatCurrencyFromDeals(items) {
  const total = items.reduce((sum, item) => sum + parseCurrency(item.value), 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total);
}

function formatCurrencyFromNumber(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function parseCurrency(value) {
  const normalized = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function getCalendarDots(tasks, date) {
  const items = getTasksForDate(tasks, date);
  if (!items.length) return [];
  return [...new Set(items.map((item) => colorByEventType(item.type)))];
}

function getFinanceSummary() {
  const totalByType = (type) => financeItems.filter((item) => item.type === type).reduce((sum, item) => sum + parseCurrency(item.value), 0);
  const receitasFixas = totalByType("receita-fixa");
  const receitasVariaveis = totalByType("receita-variavel");
  const despesasFixas = totalByType("despesa-fixa");
  const despesasVariaveis = totalByType("despesa-variavel");
  const totalEntradas = receitasFixas + receitasVariaveis;
  const totalDespesas = despesasFixas + despesasVariaveis;
  const saldo = totalEntradas - totalDespesas;
  const margem = totalEntradas > 0 ? saldo / totalEntradas : 0;
  return {
    receitasFixas,
    receitasVariaveis,
    despesasFixas,
    despesasVariaveis,
    totalEntradas,
    totalDespesas,
    saldo,
    margem,
    receitasFixasLabel: formatCurrencyFromNumber(receitasFixas),
    receitasVariaveisLabel: formatCurrencyFromNumber(receitasVariaveis),
    despesasFixasLabel: formatCurrencyFromNumber(despesasFixas),
    despesasVariaveisLabel: formatCurrencyFromNumber(despesasVariaveis),
    totalEntradasLabel: formatCurrencyFromNumber(totalEntradas),
    totalDespesasLabel: formatCurrencyFromNumber(totalDespesas),
    saldoLabel: formatCurrencyFromNumber(saldo),
    margemLabel: `${(margem * 100).toFixed(1).replace(".", ",")}%`,
    margemPercentual: (margem * 100).toFixed(1).replace(".", ","),
  };
}

function getFinanceMonthlyProfitSeries() {
  const now = new Date();
  const months = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", ""),
      lucro: 0,
    });
  }

  const monthMap = new Map(months.map((item) => [item.key, item]));
  financeItems.forEach((item) => {
    const isoDate = normalizeFinanceDate(item.date || getTodayIso());
    if (!isoDate) return;
    const key = isoDate.slice(0, 7);
    const target = monthMap.get(key);
    if (!target) return;
    const amount = parseCurrency(item.value);
    if (String(item.type || "").startsWith("receita")) target.lucro += amount;
    if (String(item.type || "").startsWith("despesa")) target.lucro -= amount;
  });

  return months;
}

function normalizeFinanceDate(value) {
  const normalized = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
}

function formatFinanceDate(value) {
  const normalized = normalizeFinanceDate(value);
  if (!normalized) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parseIsoDate(normalized));
}

function findAdminEventById(id) {
  return calendarTasks.find((item) => String(item.id) === String(id)) || null;
}

function findClientEventById(id) {
  return getTasksForCalendar("cliente").find((item) => String(item.id) === String(id)) || null;
}

function replaceAdminEventInState(updated) {
  calendarTasks = upsertTask(calendarTasks, updated);
}

function replaceClientEventInState(updated) {
  calendarTasks = upsertTask(calendarTasks, updated);
}

function removeAdminEventFromState(id, silent = false) {
  calendarTasks = calendarTasks.filter((item) => String(item.id) !== String(id));
  if (!silent) state.ui.modal = null;
}

function removeClientEventFromState(id, silent = false) {
  calendarTasks = calendarTasks.filter((item) => String(item.id) !== String(id));
  if (!silent) state.ui.modal = null;
}

function addClientEventToState(eventItem) {
  calendarTasks = upsertTask(calendarTasks, eventItem);
}

function addAdminEventToState(eventItem) {
  calendarTasks = upsertTask(calendarTasks, eventItem);
}

function upsertTask(source, task) {
  const next = source.filter((item) => String(item.id) !== String(task.id));
  return [...next, task].sort(compareTasks);
}

function getClientUsers() {
  return registeredUsers
    .map(normalizeClientUser)
    .filter((user) => String(user.tipo || "").toLowerCase() === "cliente");
}

function getContentReportFilter(role) {
  return {
    clientId: role === "cliente" ? String(state.session?.id || "") : state.ui.reportsClientFilter,
    month: state.ui.reportsMonthFilter,
    year: state.ui.reportsYearFilter,
  };
}

function getTrafficReportFilter(role) {
  return {
    clientId: role === "cliente" ? String(state.session?.id || "") : state.ui.trafficClientFilter,
    month: state.ui.trafficMonthFilter,
    year: state.ui.trafficYearFilter,
  };
}

function getFilteredContentItems(role) {
  const filter = getContentReportFilter(role);
  return contentItems.filter((item) => {
    if (filter.clientId && filter.clientId !== "all" && Number(item.cliente_id) !== Number(filter.clientId)) return false;
    const [year, month] = String(item.data_publicacao || "").split("-").map(Number);
    return String(year || "") === String(filter.year) && String((month || 1) - 1) === String(filter.month);
  });
}

function getFilteredCampaigns(role) {
  const filter = getTrafficReportFilter(role);
  return trafficCampaigns.filter((item) => {
    if (filter.clientId && filter.clientId !== "all" && Number(item.cliente_id) !== Number(filter.clientId)) return false;
    const [year, month] = String(item.data_inicio || "").split("-").map(Number);
    return String(year || "") === String(filter.year) && String((month || 1) - 1) === String(filter.month);
  });
}

function buildContentMetrics(items) {
  const published = items.filter((item) => String(item.status || "").toLowerCase() === "publicado").length;
  const pending = items.length - published;
  return {
    total: items.length,
    published,
    pending,
    uniqueClients: new Set(items.map((item) => Number(item.cliente_id)).filter(Boolean)).size,
    byPeriod: groupCounts(items, (item) => formatShortDate(item.data_publicacao)),
    byClient: groupCounts(items, (item) => getClientNameById(item.cliente_id)),
    byType: groupCounts(items, (item) => capitalize(item.tipo || "outro")),
  };
}

function buildTrafficMetrics(items) {
  const totals = items.reduce((acc, item) => {
    acc.budget += Number(item.orcamento_numero || parseCurrencyValue(item.orcamento || 0));
    acc.clicks += Number(item.cliques || 0);
    acc.impressions += Number(item.impressoes || 0);
    acc.conversions += Number(item.conversoes || 0);
    return acc;
  }, { budget: 0, clicks: 0, impressions: 0, conversions: 0 });
  return {
    ...totals,
    avgCostPerResult: totals.conversions ? totals.budget / totals.conversions : 0,
    byPlatform: groupCounts(items, (item) => item.plataforma || "Nao informado"),
    byClient: groupCounts(items, (item) => getClientNameById(item.cliente_id)),
  };
}

function groupCounts(items, getKey) {
  const grouped = items.reduce((acc, item) => {
    const key = String(getKey(item) || "Nao informado");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(grouped).length ? grouped : { "Sem dados": 0 };
}

function getClientNameById(clientId) {
  const client = getClientUsers().find((item) => Number(item.id) === Number(clientId));
  return client?.nome || "Sem cliente";
}

function buildReportMonthOptions() {
  const options = monthOptions().map((label, index) => ({ value: String(index), label }));
  return options;
}

function buildReportYearOptions() {
  const years = new Set([new Date().getFullYear()]);
  [...contentItems, ...trafficCampaigns].forEach((item) => {
    const value = item.data_publicacao || item.data_inicio;
    const year = Number(String(value || "").split("-")[0] || 0);
    if (year) years.add(year);
  });
  return [...years].sort((a, b) => a - b);
}

function renderReportFilterSelect(filterId, selectedValue, clients, role) {
  if (role === "cliente") return "";
  return `
    <label class="filter-box filter-select calendar-filter">
      <select data-report-filter="${filterId}">
        <option value="all">Todos os clientes</option>
        ${clients.map((client) => `<option value="${client.id}" ${String(selectedValue) === String(client.id) ? "selected" : ""}>${escapeHtml(client.nome)}</option>`).join("")}
      </select>
      ${icon("chevronDown")}
    </label>
  `;
}

function renderMonthFilterSelect(filterId, selectedValue, months) {
  return `
    <label class="filter-box filter-select calendar-filter">
      <select data-report-filter="${filterId}">
        ${months.map((month) => `<option value="${month.value}" ${String(selectedValue) === String(month.value) ? "selected" : ""}>${month.label}</option>`).join("")}
      </select>
      ${icon("chevronDown")}
    </label>
  `;
}

function renderYearFilterSelect(filterId, selectedValue, years) {
  return `
    <label class="filter-box filter-select calendar-filter">
      <select data-report-filter="${filterId}">
        ${years.map((year) => `<option value="${year}" ${String(selectedValue) === String(year) ? "selected" : ""}>${year}</option>`).join("")}
      </select>
      ${icon("chevronDown")}
    </label>
  `;
}

function renderMetricCardSimple(item) {
  return `<article class="metric-card"><div class="metric-top"><span class="metric-icon blue">${icon(item.icon)}</span></div><p class="metric-label">${item.label}</p><p class="metric-value">${item.value}</p></article>`;
}

function renderContentTable(items, role) {
  return `
    <div class="report-table-wrap">
      <div class="report-table-head"><h3>Conteúdos do período</h3><span>${items.length} registro(s)</span></div>
      <div class="report-list">
        ${items.length ? items.map((item) => `
          <article class="report-row">
            <div><strong>${escapeHtml(item.titulo)}</strong><span>${escapeHtml(capitalize(item.tipo))}</span></div>
            <div><span>${escapeHtml(getClientNameById(item.cliente_id))}</span><small>${escapeHtml(item.data_publicacao || "-")}</small></div>
            <div><span class="status-pill ${String(item.status) === "publicado" ? "status-done" : "status-pending"}">${capitalize(item.status)}</span></div>
            ${role === "admin" ? `<div class="row-actions"><button class="icon-action" data-action="edit-content" data-value="${item.id}">${icon("edit")}</button><button class="icon-action" data-action="delete-content" data-value="${item.id}">${icon("trash")}</button></div>` : ""}
          </article>
        `).join("") : `<div class="empty-notice">Nenhum conteúdo encontrado para este filtro.</div>`}
      </div>
    </div>
  `;
}

function renderCampaignTable(items, role) {
  return `
    <div class="report-table-wrap">
      <div class="report-table-head"><h3>Campanhas do período</h3><span>${items.length} registro(s)</span></div>
      <div class="report-list">
        ${items.length ? items.map((item) => `
          <article class="report-row">
            <div><strong>${escapeHtml(item.nome)}</strong><span>${escapeHtml(item.plataforma)}</span></div>
            <div><span>${escapeHtml(getClientNameById(item.cliente_id))}</span><small>${escapeHtml(item.data_inicio || "-")} até ${escapeHtml(item.data_fim || "-")}</small></div>
            <div><strong>${formatCurrency(item.custo_resultado || 0)}</strong><small>custo por resultado</small></div>
            ${role === "admin" ? `<div class="row-actions"><button class="icon-action" data-action="edit-campaign" data-value="${item.id}">${icon("edit")}</button><button class="icon-action" data-action="delete-campaign" data-value="${item.id}">${icon("trash")}</button></div>` : ""}
          </article>
        `).join("") : `<div class="empty-notice">Nenhuma campanha encontrada para este filtro.</div>`}
      </div>
    </div>
  `;
}

function renderCampaignSummaries(items) {
  if (!items.length) {
    return `<div class="empty-notice">Nenhuma campanha encontrada para este filtro.</div>`;
  }

  return items.map((item) => `
    <div class="report-summary-item report-summary-item-stack">
      <div>
        <strong>${escapeHtml(item.nome)}</strong>
        <small>${escapeHtml(item.plataforma)} • ${escapeHtml(getClientNameById(item.cliente_id))}</small>
      </div>
      <div class="report-summary-meta">
        <span>${String(item.cliques || 0)} cliques</span>
        <span>${String(item.impressoes || 0)} impressões</span>
        <span>${String(item.conversoes || 0)} conversões</span>
        <strong>${formatCurrency(item.custo_resultado || 0)}</strong>
      </div>
    </div>
  `).join("");
}

function renderCampaignPerformanceChart(items) {
  if (!items.length) {
    return `<div class="empty-notice">Nenhuma campanha encontrada para este filtro.</div>`;
  }

  const maxClicks = Math.max(...items.map((item) => Number(item.cliques || 0)), 1);
  const maxConversions = Math.max(...items.map((item) => Number(item.conversoes || 0)), 1);
  const maxBudget = Math.max(...items.map((item) => Number(item.orcamento_numero || parseCurrency(item.orcamento || 0))), 1);

  return `
    <div class="campaign-chart">
      ${items.map((item) => {
        const clicks = Number(item.cliques || 0);
        const conversions = Number(item.conversoes || 0);
        const budget = Number(item.orcamento_numero || parseCurrency(item.orcamento || 0));
        return `
          <article class="campaign-chart-row">
            <div class="campaign-chart-head">
              <div>
                <strong>${escapeHtml(item.nome)}</strong>
                <small>${escapeHtml(item.plataforma)} • ${escapeHtml(getClientNameById(item.cliente_id))}</small>
              </div>
              <span>${formatCurrency(budget)}</span>
            </div>
            <div class="campaign-chart-metrics">
              <div class="campaign-bar-wrap">
                <span>Cliques</span>
                <div class="campaign-bar-track">
                  <div class="campaign-bar campaign-bar-clicks" style="width:${Math.max((clicks / maxClicks) * 100, clicks ? 8 : 0)}%"></div>
                </div>
                <strong>${clicks}</strong>
              </div>
              <div class="campaign-bar-wrap">
                <span>Conversões</span>
                <div class="campaign-bar-track">
                  <div class="campaign-bar campaign-bar-conversions" style="width:${Math.max((conversions / maxConversions) * 100, conversions ? 8 : 0)}%"></div>
                </div>
                <strong>${conversions}</strong>
              </div>
              <div class="campaign-bar-wrap">
                <span>Orçamento</span>
                <div class="campaign-bar-track">
                  <div class="campaign-bar campaign-bar-budget" style="width:${Math.max((budget / maxBudget) * 100, budget ? 8 : 0)}%"></div>
                </div>
                <strong>${formatCurrency(budget)}</strong>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderRecurrenceFields(event = null) {
  const recurrence = event?.recurrence || {
    type: "none",
    interval: 1,
    unit: "weekly",
    weekdays: [],
    dayOfMonth: Number(String(event?.date || state.ui.adminSelectedDate).split("-")[2] || 1),
    endDate: "",
  };
  return `
    <div class="field">
      <label>Repeticao</label>
      <select name="recurrenceType">
        ${[
          ["none", "Sem repeticao"],
          ["daily", "Diario"],
          ["weekly", "Semanal"],
          ["monthly", "Mensal"],
        ].map(([value, label]) => `<option value="${value}" ${recurrence.type === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
    </div>
    <input type="hidden" name="recurrenceInterval" value="1" />
    <input type="hidden" name="recurrenceUnit" value="${escapeHtml(recurrence.unit || "weekly")}" />
    <div class="field">
      <label>Dias da semana</label>
      <div class="field-hint">Use apenas para repeticao semanal. Se nada for marcado, o sistema usa o mesmo dia da data escolhida.</div>
      <div class="weekday-picker">
        ${["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((label, index) => `
          <label class="weekday-chip ${recurrence.weekdays?.includes(index) ? "is-selected" : ""}">
            <input type="checkbox" name="recurrenceWeekdays" value="${index}" ${recurrence.weekdays?.includes(index) ? "checked" : ""} />
            <span>${label}</span>
          </label>
        `).join("")}
      </div>
    </div>
    <input type="hidden" name="recurrenceDayOfMonth" value="${escapeHtml(String(recurrence.dayOfMonth || 1))}" />
    <div class="field">
      <label>Fim da repeticao</label>
      <input name="recurrenceEndDate" type="date" value="${escapeHtml(recurrence.endDate || "")}" />
    </div>
  `;
}

function getTasksForCalendar(role) {
  const base = role === "cliente" && state.session?.id
    ? calendarTasks.filter((task) => (task.clientIds || []).map(Number).includes(Number(state.session.id)))
    : [...calendarTasks];

  if (role === "admin" && state.ui.adminClientFilter !== "all") {
    return base.filter((task) => (task.clientIds || []).map(Number).includes(Number(state.ui.adminClientFilter)));
  }

  return base;
}

function getTasksForDate(tasks, date) {
  return tasks
    .filter((task) => task.date === date)
    .sort(compareTasks);
}

function compareTasks(a, b) {
  return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
}

function handleCalendarFilter(filter, value) {
  if (filter === "admin-client") {
    state.ui.adminClientFilter = value;
  }
  if (filter === "admin-month") {
    state.ui.adminVisibleMonth = getMonthStartIso(setMonthOnIso(state.ui.adminVisibleMonth, Number(value)));
    state.ui.adminSelectedDate = state.ui.adminVisibleMonth;
  }
  if (filter === "admin-year") {
    state.ui.adminVisibleMonth = getMonthStartIso(setYearOnIso(state.ui.adminVisibleMonth, Number(value)));
    state.ui.adminSelectedDate = state.ui.adminVisibleMonth;
  }
  if (filter === "client-month") {
    state.ui.clientVisibleMonth = getMonthStartIso(setMonthOnIso(state.ui.clientVisibleMonth, Number(value)));
    state.ui.clientSelectedDate = state.ui.clientVisibleMonth;
  }
  if (filter === "client-year") {
    state.ui.clientVisibleMonth = getMonthStartIso(setYearOnIso(state.ui.clientVisibleMonth, Number(value)));
    state.ui.clientSelectedDate = state.ui.clientVisibleMonth;
  }
  renderRoute();
}

function handleReportFilter(filter, value) {
  if (filter === "reports-client") state.ui.reportsClientFilter = value;
  if (filter === "reports-month") state.ui.reportsMonthFilter = value;
  if (filter === "reports-year") state.ui.reportsYearFilter = value;
  if (filter === "traffic-client") state.ui.trafficClientFilter = value;
  if (filter === "traffic-month") state.ui.trafficMonthFilter = value;
  if (filter === "traffic-year") state.ui.trafficYearFilter = value;
  renderRoute();
}

function getCalendarCells(visibleMonth) {
  const start = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const end = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
  const startWeekday = start.getDay();
  const totalCells = Math.ceil((startWeekday + end.getDate()) / 7) * 7;
  const cells = [];

  for (let index = 0; index < totalCells; index += 1) {
    const date = new Date(start);
    date.setDate(index - startWeekday + 1);
    cells.push({
      date,
      inMonth: date.getMonth() === visibleMonth.getMonth(),
    });
  }

  return cells;
}

function parseIsoDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year || new Date().getFullYear(), (month || 1) - 1, day || 1);
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthStartIso(date) {
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

function getTodayIso() {
  return toIsoDate(new Date());
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function formatMonthYear(date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

function formatFullDate(isoDate) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(parseIsoDate(isoDate));
}

function formatMonthYearShort(isoDate) {
  if (!isoDate) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" }).format(parseIsoDate(isoDate));
}

function formatShortDate(isoDate) {
  if (!isoDate) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(parseIsoDate(isoDate));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function parseCurrencyValue(value) {
  const normalized = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Number(normalized || 0);
}

function monthOptions() {
  return ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
}

function buildYearOptions(tasks) {
  const years = new Set([parseIsoDate(getTodayIso()).getFullYear()]);
  tasks.forEach((task) => years.add(parseIsoDate(task.date).getFullYear()));
  const current = parseIsoDate(getTodayIso()).getFullYear();
  years.add(current - 1);
  years.add(current + 1);
  return [...years].sort((a, b) => a - b);
}

function setMonthOnIso(isoDate, month) {
  const date = parseIsoDate(isoDate);
  return new Date(date.getFullYear(), month, 1);
}

function setYearOnIso(isoDate, year) {
  const date = parseIsoDate(isoDate);
  return new Date(year, date.getMonth(), 1);
}

function isSameDateIso(a, b) {
  return String(a) === String(b);
}

function taskToneClass(type) {
  if (type === "ligacao") return "task-tone-green";
  if (type === "prazo") return "task-tone-red";
  if (type === "tarefa") return "task-tone-purple";
  return "task-tone-blue";
}

function colorByEventType(type) {
  if (type === "ligacao") return "#22c55e";
  if (type === "tarefa") return "#a855f7";
  if (type === "prazo") return "#ef4444";
  return "#2563eb";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function activityStatusClass(key) {
  const map = {
    done: "status-done",
    scheduled: "status-scheduled",
    pending: "status-pending",
  };
  return map[key] || "";
}

function activityStatusKeyFromLabel(label) {
  if (label === "Concluida") return "done";
  if (label === "Pendente") return "pending";
  return "scheduled";
}

function activityColorByIcon(iconName) {
  if (iconName === "phone") return "green";
  if (iconName === "mail") return "purple";
  return "blue";
}

function readSession() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem("fokal-v3-session") || "null");
    return parsed && parsed.token ? parsed : null;
  } catch {
    return null;
  }
}

function getAuthHeaders() {
  return state.session?.token ? { Authorization: `Bearer ${state.session.token}` } : {};
}

function writeSession(session) {
  window.localStorage.setItem("fokal-v3-session", JSON.stringify(session));
}

function readRememberedLogin(role) {
  try {
    return JSON.parse(window.localStorage.getItem(`fokal-v3-login-${role}`) || "null") || {};
  } catch {
    return {};
  }
}

function writeRememberedLogin(role, email) {
  window.localStorage.setItem(`fokal-v3-login-${role}`, JSON.stringify({ email }));
}

function clearRememberedLogin(role) {
  window.localStorage.removeItem(`fokal-v3-login-${role}`);
}

function clearSession() {
  state.session = null;
  window.localStorage.removeItem("fokal-v3-session");
}

function dashboardRevenueChart() {
  const series = getFinanceMonthlyProfitSeries();
  const values = series.map((item) => item.lucro);
  const maxAbs = Math.max(...values.map((value) => Math.abs(value)), 1);
  const left = 58;
  const right = 678;
  const top = 36;
  const bottom = 270;
  const width = right - left;
  const zeroY = top + ((maxAbs - 0) / (maxAbs * 2)) * (bottom - top);
  const stepX = series.length > 1 ? width / (series.length - 1) : 0;
  const points = series.map((item, index) => {
    const x = left + stepX * index;
    const y = top + ((maxAbs - item.lucro) / (maxAbs * 2)) * (bottom - top);
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const labels = [maxAbs, Math.round(maxAbs / 2), 0, -Math.round(maxAbs / 2), -maxAbs];
  const yForValue = (value) => top + ((maxAbs - value) / (maxAbs * 2)) * (bottom - top);

  return `
    <svg viewBox="0 0 720 320" aria-hidden="true">
      <g stroke="#e9edf5" stroke-dasharray="3 5">
        ${labels.map((value) => `<line x1="${left}" y1="${yForValue(value)}" x2="690" y2="${yForValue(value)}"></line>`).join("")}
      </g>
      <g stroke="#e9edf5" stroke-dasharray="3 5">
        ${points.map((point) => `<line x1="${point.x}" y1="${top}" x2="${point.x}" y2="${bottom}"></line>`).join("")}
      </g>
      <line x1="${left}" y1="${zeroY}" x2="690" y2="${zeroY}" stroke="#cbd5e1" stroke-width="2"></line>
      <path d="${path}" stroke="#1758c8" stroke-width="4"></path>
      ${points
        .map((point) => `<circle cx="${point.x}" cy="${point.y}" r="7" fill="#ffffff" stroke="#1758c8" stroke-width="4"></circle>`)
        .join("")}
      <g fill="#7b8798" stroke="none" font-size="14">
        ${labels.map((value) => `<text x="${value >= 0 ? 24 : 18}" y="${yForValue(value) + 5}">${formatCompactMoney(value)}</text>`).join("")}
        ${points.map((point) => `<text x="${point.x - 14}" y="298">${capitalize(point.label)}</text>`).join("")}
      </g>
    </svg>
  `;
}

function formatCompactMoney(value) {
  const abs = Math.abs(Number(value || 0));
  const prefix = Number(value || 0) < 0 ? "-" : "";
  if (abs >= 1000) return `${prefix}${Math.round(abs / 1000)}k`;
  return `${prefix}${Math.round(abs)}`;
}

function reportsAreaChart() {
  return `
    <svg viewBox="0 0 720 320" aria-hidden="true">
      <g stroke="#e9edf5" stroke-dasharray="3 5">
        <line x1="58" y1="30" x2="690" y2="30"></line>
        <line x1="58" y1="90" x2="690" y2="90"></line>
        <line x1="58" y1="150" x2="690" y2="150"></line>
        <line x1="58" y1="210" x2="690" y2="210"></line>
        <line x1="58" y1="270" x2="690" y2="270"></line>
      </g>
      <path d="M58 150 L180 122 L300 85 L420 140 L540 100 L680 55 L680 270 L58 270 Z" fill="rgba(23,88,200,0.18)" stroke="none"></path>
      <path d="M58 150 L180 122 L300 85 L420 140 L540 100 L680 55" stroke="#6da0ff" stroke-width="3"></path>
      <g fill="#7b8798" stroke="none" font-size="14">
        <text x="44" y="275">0</text>
        <text x="36" y="214">20000</text>
        <text x="36" y="154">40000</text>
        <text x="36" y="94">60000</text>
        <text x="36" y="34">80000</text>
        <text x="42" y="298">Out</text><text x="166" y="298">Nov</text><text x="290" y="298">Dez</text><text x="414" y="298">Jan</text><text x="538" y="298">Fev</text><text x="662" y="298">Mar</text>
      </g>
    </svg>
  `;
}

function productBarChart() {
  return `
    <svg viewBox="0 0 720 320" aria-hidden="true">
      <g stroke="#e9edf5" stroke-dasharray="3 5">
        <line x1="160" y1="40" x2="680" y2="40"></line>
        <line x1="160" y1="90" x2="680" y2="90"></line>
        <line x1="160" y1="140" x2="680" y2="140"></line>
        <line x1="160" y1="190" x2="680" y2="190"></line>
        <line x1="160" y1="240" x2="680" y2="240"></line>
        <line x1="160" y1="290" x2="680" y2="290"></line>
      </g>
      ${[
        ["Consultoria Cloud", 600, 52],
        ["Licencas Software", 478, 102],
        ["Customizacao", 412, 152],
        ["Treinamento", 262, 202],
        ["Suporte", 228, 252],
      ]
        .map(([label, width, y]) => `<text x="32" y="${y + 12}" fill="#667085" stroke="none" font-size="14">${label}</text><rect x="160" y="${y}" width="${width - 160}" height="36" rx="10" fill="#4b84e7"></rect>`)
        .join("")}
      <g fill="#7b8798" stroke="none" font-size="14">
        <text x="156" y="312">0</text><text x="252" y="312">35000</text><text x="382" y="312">70000</text><text x="492" y="312">105000</text><text x="632" y="312">140000</text>
      </g>
    </svg>
  `;
}

function icon(name) {
  const icons = {
    grid: `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6"></rect><rect x="14" y="4" width="6" height="6"></rect><rect x="4" y="14" width="6" height="6"></rect><rect x="14" y="14" width="6" height="6"></rect></svg>`,
    users: `<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="9.5" cy="7" r="3"></circle><path d="M20 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 4.13a3 3 0 0 1 0 5.74"></path></svg>`,
    trend: `<svg viewBox="0 0 24 24"><path d="m4 16 6-6 4 4 6-8"></path><path d="M20 10V4h-6"></path></svg>`,
    checksquare: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="m9 12 2 2 4-4"></path></svg>`,
    calendar: `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4"></path><path d="M8 3v4"></path><path d="M3 11h18"></path></svg>`,
    chart: `<svg viewBox="0 0 24 24"><path d="M4 20V10"></path><path d="M10 20V4"></path><path d="M16 20v-6"></path><path d="M22 20H2"></path></svg>`,
    building: `<svg viewBox="0 0 24 24"><path d="M6 22V4h8v18"></path><path d="M14 10h4v12"></path><path d="M10 7H8"></path><path d="M10 11H8"></path><path d="M10 15H8"></path><path d="M14 15h4"></path></svg>`,
    user: `<svg viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="8" r="4"></circle></svg>`,
    arrowLeft: `<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"></path></svg>`,
    login: `<svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5"></path><path d="M15 12H3"></path><path d="M21 21V3"></path></svg>`,
    money: `<svg viewBox="0 0 24 24"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    target: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="4"></circle><circle cx="12" cy="12" r="1"></circle></svg>`,
    pulse: `<svg viewBox="0 0 24 24"><path d="M3 12h4l2-5 4 10 2-5h6"></path></svg>`,
    trendUp: `<svg viewBox="0 0 24 24"><path d="m4 14 5-5 4 4 7-7"></path><path d="M14 6h6v6"></path></svg>`,
    trendDown: `<svg viewBox="0 0 24 24"><path d="m4 10 5 5 4-4 7 7"></path><path d="M14 18h6v-6"></path></svg>`,
    phone: `<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.88.32 1.75.59 2.59a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.49-1.25a2 2 0 0 1 2.11-.45c.84.27 1.71.47 2.59.59A2 2 0 0 1 22 16.92z"></path></svg>`,
    mail: `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>`,
    clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v5l3 2"></path></svg>`,
    plus: `<svg viewBox="0 0 24 24"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>`,
    search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>`,
    filter: `<svg viewBox="0 0 24 24"><path d="M3 5h18"></path><path d="M6 12h12"></path><path d="M10 19h4"></path></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"></path></svg>`,
    chevronLeft: `<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"></path></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></svg>`,
    eye: `<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    x: `<svg viewBox="0 0 24 24"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
    spinner: `<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3.2-6.9"></path></svg>`,
    settings: `<svg viewBox="0 0 24 24"><path d="M10.2 2h3.6l1 2.6 2.6.8 2.3-1.5 2.5 2.5-1.5 2.3.8 2.6 2.5 1v3.6l-2.5 1-.8 2.6 1.5 2.3-2.5 2.5-2.3-1.5-2.6.8-1 2.5h-3.6l-1-2.5-2.6-.8-2.3 1.5-2.5-2.5 1.5-2.3-.8-2.6-2.5-1v-3.6l2.5-1 .8-2.6-1.5-2.3 2.5-2.5 2.3 1.5 2.6-.8 1-2.6Z"></path><circle cx="12" cy="12" r="3.2"></circle></svg>`,
    message: `<svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.91-.39-4.13-1.07L3 20l1.2-5.07A8.5 8.5 0 1 1 21 11.5z"></path></svg>`,
    edit: `<svg viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`,
    trash: `<svg viewBox="0 0 24 24"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>`,
    logout: `<svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><path d="M10 17l5-5-5-5"></path><path d="M15 12H3"></path></svg>`,
    download: `<svg viewBox="0 0 24 24"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>`,
  };
  return icons[name] || "";
}

loadBootstrap();
