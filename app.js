const app = document.querySelector("#app");
const topnav = document.querySelector("#topnav");

const data = {
  admin: {
    events: [
      {
        date: "14 Abr",
        title: "Reunião de alinhamento com Aurora",
        description: "Validar andamento do cronograma, aprovar pauta e revisar pontos críticos.",
      },
      {
        date: "17 Abr",
        title: "Fechamento financeiro da quinzena",
        description: "Consolidar faturamento, despesas e margem operacional dos clientes ativos.",
      },
      {
        date: "22 Abr",
        title: "Entrega de mídia do mês",
        description: "Checklist final antes de liberar mídia e relatório para os clientes.",
      },
      {
        date: "28 Abr",
        title: "Planejamento do próximo ciclo",
        description: "Organizar visão macro de maio com prioridades, campanhas e roteiros.",
      },
    ],
    finance: [
      { label: "Entradas / Faturamento", value: "R$ 48.600", note: "3 contratos ativos neste ciclo" },
      { label: "Saídas / Despesas Totais", value: "R$ 19.450", note: "Operação, mídia e fornecedores" },
      { label: "Despesas Fixas e Variáveis", value: "R$ 13.980", note: "Separadas para leitura operacional" },
      { label: "Saldo", value: "R$ 29.150", note: "Margem confortável para expansão" },
    ],
    clients: [
      {
        id: "aurora",
        name: "Aurora Studio",
        segment: "Marca de moda",
        status: "Em execução",
        months: ["abril-2026", "maio-2026", "junho-2026"],
      },
      {
        id: "atlas",
        name: "Atlas Engenharia",
        segment: "Serviços B2B",
        status: "Planejamento",
        months: ["abril-2026", "maio-2026"],
      },
      {
        id: "soma",
        name: "Soma Wellness",
        segment: "Saúde e bem-estar",
        status: "Em aprovação",
        months: ["abril-2026", "maio-2026", "junho-2026"],
      },
      {
        id: "viva",
        name: "Viva Foods",
        segment: "Alimentos",
        status: "Ativo",
        months: ["abril-2026", "maio-2026"],
      },
    ],
  },
  client: {
    currentMonth: "abril-2026",
    months: [
      {
        slug: "abril-2026",
        label: "Abril 2026",
        summary: "Mês focado em consistência de marca, entregas de campanha e leitura de resultado.",
        modules: [
          {
            name: "Documentos",
            status: "Atualizado hoje",
            description: "Contratos, briefing, aprovações e arquivos-base centralizados.",
            bullets: ["Briefing estratégico aprovado", "Checklist operacional fechado", "Links de pasta e referências"],
          },
          {
            name: "Cronograma",
            status: "3 marcos da semana",
            description: "Organização de entregas, revisões e datas-chave do ciclo mensal.",
            bullets: ["Captação no dia 16", "Aprovação final no dia 21", "Publicação principal no dia 25"],
          },
          {
            name: "Roteiros",
            status: "2 em revisão",
            description: "Estrutura narrativa dos conteúdos previstos para o mês.",
            bullets: ["Roteiro institucional", "Roteiro de campanha sazonal", "Ajustes de CTA e timing"],
          },
          {
            name: "Mídia",
            status: "4 peças prontas",
            description: "Peças, formatos e materiais visuais organizados por objetivo.",
            bullets: ["Carrossel principal", "Stories de apoio", "Variações de criativo"],
          },
          {
            name: "Análise de Resultados",
            status: "Parcial disponível",
            description: "Leitura resumida de desempenho, alcance e próximos movimentos.",
            bullets: ["Aumento de 18% no alcance", "Melhora no engajamento", "Recomendação para ampliar retargeting"],
          },
        ],
      },
      {
        slug: "maio-2026",
        label: "Maio 2026",
        summary: "Ciclo orientado a aceleração de campanha e refinamento de posicionamento.",
        modules: [
          {
            name: "Documentos",
            status: "Preparando",
            description: "Base documental do novo ciclo em organização.",
            bullets: ["Nova pauta em aprovação", "Briefing de campanha em rascunho", "Central de assets revisada"],
          },
          {
            name: "Cronograma",
            status: "Em montagem",
            description: "Próximas datas já sugeridas para produção, revisão e entrega.",
            bullets: ["Kickoff no dia 03", "Captação prevista para 10", "Relatório final no dia 29"],
          },
          {
            name: "Roteiros",
            status: "1 pronto",
            description: "Novas peças sendo construídas com foco em performance.",
            bullets: ["Roteiro manifesto aprovado", "Roteiro promocional em andamento"],
          },
          {
            name: "Mídia",
            status: "Pré-produção",
            description: "Planejamento visual do próximo lote de conteúdos.",
            bullets: ["Moodboard definido", "Referências de enquadramento", "Mapeamento de formatos"],
          },
          {
            name: "Análise de Resultados",
            status: "Aguardando fechamento",
            description: "Área reservada para leitura consolidada no fim do ciclo.",
            bullets: ["Resumo executivo será publicado no fechamento"],
          },
        ],
      },
      {
        slug: "junho-2026",
        label: "Junho 2026",
        summary: "Prévia de planejamento já aberta para visão futura do cliente.",
        modules: [
          {
            name: "Documentos",
            status: "Reservado",
            description: "Espaço pronto para receber materiais do próximo trimestre.",
            bullets: ["Pasta estrutural criada"],
          },
          {
            name: "Cronograma",
            status: "Rascunho",
            description: "Primeiros marcos serão definidos após aprovação de maio.",
            bullets: ["Dependente do fechamento anterior"],
          },
          {
            name: "Roteiros",
            status: "Sem itens",
            description: "Roteiros entram aqui assim que o planejamento for validado.",
            bullets: ["Aguardando pauta"],
          },
          {
            name: "Mídia",
            status: "Sem itens",
            description: "Área preparada para receber peças e formatos futuros.",
            bullets: ["Aguardando definição visual"],
          },
          {
            name: "Análise de Resultados",
            status: "Sem leitura",
            description: "Resultados serão disponibilizados ao longo do ciclo.",
            bullets: ["Painel será alimentado durante a execução"],
          },
        ],
      },
    ],
  },
};

const navItems = [
  { label: "Início", href: "/" },
  { label: "Admin", href: "/admin" },
  { label: "Cliente", href: "/cliente" },
];

document.body.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-link]");

  if (!trigger) {
    return;
  }

  const href = trigger.getAttribute("href");

  if (!href) {
    return;
  }

  event.preventDefault();
  navigate(href);
});

window.addEventListener("popstate", renderRoute);

function navigate(path) {
  window.history.pushState({}, "", path);
  renderRoute();
}

function renderTopnav(pathname) {
  topnav.innerHTML = navItems
    .map((item) => {
      const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
      return `<a class="nav-pill ${isActive ? "is-active" : ""}" data-link href="${item.href}">${item.label}</a>`;
    })
    .join("");
}

function renderRoute() {
  const pathname = window.location.pathname;
  renderTopnav(pathname);

  if (pathname === "/") {
    app.innerHTML = renderHome();
    return;
  }

  if (pathname === "/admin") {
    app.innerHTML = renderAdminDashboard();
    return;
  }

  if (pathname.startsWith("/admin/cliente/")) {
    const [, , , clientId, monthSlug] = pathname.split("/");
    app.innerHTML = renderAdminMonthDetail(clientId, monthSlug);
    return;
  }

  if (pathname === "/cliente") {
    app.innerHTML = renderClientDashboard();
    return;
  }

  if (pathname.startsWith("/cliente/")) {
    const monthSlug = pathname.split("/")[2];
    app.innerHTML = renderClientMonth(monthSlug);
    return;
  }

  app.innerHTML = `
    <section class="panel empty-state">
      <p class="eyebrow">Rota não encontrada</p>
      <h1>Essa página não existe no protótipo.</h1>
      <p>Use a navegação principal para voltar à experiência de admin ou cliente.</p>
      <div class="hero-actions">
        <a class="button button-primary" data-link href="/">Voltar para a home</a>
      </div>
    </section>
  `;
}

function renderHome() {
  return `
    <section class="hero">
      <article class="hero-copy card">
        <p class="eyebrow">Sistema Fokal</p>
        <h1>Duas experiências, uma operação organizada.</h1>
        <p>
          Este protótipo separa claramente a visão interna do time e a visão do cliente.
          A entrada leva para um ambiente operacional completo de admin ou para uma
          área mensal mais leve, pensada para acompanhamento e entregáveis.
        </p>
        <div class="hero-actions">
          <a class="button button-primary" data-link href="/admin">Entrar como admin</a>
          <a class="button button-secondary" data-link href="/cliente">Entrar como cliente</a>
        </div>
      </article>
      <aside class="hero-map card">
        <div class="map-node admin">
          <strong>Admin</strong>
          <span>Calendário, financeiro e gestão completa por cliente e mês.</span>
        </div>
        <div class="map-node client">
          <strong>Cliente</strong>
          <span>Documentos, cronograma, roteiros, mídia e análise do mês.</span>
        </div>
        <div class="map-node">
          <strong>Objetivo da v1</strong>
          <span>Validar fluxo, narrativa visual e leitura rápida sem backend real.</span>
        </div>
      </aside>
    </section>
    <section class="profile-entry">
      <article class="persona-card admin">
        <span class="persona-pill">Tela Admin</span>
        <div>
          <h2>Operação, controle e visão tática.</h2>
          <p class="muted">
            Ambiente pensado para acompanhar agenda, números principais e a operação
            mensal de cada cliente a partir de uma mesma tela.
          </p>
        </div>
        <div class="persona-actions">
          <a class="button button-primary" data-link href="/admin">Ver dashboard admin</a>
        </div>
      </article>
      <article class="persona-card client">
        <span class="persona-pill">Tela Cliente</span>
        <div>
          <h2>Acompanhamento simples e confiante.</h2>
          <p class="muted">
            Área voltada para o cliente navegar por mês e acessar rapidamente os
            materiais e resultados do ciclo atual.
          </p>
        </div>
        <div class="persona-actions">
          <a class="button button-secondary" data-link href="/cliente">Ver área do cliente</a>
        </div>
      </article>
    </section>
  `;
}

function renderAdminDashboard() {
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
          <a class="button button-secondary" data-link href="/admin/cliente/${client.id}/${latestMonth}">
            Abrir mês mais recente
          </a>
        </article>
      `;
    })
    .join("");

  return `
    <section class="dashboard">
      <header class="page-title">
        <p class="eyebrow">Admin</p>
        <h1>Painel operacional da Fokal.</h1>
        <p>
          Uma visão única para organizar calendário, acompanhar financeiro e entrar
          no detalhe mensal dos clientes sem perder o panorama da operação.
        </p>
      </header>
      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-header">
            <div>
              <span class="section-kicker">Calendário</span>
              <h2>Agenda estratégica da semana</h2>
              <p>Bloco de leitura rápida para alinhar entregas, aprovações e fechamento.</p>
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
              <p>Resumo dos indicadores principais para gestão interna.</p>
            </div>
          </div>
          <div class="metrics-grid">
            ${data.admin.finance
              .map(
                (item) => `
                  <article class="metric-card admin">
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
            <span class="section-kicker">Gestão Cliente &gt; Mês</span>
            <h2>Clientes ativos e visão mensal</h2>
            <p>Entre no mês de cada cliente para ver documentos, cronograma, roteiros, mídia e análise.</p>
          </div>
        </div>
        <div class="clients-grid">
          ${clientCards}
        </div>
      </section>
    </section>
  `;
}

function renderAdminMonthDetail(clientId, monthSlug) {
  const client = data.admin.clients.find((item) => item.id === clientId);
  const month = getMonth(monthSlug);

  if (!client || !month) {
    return renderNotFoundMonth();
  }

  return `
    <section class="month-layout">
      <aside class="month-sidebar">
        <section class="panel">
          <p class="eyebrow">Admin &gt; Cliente</p>
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
            <a class="button button-primary" data-link href="/cliente/${month.slug}">Ver visão do cliente</a>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Meses disponíveis</h2>
              <p>Atalhos para navegar pela operação do cliente.</p>
            </div>
          </div>
          <div class="months-grid">
            ${client.months
              .map(
                (slug) => `
                  <a class="month-card ${slug === month.slug ? "active" : ""}" data-link href="/admin/cliente/${client.id}/${slug}">
                    <strong>${formatMonthLabel(slug)}</strong>
                    <p>Abrir visão administrativa do ciclo.</p>
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
                  <ul>
                    ${module.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
                  </ul>
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
  const currentMonth = getMonth(data.client.currentMonth);

  return `
    <section class="dashboard">
      <header class="page-title">
        <p class="eyebrow">Cliente</p>
        <h1>Seu acompanhamento mensal, sem ruído.</h1>
        <p>
          Um ambiente mais leve para acessar documentos, cronograma, roteiros,
          mídia e análise de resultados com clareza e confiança.
        </p>
      </header>
      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-header">
            <div>
              <span class="section-kicker">Mês Atual</span>
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
              <span class="section-kicker">Módulos</span>
              <h2>O que você encontra na área do cliente</h2>
              <p>Leitura rápida do tipo de conteúdo que estará disponível dentro do mês.</p>
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

  if (!month) {
    return renderNotFoundMonth();
  }

  return `
    <section class="month-layout">
      <aside class="month-sidebar">
        <section class="panel">
          <p class="eyebrow">Cliente &gt; Mês</p>
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
            <a class="button button-secondary" data-link href="/cliente">Voltar à visão geral</a>
          </div>
        </section>
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Visão do ciclo</h2>
              <p>Resumo do que está acontecendo neste mês.</p>
            </div>
          </div>
          <ul class="bullet-list">
            <li>Todos os materiais estão organizados por frente de trabalho.</li>
            <li>O cronograma traz datas-chave de produção, revisão e entrega.</li>
            <li>A análise resume os resultados e orienta próximos passos.</li>
          </ul>
        </section>
      </aside>
      <section class="month-overview">
        <header class="page-title">
          <p class="eyebrow">Entregáveis do mês</p>
          <h1>${month.label}</h1>
          <p>Os cinco módulos abaixo representam o núcleo da experiência do cliente neste protótipo.</p>
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
                  <ul>
                    ${module.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
                  </ul>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </section>
  `;
}

function renderNotFoundMonth() {
  return `
    <section class="panel empty-state">
      <p class="eyebrow">Conteúdo não encontrado</p>
      <h1>Esse mês não está disponível no protótipo.</h1>
      <p>Volte para a visão do admin ou do cliente para escolher um ciclo válido.</p>
      <div class="hero-actions">
        <a class="button button-secondary" data-link href="/admin">Ir para admin</a>
        <a class="button button-primary" data-link href="/cliente">Ir para cliente</a>
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
