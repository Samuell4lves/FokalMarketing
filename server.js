require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const { hasSupabaseEnv, getSupabaseClient } = require("./supabase-client");
const {
  expandEventRecords,
  normalizeClientIds,
  normalizeEventRecord,
  normalizeRecurrence,
  parseOccurrenceId,
} = require("./lib/calendar-series");
const {
  summarizeContent,
  summarizeTraffic,
} = require("./lib/reporting");

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const sessionSecret = process.env.SESSION_SECRET || "fokal-dev-session-secret";
const dataFile = path.join(root, "data-store.json");
const planOptions = ["Producao de Conteudo", "Gestao de Trafego", "Ambos"];
const defaultUsers = [
  { id: 1, nome: "Administrador", email: "admin@fokal.com", senha: "admin123", telefone: "(11) 90000-0000", tipo: "Administrador", planType: "Ambos" }
];
const defaultEvents = [];
const defaultContents = [];
const defaultCampaigns = [];
const defaultDeals = [
  { id: 101, title: "Implementacao CRM", value: "R$ 25.000,00", company: "Empresa Alpha", contact: "Marina Lopes", owner: "Joao Silva", date: "15/04", stage: "Prospeccao", status: "Novo lead", description: "Primeira conversa para implantar CRM comercial.", nextAction: "Agendar diagnostico" },
  { id: 102, title: "Sistema de Vendas", value: "R$ 18.000,00", company: "Beta Corp", contact: "Rafael Gomes", owner: "Maria Costa", date: "16/04", stage: "Prospeccao", status: "Mapeamento inicial", description: "Cliente quer centralizar processo de vendas.", nextAction: "Enviar materiais de apresentacao" },
  { id: 103, title: "Dashboard Analytics", value: "R$ 12.000,00", company: "Gamma Ltd", contact: "Bianca Melo", owner: "Pedro Santos", date: "17/04", stage: "Prospeccao", status: "Aguardando retorno", description: "Interesse em dashboards de performance e CAC.", nextAction: "Retomar contato em 48h" },
  { id: 104, title: "Consultoria em Cloud", value: "R$ 45.000,00", company: "Tech Solutions", contact: "Maria Santos", owner: "Joao Silva", date: "14/04", stage: "Qualificacao", status: "Fit validado", description: "Escopo aprovado para ambiente cloud e governanca.", nextAction: "Fechar diagnostico tecnico" },
  { id: 105, title: "Migracao de Dados", value: "R$ 32.000,00", company: "Delta Inc", contact: "Luis Prado", owner: "Maria Costa", date: "15/04", stage: "Qualificacao", status: "Stakeholders mapeados", description: "Necessidade de migrar base legado para novo stack.", nextAction: "Confirmar cronograma de descoberta" },
  { id: 106, title: "Licencas de Software", value: "R$ 52.000,00", company: "Startup Inovadora", contact: "Pedro Costa", owner: "Ana Ferreira", date: "12/04", stage: "Proposta", status: "Proposta enviada", description: "Pacote anual com suporte premium e onboarding.", nextAction: "Negociar prazo de pagamento" },
  { id: 107, title: "Treinamento Equipe", value: "R$ 8.000,00", company: "Epsilon SA", contact: "Camila Rocha", owner: "Pedro Santos", date: "13/04", stage: "Proposta", status: "Em aprovacao", description: "Treinamento comercial focado em conversao e funil.", nextAction: "Aguardar aprovacao do RH" },
  { id: 108, title: "Automacao Marketing", value: "R$ 28.000,00", company: "Zeta Group", contact: "Fernando Luz", owner: "Maria Costa", date: "14/04", stage: "Proposta", status: "Ajustes comerciais", description: "Fluxos de automacao, CRM e lead scoring.", nextAction: "Reenviar proposta revisada" },
  { id: 109, title: "ERP Personalizado", value: "R$ 78.000,00", company: "Corporation Inc", contact: "Ana Oliveira", owner: "Joao Silva", date: "10/04", stage: "Negociacao", status: "Negociacao ativa", description: "Projeto em fase final de validacao juridica.", nextAction: "Aprovar clausulas finais" },
  { id: 110, title: "App Mobile", value: "R$ 42.000,00", company: "Theta Co", contact: "Ricardo Viana", owner: "Ana Ferreira", date: "11/04", stage: "Negociacao", status: "Desconto solicitado", description: "Aplicativo com painel administrativo e notificacoes.", nextAction: "Definir contraproposta" }
];
const defaultFinanceItems = [
  { id: 201, type: "receita-fixa", name: "Contrato Retainer Alpha", description: "Consultoria mensal recorrente", value: "R$ 12.000,00" },
  { id: 202, type: "receita-fixa", name: "Gestao de Midia Beta", description: "Fee mensal de performance", value: "R$ 8.500,00" },
  { id: 203, type: "receita-variavel", name: "Projeto Landing Page", description: "Recebimento avulso do mes", value: "R$ 4.200,00" },
  { id: 204, type: "receita-variavel", name: "Bonus de Campanha", description: "Pagamento adicional por meta batida", value: "R$ 2.800,00" },
  { id: 205, type: "despesa-fixa", name: "Ferramentas SaaS", description: "Assinaturas mensais da operacao", value: "R$ 1.350,00" },
  { id: 206, type: "despesa-fixa", name: "Folha Operacional", description: "Equipe fixa e apoio mensal", value: "R$ 9.000,00" },
  { id: 207, type: "despesa-variavel", name: "Compra de Midia Extra", description: "Impulsionamento adicional do mes", value: "R$ 3.200,00" },
  { id: 208, type: "despesa-variavel", name: "Freelancer de Edicao", description: "Demanda extra de conteudo", value: "R$ 1.150,00" }
];
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};
const compressibleMimeTypes = new Set([
  "application/javascript; charset=utf-8",
  "application/json; charset=utf-8",
  "image/svg+xml",
  "text/css; charset=utf-8",
  "text/html; charset=utf-8",
]);
const longCacheExtensions = new Set([".png", ".jpg", ".jpeg", ".svg"]);

function handleRequest(request, response) {
  const urlPath = decodeURIComponent(request.url.split("?")[0]);
  const clientMatch = urlPath.match(/^\/api\/clientes\/(\d+)$/);
  const dealMatch = urlPath.match(/^\/api\/deals\/(\d+)$/);
  const financeMatch = urlPath.match(/^\/api\/finance-items\/(\d+)$/);
  const adminEventMatch = urlPath.match(/^\/api\/admin-events\/([^/]+)$/);
  const clientEventMatch = urlPath.match(/^\/api\/client-events\/([^/]+)$/);
  const contentMatch = urlPath.match(/^\/api\/conteudos\/(\d+)$/);
  const campaignMatch = urlPath.match(/^\/api\/campanhas\/(\d+)$/);

  if (urlPath === "/api/state" && request.method === "GET") {
    return requireAuth(request, response, (session) => sendAppState(request, response, session));
  }

  if (urlPath === "/api/clientes" && request.method === "GET") {
    return requireAdmin(request, response, () => readClients(response));
  }

  if (urlPath === "/api/clientes" && request.method === "POST") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      createClientAccount(response, body);
    }));
  }

  if (clientMatch && request.method === "PUT") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      updateClientAccount(response, Number(clientMatch[1]), body);
    }));
  }

  if (clientMatch && request.method === "DELETE") {
    return requireAdmin(request, response, () => deleteClientAccount(response, Number(clientMatch[1])));
  }

  if (urlPath === "/api/usuarios" && request.method === "GET") {
    return requireAdmin(request, response, () => readUsers(response));
  }

  if (urlPath === "/api/usuarios" && request.method === "POST") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      createUserAccount(response, body);
    }));
  }

  if (urlPath === "/api/login" && request.method === "POST") {
    return readJsonBody(request, response, (body) => {
      loginWithSupabase(response, body);
    });
  }

  if (urlPath === "/api/deals" && request.method === "POST") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      const deal = normalizeDeal({ id: Date.now(), ...body });

      if (!deal.title || !deal.value || !deal.company || !deal.stage) {
        return sendJson(response, 400, { error: "Titulo, valor, empresa e etapa sao obrigatorios." });
      }

      const store = readStore();
      store.deals.push(deal);
      writeStore(store);
      return sendJson(response, 201, deal);
    }));
  }

  if (dealMatch && request.method === "PUT") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      const id = Number(dealMatch[1]);
      const store = readStore();
      const index = store.deals.findIndex((item) => item.id === id);
      if (index < 0) return sendJson(response, 404, { error: "Negocio nao encontrado." });
      const updated = normalizeDeal({ ...store.deals[index], ...body, id });
      store.deals[index] = updated;
      writeStore(store);
      return sendJson(response, 200, updated);
    }));
  }

  if (dealMatch && request.method === "DELETE") {
    return requireAdmin(request, response, () => {
      const id = Number(dealMatch[1]);
      const store = readStore();
      const before = store.deals.length;
      store.deals = store.deals.filter((item) => item.id !== id);
      if (store.deals.length === before) return sendJson(response, 404, { error: "Negocio nao encontrado." });
      writeStore(store);
      return sendJson(response, 200, { ok: true });
    });
  }

  if (urlPath === "/api/finance-items" && request.method === "POST") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      createSupabaseFinanceItem(response, body);
    }));
  }

  if (financeMatch && request.method === "PUT") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      updateSupabaseFinanceItem(response, Number(financeMatch[1]), body);
    }));
  }

  if (financeMatch && request.method === "DELETE") {
    return requireAdmin(request, response, () => deleteSupabaseFinanceItem(response, Number(financeMatch[1])));
  }

  if (urlPath === "/api/conteudos" && request.method === "POST") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      createContentRecord(response, body);
    }));
  }

  if (contentMatch && request.method === "PUT") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      updateContentRecord(response, Number(contentMatch[1]), body);
    }));
  }

  if (contentMatch && request.method === "DELETE") {
    return requireAdmin(request, response, () => deleteContentRecord(response, Number(contentMatch[1])));
  }

  if (urlPath === "/api/campanhas" && request.method === "POST") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      createCampaignRecord(response, body);
    }));
  }

  if (campaignMatch && request.method === "PUT") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      updateCampaignRecord(response, Number(campaignMatch[1]), body);
    }));
  }

  if (campaignMatch && request.method === "DELETE") {
    return requireAdmin(request, response, () => deleteCampaignRecord(response, Number(campaignMatch[1])));
  }

  if (urlPath === "/api/admin-events" && request.method === "POST") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      createSupabaseTask(response, body, "admin");
    }));
  }

  if (adminEventMatch && request.method === "PUT") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      updateSupabaseTask(response, adminEventMatch[1], body, "admin");
    }));
  }

  if (adminEventMatch && request.method === "DELETE") {
    return requireAdmin(request, response, () => deleteSupabaseCronogramaEvent(response, adminEventMatch[1], request));
  }

  if (urlPath === "/api/client-events" && request.method === "POST") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      createSupabaseTask(response, body, "cliente");
    }));
  }

  if (clientEventMatch && request.method === "PUT") {
    return requireAdmin(request, response, () => readJsonBody(request, response, (body) => {
      updateSupabaseTask(response, clientEventMatch[1], body, "cliente");
    }));
  }

  if (clientEventMatch && request.method === "DELETE") {
    return requireAdmin(request, response, () => deleteSupabaseCronogramaEvent(response, clientEventMatch[1], request));
  }

  if (urlPath.startsWith("/api/")) {
    return sendJson(response, 404, { error: "Rota da API nao encontrada." });
  }

  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(root, safePath);

  if (urlPath === "/") {
    filePath = path.join(root, "index.html");
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      serveFile(request, filePath, response, stats);
      return;
    }

    serveFile(request, path.join(root, "index.html"), response);
  });
}

const server = http.createServer(handleRequest);

function serveFile(request, filePath, response, stats = null) {
  if (!stats) {
    fs.stat(filePath, (error, fileStats) => {
      if (error || !fileStats.isFile()) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Arquivo nao encontrado.");
        return;
      }

      serveFile(request, filePath, response, fileStats);
    });
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";
  const etag = `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
  const cacheControl = extension === ".html"
    ? "no-cache"
    : longCacheExtensions.has(extension)
      ? "public, max-age=86400, stale-while-revalidate=604800"
      : "public, max-age=0, must-revalidate";
  const headers = {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
    ETag: etag,
    "Last-Modified": stats.mtime.toUTCString(),
  };

  if (request.headers["if-none-match"] === etag) {
    response.writeHead(304, headers);
    response.end();
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Erro ao carregar o protótipo.");
      return;
    }

    sendStaticContent(request, response, content, headers, contentType);
  });
}

function sendStaticContent(request, response, content, headers, contentType) {
  const acceptEncoding = String(request.headers["accept-encoding"] || "");

  if (content.length < 1024 || !compressibleMimeTypes.has(contentType)) {
    response.writeHead(200, { ...headers, "Content-Length": content.length });
    response.end(content);
    return;
  }

  if (acceptEncoding.includes("br")) {
    zlib.brotliCompress(content, (error, compressed) => {
      if (error) return sendUncompressed(response, content, headers);
      response.writeHead(200, {
        ...headers,
        "Content-Encoding": "br",
        "Content-Length": compressed.length,
        Vary: "Accept-Encoding",
      });
      response.end(compressed);
    });
    return;
  }

  if (acceptEncoding.includes("gzip")) {
    zlib.gzip(content, (error, compressed) => {
      if (error) return sendUncompressed(response, content, headers);
      response.writeHead(200, {
        ...headers,
        "Content-Encoding": "gzip",
        "Content-Length": compressed.length,
        Vary: "Accept-Encoding",
      });
      response.end(compressed);
    });
    return;
  }

  sendUncompressed(response, content, headers);
}

function sendUncompressed(response, content, headers) {
  response.writeHead(200, { ...headers, "Content-Length": content.length });
  response.end(content);
}

function readStore() {
  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    const users = Array.isArray(parsed.users) && parsed.users.length
      ? parsed.users.map(normalizeUserRecord)
      : [...defaultUsers];
    const events = Array.isArray(parsed.events) && parsed.events.length
      ? parsed.events.map(normalizeEventRecord)
      : (Array.isArray(parsed.tasks)
        ? parsed.tasks.map(normalizeTaskRecord)
        : migrateLegacyTasks(parsed.adminEvents, parsed.clientEvents));
    return {
      users,
      deals: parsed.deals?.length ? parsed.deals : [...defaultDeals],
      financeItems: Array.isArray(parsed.financeItems) ? parsed.financeItems : [...defaultFinanceItems],
      events,
      contents: Array.isArray(parsed.contents) ? parsed.contents.map(normalizeContentRecord) : [...defaultContents],
      campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns.map(normalizeCampaignRecord) : [...defaultCampaigns],
    };
  } catch {
    return {
      users: [...defaultUsers],
      deals: [...defaultDeals],
      financeItems: [...defaultFinanceItems],
      events: [...defaultEvents],
      contents: [...defaultContents],
      campaigns: [...defaultCampaigns],
    };
  }
}

function writeStore(store) {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), "utf8");
}

function readJsonBody(request, response, onSuccess) {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
  });
  request.on("end", () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      onSuccess(parsed);
    } catch {
      sendJson(response, 400, { error: "JSON invalido." });
    }
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function toSessionRole(user) {
  return isClientUser(user) ? "cliente" : "admin";
}

function createSessionToken(user) {
  const payload = {
    id: Number(user.id),
    email: String(user.email || "").trim().toLowerCase(),
    tipo: String(user.tipo || "").trim(),
    role: toSessionRole(user),
    exp: Date.now() + (1000 * 60 * 60 * 12),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", sessionSecret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || !String(token).includes(".")) return null;
  const [encoded, signature] = String(token).split(".");
  if (!encoded || !signature) return null;
  const expected = crypto.createHmac("sha256", sessionSecret).update(encoded).digest("base64url");
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload?.id || !payload?.role || !payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getSessionFromRequest(request) {
  const authHeader = String(request.headers.authorization || "").trim();
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  return verifySessionToken(authHeader.slice(7).trim());
}

function requireAuth(request, response, onSuccess) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return sendJson(response, 401, { error: "Sessao invalida ou expirada." });
  }
  return onSuccess(session);
}

function requireRoleAuth(request, response, allowedRoles, onSuccess) {
  return requireAuth(request, response, (session) => {
    if (!allowedRoles.includes(session.role)) {
      return sendJson(response, 403, { error: "Voce nao tem permissao para esta acao." });
    }
    return onSuccess(session);
  });
}

function requireAdmin(request, response, onSuccess) {
  return requireRoleAuth(request, response, ["admin"], onSuccess);
}

async function sendAppState(request, response, session) {
  const store = readStore();
  let financeItems = store.financeItems;
  let events = store.events;
  let users = store.users;
  let contents = store.contents;
  let campaigns = store.campaigns;
  const role = String(session.role || "").trim().toLowerCase();
  const userId = Number(session.id || 0);

  if (hasSupabaseEnv()) {
    try {
      financeItems = await fetchSupabaseFinanceItems();
      users = await readUsersData();
      events = await fetchSupabaseEvents({ users });
      contents = await fetchSupabaseContents();
      campaigns = await fetchSupabaseCampaigns();
    } catch {
      // Keep local fallback if Supabase is temporarily unavailable.
    }
  }

  const filteredContents = role === "cliente"
    ? contents.filter((item) => Number(item.cliente_id) === userId)
    : contents;
  const filteredCampaigns = role === "cliente"
    ? campaigns.filter((item) => Number(item.cliente_id) === userId)
    : campaigns;
  const filteredEvents = expandEventRecords(events, users).filter((item) => (
    role === "cliente" ? item.clientIds.includes(userId) : true
  ));

  return sendJson(response, 200, {
    clients: role === "cliente" ? users.filter((item) => Number(item.id) === userId && isClientUser(item)) : users.filter(isClientUser),
    users: role === "cliente" ? users.filter((item) => Number(item.id) === userId) : users,
    deals: role === "cliente" ? [] : store.deals,
    tasks: filteredEvents,
    rawEvents: role === "cliente" ? events.filter((item) => item.clientIds.includes(userId)) : events,
    contents: filteredContents,
    campaigns: filteredCampaigns,
    financeItems: role === "cliente" ? [] : financeItems,
    adminEvents: role === "cliente" ? [] : filteredEvents,
    clientEvents: role === "cliente" ? filteredEvents : [],
    reports: {
      content: summarizeContent(filteredContents, users),
      traffic: summarizeTraffic(filteredCampaigns, users),
    },
  });
}

async function loginWithSupabase(response, body) {
  const email = String(body.email || "").trim().toLowerCase();
  const senha = String(body.password || "").trim();
  const role = String(body.role || "").trim().toLowerCase();
  const expectedTipo = role === "cliente" ? "Cliente" : "Administrador";

  if (!email || !senha) {
    return sendJson(response, 400, { error: "Email e senha sao obrigatorios." });
  }

  try {
    const users = await readUsersData({ includeSensitive: true });
    const account = users.find((user) =>
      String(user.email || "").toLowerCase() === email &&
      String(user.tipo || "") === expectedTipo
    );
    if (!account) {
      return sendJson(response, 401, { error: "Conta nao encontrada para este perfil." });
    }
    if (String(account.senha || "") !== senha) {
      return sendJson(response, 401, { error: "Senha incorreta." });
    }

    return sendJson(response, 200, {
      id: account.id,
      nome: account.nome,
      email: account.email,
      tipo: account.tipo,
      telefone: account.telefone || "",
      planType: account.planType || "",
      token: createSessionToken(account),
    });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao validar login no Supabase." });
  }
}

async function readUsers(response) {
  try {
    const users = await readUsersData();
    return sendJson(response, 200, users);
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao consultar usuarios." });
  }
}

async function readClients(response) {
  try {
    const users = await readUsersData();
    return sendJson(response, 200, users.filter(isClientUser));
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao consultar clientes." });
  }
}

async function readUsersData({ includeSensitive = false } = {}) {
  if (!hasSupabaseEnv()) {
    const store = readStore();
    return includeSensitive ? store.users : store.users.map(stripSensitiveUserFields);
  }

  const columns = [
    "id",
    "nome",
    "email",
    "tipo",
    "telefone",
    "Telefone",
    "plano_tipo",
    "plan_type",
    "tipo_plano",
    includeSensitive ? "senha" : null,
  ].filter(Boolean).join(", ");

  const { data, error } = await getSupabaseClient()
    .from("usuarios")
    .select(columns)
    .order("nome", { ascending: true });

  if (error) throw error;
  const users = (data || []).map(normalizeUserRecord);
  return includeSensitive ? users : users.map(stripSensitiveUserFields);
}

async function createUserAccount(response, body) {
  const user = normalizeUserRecord({ id: Date.now(), ...body });
  if (!user.nome || !user.telefone || !user.email || !user.senha || !user.tipo) {
    return sendJson(response, 400, { error: "Nome, telefone, email, senha e perfil de acesso sao obrigatorios." });
  }

  try {
    if (!hasSupabaseEnv()) {
      const store = readStore();
      if (store.users.some((item) => String(item.email).toLowerCase() === String(user.email).toLowerCase())) {
        return sendJson(response, 400, { error: "Ja existe um usuario com este email." });
      }
      store.users.push(user);
      writeStore(store);
      return sendJson(response, 201, stripSensitiveUserFields(user));
    }

    const payload = {
      id: user.id,
      nome: user.nome,
      telefone: user.telefone,
      email: user.email,
      senha: user.senha,
      tipo: user.tipo,
      plano_tipo: user.planType,
    };
    const { data, error } = await getSupabaseClient()
      .from("usuarios")
      .insert(payload)
      .select("id, nome, telefone, email, tipo, plano_tipo, plan_type, tipo_plano")
      .single();

    if (error) {
      if (String(error.message || "").toLowerCase().includes("duplicate")) {
        return sendJson(response, 400, { error: "Ja existe um usuario com este email." });
      }
      return sendJson(response, 500, { error: error.message });
    }
    return sendJson(response, 201, stripSensitiveUserFields(normalizeUserRecord(data)));
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao criar usuario." });
  }
}

async function createClientAccount(response, body) {
  return createUserAccount(response, { ...body, tipo: "Cliente" });
}

async function updateClientAccount(response, id, body) {
  try {
    if (!hasSupabaseEnv()) {
      const store = readStore();
      const index = store.users.findIndex((item) => Number(item.id) === id && isClientUser(item));
      if (index < 0) return sendJson(response, 404, { error: "Cliente nao encontrado." });
      const current = store.users[index];
      const updated = normalizeUserRecord({ ...current, ...body, id, tipo: "Cliente", senha: body.senha || current.senha });
      if (store.users.some((item, itemIndex) => itemIndex !== index && String(item.email).toLowerCase() === String(updated.email).toLowerCase())) {
        return sendJson(response, 400, { error: "Ja existe um usuario com este email." });
      }
      store.users[index] = updated;
      writeStore(store);
      return sendJson(response, 200, stripSensitiveUserFields(updated));
    }

    const currentUsers = await readUsersData({ includeSensitive: true });
    const current = currentUsers.find((item) => Number(item.id) === id && isClientUser(item));
    if (!current) return sendJson(response, 404, { error: "Cliente nao encontrado." });
    const updated = normalizeUserRecord({ ...current, ...body, id, tipo: "Cliente", senha: body.senha || current.senha });

    const { data, error } = await getSupabaseClient()
      .from("usuarios")
      .update({
        nome: updated.nome,
        telefone: updated.telefone,
        email: updated.email,
        senha: updated.senha,
        tipo: updated.tipo,
        plano_tipo: updated.planType,
      })
      .eq("id", id)
      .select("id, nome, telefone, email, tipo, plano_tipo, plan_type, tipo_plano")
      .single();

    if (error) return sendJson(response, 500, { error: error.message });
    return sendJson(response, 200, stripSensitiveUserFields(normalizeUserRecord(data)));
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao atualizar cliente." });
  }
}


async function deleteClientAccount(response, id) {
  try {
    if (!hasSupabaseEnv()) {
      const store = readStore();
      const before = store.users.length;
      store.users = store.users.filter((item) => Number(item.id) !== id || !isClientUser(item));
      if (store.users.length === before) return sendJson(response, 404, { error: "Cliente nao encontrado." });
      store.events = store.events
        .map((event) => ({ ...event, clientIds: event.clientIds.filter((clientId) => Number(clientId) !== id) }))
        .filter((event) => event.clientIds.length);
      store.contents = store.contents.filter((item) => Number(item.cliente_id) !== id);
      store.campaigns = store.campaigns.filter((item) => Number(item.cliente_id) !== id);
      writeStore(store);
      return sendJson(response, 200, { ok: true });
    }

    await getSupabaseClient().from("eventos_clientes").delete().eq("cliente_id", id);
    await getSupabaseClient().from("conteudos").delete().eq("cliente_id", id);
    await getSupabaseClient().from("campanhas").delete().eq("cliente_id", id);
    const { error } = await getSupabaseClient().from("usuarios").delete().eq("id", id).eq("tipo", "Cliente");
    if (error) return sendJson(response, 500, { error: error.message });
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao excluir cliente." });
  }
}

async function fetchSupabaseFinanceItems() {
  const supabase = getSupabaseClient();
  const primary = await supabase
    .from("financeiro_lancamentos")
    .select("id, nome, descricao, valor, tipo, data_lancamento")
    .order("id", { ascending: true });

  if (!primary.error) return (primary.data || []).map(mapFinanceRow);

  const fallback = await supabase
    .from("financeiro_lancamentos")
    .select("id, nome, descricao, valor, tipo")
    .order("id", { ascending: true });

  if (fallback.error) throw fallback.error;
  return (fallback.data || []).map(mapFinanceRow);
}

async function createSupabaseFinanceItem(response, body) {
  const item = normalizeFinanceItem({ id: Date.now(), ...body });
  if (!item.name || !item.description || !item.value || !item.type) {
    return sendJson(response, 400, { error: "Nome, descricao, valor e tipo sao obrigatorios." });
  }

  if (!hasSupabaseEnv()) {
    const store = readStore();
    store.financeItems.push(item);
    writeStore(store);
    return sendJson(response, 201, item);
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await persistFinanceInsert(supabase, item);

    if (error) return sendJson(response, 500, { error: error.message });
    return sendJson(response, 201, mapFinanceRow(data));
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao criar lancamento financeiro." });
  }
}

async function updateSupabaseFinanceItem(response, id, body) {
  if (!hasSupabaseEnv()) {
    const store = readStore();
    const index = store.financeItems.findIndex((item) => item.id === id);
    if (index < 0) return sendJson(response, 404, { error: "Lancamento nao encontrado." });
    const updated = normalizeFinanceItem({ ...store.financeItems[index], ...body, id });
    store.financeItems[index] = updated;
    writeStore(store);
    return sendJson(response, 200, updated);
  }

  try {
    const current = normalizeFinanceItem({ ...body, id });
    const { data, error } = await persistFinanceUpdate(getSupabaseClient(), id, current);

    if (error) return sendJson(response, 500, { error: error.message });
    return sendJson(response, 200, mapFinanceRow(data));
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao atualizar lancamento financeiro." });
  }
}

async function deleteSupabaseFinanceItem(response, id) {
  if (!hasSupabaseEnv()) {
    const store = readStore();
    const before = store.financeItems.length;
    store.financeItems = store.financeItems.filter((item) => item.id !== id);
    if (store.financeItems.length === before) return sendJson(response, 404, { error: "Lancamento nao encontrado." });
    writeStore(store);
    return sendJson(response, 200, { ok: true });
  }

  try {
    const { error } = await getSupabaseClient().from("financeiro_lancamentos").delete().eq("id", id);
    if (error) return sendJson(response, 500, { error: error.message });
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao remover lancamento financeiro." });
  }
}

async function fetchSupabaseEvents({ users = [] } = {}) {
  const { data: eventRows, error } = await getSupabaseClient()
    .from("eventos")
    .select("id, titulo, descricao, data, hora, tipo, status, repeticao_tipo, repeticao_intervalo, repeticao_unidade, repeticao_dias_semana, repeticao_dia_mes, repeticao_fim, evento_pai_id, data_original, tipo_excecao")
    .order("data", { ascending: true })
    .order("hora", { ascending: true });

  if (error) throw error;
  const { data: relations, error: relationError } = await getSupabaseClient()
    .from("eventos_clientes")
    .select("evento_id, cliente_id");
  if (relationError) throw relationError;

  return mapEventRowsWithRelations(eventRows || [], relations || [], users);
}

async function fetchSupabaseContents() {
  const { data, error } = await getSupabaseClient()
    .from("conteudos")
    .select("id, titulo, tipo, descricao, data_publicacao, data_criacao, status, cliente_id")
    .order("data_publicacao", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeContentRecord);
}

async function fetchSupabaseCampaigns() {
  const { data, error } = await getSupabaseClient()
    .from("campanhas")
    .select("id, nome, cliente_id, orcamento, plataforma, data_inicio, data_fim, cliques, impressoes, conversoes, custo_resultado")
    .order("data_inicio", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeCampaignRecord);
}

async function createSupabaseTask(response, body, sourceRole) {
  const eventItem = normalizeCalendarBody(body, sourceRole);
  if (!eventItem.title || !eventItem.date || !eventItem.time || !eventItem.clientIds.length) {
    return sendJson(response, 400, { error: "Titulo, data, horario e pelo menos um cliente sao obrigatorios." });
  }

  if (!hasSupabaseEnv()) {
    const store = readStore();
    const saved = normalizeEventRecord({ ...eventItem, id: Date.now() });
    store.events = upsertLocalEvent(store.events, saved);
    writeStore(store);
    return sendJson(response, 201, mapEventForResponse(saved, store.users));
  }

  try {
    const users = await readUsersData();
    const { data, error } = await getSupabaseClient()
      .from("eventos")
      .insert(buildEventTablePayload(eventItem))
      .select("id, titulo, descricao, data, hora, tipo, status, repeticao_tipo, repeticao_intervalo, repeticao_unidade, repeticao_dias_semana, repeticao_dia_mes, repeticao_fim, evento_pai_id, data_original, tipo_excecao")
      .single();
    if (error) return sendJson(response, 500, { error: error.message });

    const { error: relationError } = await getSupabaseClient()
      .from("eventos_clientes")
      .insert(eventItem.clientIds.map((clientId) => ({ evento_id: data.id, cliente_id: clientId })));
    if (relationError) return sendJson(response, 500, { error: relationError.message });

    return sendJson(response, 201, mapEventForResponse({ ...normalizeEventRecord(data), clientIds: eventItem.clientIds }, users));
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao criar evento." });
  }
}

async function updateSupabaseTask(response, rawId, body, sourceRole) {
  const scope = String(body.scope || "single").trim().toLowerCase();
  const occurrenceMeta = parseOccurrenceId(rawId);
  const eventId = occurrenceMeta?.overrideId || occurrenceMeta?.seriesId || Number(rawId);
  const eventItem = normalizeCalendarBody({ ...body, id: eventId }, sourceRole);
  if (!eventItem.title || !eventItem.date || !eventItem.time || !eventItem.clientIds.length) {
    return sendJson(response, 400, { error: "Titulo, data, horario e pelo menos um cliente sao obrigatorios." });
  }

  if (!hasSupabaseEnv()) {
    const store = readStore();
    const saved = updateLocalEvent(store, rawId, eventItem, scope);
    if (!saved) return sendJson(response, 404, { error: "Evento nao encontrado." });
    writeStore(store);
    return sendJson(response, 200, mapEventForResponse(saved, store.users));
  }

  try {
    const users = await readUsersData();
    const currentEvents = await fetchSupabaseEvents({ users });
    const expandedEvents = expandEventRecords(currentEvents, users);
    const current = findEventByIdentifier(expandedEvents, rawId) || findEventFallback(currentEvents, rawId);
    if (!current) return sendJson(response, 404, { error: "Evento nao encontrado." });

    if (scope === "series" || !current.isOccurrence) {
      const targetId = current.parentEventId || current.seriesId || current.persistentId || eventId;
      if (!Number.isFinite(Number(targetId))) {
        return sendJson(response, 400, { error: "Identificador de evento invalido para editar a serie." });
      }
      const { data, error } = await getSupabaseClient()
        .from("eventos")
        .update(buildEventTablePayload(eventItem))
        .eq("id", targetId)
        .select("id, titulo, descricao, data, hora, tipo, status, repeticao_tipo, repeticao_intervalo, repeticao_unidade, repeticao_dias_semana, repeticao_dia_mes, repeticao_fim, evento_pai_id, data_original, tipo_excecao")
        .single();
      if (error) return sendJson(response, 500, { error: error.message });

      await getSupabaseClient().from("eventos_clientes").delete().eq("evento_id", targetId);
      const { error: relationError } = await getSupabaseClient()
        .from("eventos_clientes")
        .insert(eventItem.clientIds.map((clientId) => ({ evento_id: targetId, cliente_id: clientId })));
      if (relationError) return sendJson(response, 500, { error: relationError.message });
      return sendJson(response, 200, mapEventForResponse({ ...normalizeEventRecord(data), clientIds: eventItem.clientIds }, users));
    }

    const overridePayload = buildEventTablePayload({
      ...eventItem,
      recurrence: normalizeRecurrence({}, eventItem.date),
      parentEventId: current.seriesId,
      originalDate: occurrenceMeta?.originalDate || current.originalDate || current.date,
      exceptionType: "edited",
    });
    const { data, error } = await getSupabaseClient()
      .from("eventos")
      .insert(overridePayload)
      .select("id, titulo, descricao, data, hora, tipo, status, repeticao_tipo, repeticao_intervalo, repeticao_unidade, repeticao_dias_semana, repeticao_dia_mes, repeticao_fim, evento_pai_id, data_original, tipo_excecao")
      .single();
    if (error) return sendJson(response, 500, { error: error.message });
    const { error: relationError } = await getSupabaseClient()
      .from("eventos_clientes")
      .insert(eventItem.clientIds.map((clientId) => ({ evento_id: data.id, cliente_id: clientId })));
    if (relationError) return sendJson(response, 500, { error: relationError.message });
    return sendJson(response, 200, mapEventForResponse({ ...normalizeEventRecord(data), clientIds: eventItem.clientIds }, users));
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao atualizar evento." });
  }
}

async function deleteSupabaseCronogramaEvent(response, rawId, request) {
  const requestUrl = new URL(request.url, `http://localhost:${port}`);
  const scope = String(requestUrl.searchParams.get("scope") || "single").trim().toLowerCase();

  if (!hasSupabaseEnv()) {
    const store = readStore();
    const ok = deleteLocalEvent(store, rawId, scope);
    if (!ok) return sendJson(response, 404, { error: "Evento nao encontrado." });
    writeStore(store);
    return sendJson(response, 200, { ok: true });
  }

  try {
    const users = await readUsersData();
    const currentEvents = await fetchSupabaseEvents({ users });
    const expandedEvents = expandEventRecords(currentEvents, users);
    const current = findEventByIdentifier(expandedEvents, rawId) || findEventFallback(currentEvents, rawId);
    if (!current) return sendJson(response, 404, { error: "Evento nao encontrado." });

    if (scope === "series" || !current.isOccurrence) {
      const targetId = current.parentEventId || current.seriesId || current.persistentId;
      if (!Number.isFinite(Number(targetId))) {
        return sendJson(response, 400, { error: "Identificador de evento invalido para excluir." });
      }
      await getSupabaseClient().from("eventos_clientes").delete().eq("evento_id", targetId);
      await getSupabaseClient().from("eventos").delete().eq("evento_pai_id", targetId);
      const { error } = await getSupabaseClient().from("eventos").delete().eq("id", targetId);
      if (error) return sendJson(response, 500, { error: error.message });
      return sendJson(response, 200, { ok: true });
    }

    const parsed = parseOccurrenceId(rawId);
    const payload = buildEventTablePayload({
      title: current.title,
      description: current.description,
      date: current.date,
      time: current.time,
      type: current.type,
      status: "cancelada",
      recurrence: normalizeRecurrence({}, current.date),
      parentEventId: current.seriesId,
      originalDate: parsed?.originalDate || current.originalDate || current.date,
      exceptionType: "cancelled",
      clientIds: current.clientIds,
    });
    const { data, error } = await getSupabaseClient()
      .from("eventos")
      .insert(payload)
      .select("id")
      .single();
    if (error) return sendJson(response, 500, { error: error.message });
    await getSupabaseClient()
      .from("eventos_clientes")
      .insert(current.clientIds.map((clientId) => ({ evento_id: data.id, cliente_id: clientId })));
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao remover evento." });
  }
}

function normalizeCalendarBody(body, sourceRole) {
  const clientIds = normalizeClientIds(body.clientIds || body.clientId || body.cliente_ids || body.cliente_id || body.clienteId || body.userId);
  const date = String(body.date || "").trim();
  return normalizeEventRecord({
    id: Number(body.id || Date.now()),
    title: sourceRole === "cliente" ? String(body.title || "Horario confirmado") : String(body.title || ""),
    description: String(body.description || ""),
    date,
    time: normalizeTimeValue(body.time),
    clientIds,
    type: String(body.type || "gravacao"),
    status: String(body.status || "agendada").toLowerCase(),
    recurrenceType: body.recurrenceType || body.repeticao_tipo || body.recurrence?.type || "none",
    recurrenceInterval: body.recurrenceInterval || body.repetitionInterval || body.recurrence?.interval,
    recurrenceUnit: body.recurrenceUnit || body.recurrence?.unit,
    recurrenceWeekdays: body.recurrenceWeekdays || body.recurrence?.weekdays,
    recurrenceDayOfMonth: body.recurrenceDayOfMonth || body.recurrence?.dayOfMonth,
    recurrenceEndDate: body.recurrenceEndDate || body.recurrence?.endDate,
    parentEventId: body.parentEventId || body.evento_pai_id,
    originalDate: body.originalDate || body.data_original,
    exceptionType: body.exceptionType || body.tipo_excecao,
  });
}

function mapFinanceRow(row) {
  return {
    id: Number(row.id),
    type: String(row.tipo || "").trim(),
    name: String(row.nome || "").trim(),
    description: String(row.descricao || "").trim(),
    value: formatCurrencyFromNumber(Number(row.valor || 0)),
    date: String(row.data_lancamento || row.data || "").trim(),
  };
}

function buildFinancePayload(item, includeDate = true) {
  const payload = {
    nome: item.name,
    descricao: item.description,
    valor: parseCurrencyValue(item.value),
    tipo: item.type,
  };
  if (includeDate && item.date) payload.data_lancamento = item.date;
  return payload;
}

async function persistFinanceInsert(supabase, item) {
  const primary = await supabase
    .from("financeiro_lancamentos")
    .insert(buildFinancePayload(item, true))
    .select("id, nome, descricao, valor, tipo, data_lancamento")
    .single();

  if (!primary.error || !shouldFallbackFinanceDate(primary.error)) return primary;

  return supabase
    .from("financeiro_lancamentos")
    .insert(buildFinancePayload(item, false))
    .select("id, nome, descricao, valor, tipo")
    .single();
}

async function persistFinanceUpdate(supabase, id, item) {
  const primary = await supabase
    .from("financeiro_lancamentos")
    .update(buildFinancePayload(item, true))
    .eq("id", id)
    .select("id, nome, descricao, valor, tipo, data_lancamento")
    .single();

  if (!primary.error || !shouldFallbackFinanceDate(primary.error)) return primary;

  return supabase
    .from("financeiro_lancamentos")
    .update(buildFinancePayload(item, false))
    .eq("id", id)
    .select("id, nome, descricao, valor, tipo")
    .single();
}

function shouldFallbackFinanceDate(error) {
  return String(error?.message || "").toLowerCase().includes("data_lancamento");
}

function mapEventForResponse(eventRecord, users = []) {
  const selectedClients = users.filter((item) => (eventRecord.clientIds || []).includes(Number(item.id)));
  const normalized = normalizeEventRecord({
    ...eventRecord,
    recurrenceType: eventRecord.recurrence?.type || eventRecord.repeticao_tipo,
    recurrenceInterval: eventRecord.recurrence?.interval || eventRecord.repeticao_intervalo,
    recurrenceUnit: eventRecord.recurrence?.unit || eventRecord.repeticao_unidade,
    recurrenceWeekdays: eventRecord.recurrence?.weekdays || eventRecord.repeticao_dias_semana,
    recurrenceDayOfMonth: eventRecord.recurrence?.dayOfMonth || eventRecord.repeticao_dia_mes,
    recurrenceEndDate: eventRecord.recurrence?.endDate || eventRecord.repeticao_fim,
    parentEventId: eventRecord.parentEventId || eventRecord.evento_pai_id,
    originalDate: eventRecord.originalDate || eventRecord.data_original,
    exceptionType: eventRecord.exceptionType || eventRecord.tipo_excecao,
  });
  return {
    ...normalized,
    persistentId: Number(normalized.id),
    seriesId: Number(normalized.parentEventId || normalized.id),
    isOccurrence: Boolean(normalized.parentEventId),
    isRecurring: normalized.recurrence?.type !== "none",
    originalDate: normalized.originalDate || normalized.date,
    clientName: selectedClients.map((item) => item.nome).join(", "),
    clientNames: selectedClients.map((item) => item.nome),
  };
}

function mapEventRowsWithRelations(rows = [], relations = [], users = []) {
  const relationMap = relations.reduce((acc, relation) => {
    const eventId = Number(relation.evento_id);
    if (!acc[eventId]) acc[eventId] = [];
    acc[eventId].push(Number(relation.cliente_id));
    return acc;
  }, {});

  return rows.map((row) => normalizeEventRecord({
    ...row,
    clientIds: relationMap[Number(row.id)] || [],
    recurrenceType: row.repeticao_tipo,
    recurrenceInterval: row.repeticao_intervalo,
    recurrenceUnit: row.repeticao_unidade,
    recurrenceWeekdays: row.repeticao_dias_semana,
    recurrenceDayOfMonth: row.repeticao_dia_mes,
    recurrenceEndDate: row.repeticao_fim,
    parentEventId: row.evento_pai_id,
    originalDate: row.data_original,
    exceptionType: row.tipo_excecao,
  })).map((item) => mapEventForResponse(item, users));
}

function buildEventTablePayload(eventItem) {
  return {
    titulo: eventItem.title,
    descricao: eventItem.description,
    data: eventItem.date,
    hora: eventItem.time,
    tipo: eventItem.type,
    status: eventItem.status,
    repeticao_tipo: eventItem.recurrence?.type || "none",
    repeticao_intervalo: eventItem.recurrence?.interval || 1,
    repeticao_unidade: eventItem.recurrence?.unit || "none",
    repeticao_dias_semana: (eventItem.recurrence?.weekdays || []).join(","),
    repeticao_dia_mes: eventItem.recurrence?.dayOfMonth || null,
    repeticao_fim: eventItem.recurrence?.endDate || null,
    evento_pai_id: eventItem.parentEventId || null,
    data_original: eventItem.originalDate || null,
    tipo_excecao: eventItem.exceptionType || null,
  };
}

function findEventByIdentifier(events = [], rawId) {
  const occurrence = parseOccurrenceId(rawId);
  if (occurrence) {
    return events.find((item) => Number(item.seriesId) === occurrence.seriesId && String(item.originalDate) === occurrence.originalDate) || null;
  }
  return events.find((item) => Number(item.id) === Number(rawId) || Number(item.persistentId) === Number(rawId)) || null;
}

function findEventFallback(events = [], rawId) {
  const occurrence = parseOccurrenceId(rawId);
  if (!occurrence) return null;
  const master = events.find((item) => Number(item.id) === Number(occurrence.seriesId) || Number(item.seriesId) === Number(occurrence.seriesId));
  if (!master) return null;
  return {
    ...master,
    id: rawId,
    seriesId: Number(occurrence.seriesId),
    persistentId: Number(master.persistentId || master.id),
    isOccurrence: true,
    isRecurring: true,
    originalDate: occurrence.originalDate,
    date: occurrence.originalDate,
  };
}

function upsertLocalEvent(events = [], eventItem) {
  const next = events.filter((item) => Number(item.id) !== Number(eventItem.id));
  return [...next, normalizeEventRecord(eventItem)].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
}

function deleteLocalEvent(store, rawId, scope) {
  const expanded = expandEventRecords(store.events, store.users);
  const current = findEventByIdentifier(expanded, rawId);
  if (!current) return false;

  if (scope === "series" || !current.isOccurrence) {
    const targetId = current.seriesId || current.persistentId || Number(rawId);
    store.events = store.events.filter((item) => Number(item.id) !== Number(targetId) && Number(item.parentEventId) !== Number(targetId));
    return true;
  }

  store.events.push(normalizeEventRecord({
    id: Date.now(),
    title: current.title,
    description: current.description,
    date: current.date,
    time: current.time,
    clientIds: current.clientIds,
    type: current.type,
    status: "cancelada",
    parentEventId: current.seriesId,
    originalDate: current.originalDate,
    exceptionType: "cancelled",
    recurrenceType: "none",
  }));
  return true;
}

function updateLocalEvent(store, rawId, eventItem, scope) {
  const expanded = expandEventRecords(store.events, store.users);
  const current = findEventByIdentifier(expanded, rawId);
  if (!current) return null;

  if (scope === "series" || !current.isOccurrence) {
    const targetId = current.seriesId || current.persistentId || Number(rawId);
    store.events = store.events.map((item) => (
      Number(item.id) === Number(targetId)
        ? normalizeEventRecord({ ...eventItem, id: targetId })
        : item
    ));
    return normalizeEventRecord({ ...eventItem, id: targetId });
  }

  const override = normalizeEventRecord({
    ...eventItem,
    id: Date.now(),
    parentEventId: current.seriesId,
    originalDate: current.originalDate,
    exceptionType: "edited",
    recurrenceType: "none",
  });
  store.events = upsertLocalEvent(store.events, override);
  return override;
}

function normalizeContentRecord(payload) {
  return {
    id: Number(payload.id || Date.now()),
    titulo: String(payload.titulo || payload.title || "").trim(),
    tipo: String(payload.tipo || payload.type || "post").trim(),
    descricao: String(payload.descricao || payload.description || "").trim(),
    data_publicacao: String(payload.data_publicacao || payload.publishDate || payload.date || "").trim(),
    data_criacao: String(payload.data_criacao || payload.createdAt || payload.data_publicacao || "").trim(),
    status: String(payload.status || "pendente").trim().toLowerCase(),
    cliente_id: Number(payload.cliente_id || payload.clientId || payload.clienteId || 0),
  };
}

function normalizeCampaignRecord(payload) {
  const budget = Number(payload.orcamento_numero || payload.orcamentoNumero || parseCurrencyValue(payload.orcamento || payload.budget || 0));
  const conversions = Number(payload.conversoes || payload.conversions || 0);
  const explicitCost = Number(payload.custo_resultado || payload.custoResultado || payload.costPerResult || 0);
  return {
    id: Number(payload.id || Date.now()),
    nome: String(payload.nome || payload.name || "").trim(),
    cliente_id: Number(payload.cliente_id || payload.clientId || payload.clienteId || 0),
    orcamento: formatCurrencyFromNumber(budget),
    orcamento_numero: budget,
    plataforma: String(payload.plataforma || payload.platform || "").trim(),
    data_inicio: String(payload.data_inicio || payload.startDate || "").trim(),
    data_fim: String(payload.data_fim || payload.endDate || "").trim(),
    cliques: Number(payload.cliques || payload.clicks || 0),
    impressoes: Number(payload.impressoes || payload.impressions || 0),
    conversoes: conversions,
    custo_resultado: explicitCost || (conversions > 0 ? Number((budget / conversions).toFixed(2)) : 0),
  };
}

function normalizeTaskRecord(payload) {
  return normalizeEventRecord({
    id: payload.id,
    title: payload.title || payload.titulo,
    description: payload.description || payload.descricao,
    date: payload.date || payload.data,
    time: payload.time || payload.hora,
    clientIds: payload.clientIds || payload.cliente_ids || payload.cliente_id || payload.clientId,
    type: payload.type || payload.tipo || "gravacao",
    status: payload.status || "agendada",
  });
}

function migrateLegacyTasks(adminEvents = [], clientEvents = []) {
  return [...(adminEvents || []), ...(clientEvents || [])].map((task) =>
    normalizeTaskRecord({
      id: task.id,
      title: task.title,
      description: task.description || task.text || "",
      date: task.date || inferLegacyEventDate(task),
      time: task.time,
      clientIds: task.clientIds || task.clientId,
      type: task.type || task.icon || "tarefa",
      status: task.status || "agendada",
    }),
  );
}

function inferLegacyEventDate(task) {
  if (task.date) return task.date;
  const today = new Date();
  const day = Number(task.day || today.getDate());
  const month = today.getMonth();
  const year = today.getFullYear();
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

async function createContentRecord(response, body) {
  const record = normalizeContentRecord(body);
  if (!record.titulo || !record.tipo || !record.data_publicacao || !record.cliente_id) {
    return sendJson(response, 400, { error: "Titulo, tipo, data de publicacao e cliente sao obrigatorios." });
  }

  if (!hasSupabaseEnv()) {
    const store = readStore();
    store.contents = [record, ...store.contents];
    writeStore(store);
    return sendJson(response, 201, record);
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("conteudos")
      .insert({
        titulo: record.titulo,
        tipo: record.tipo,
        descricao: record.descricao,
        data_publicacao: record.data_publicacao,
        data_criacao: record.data_criacao || record.data_publicacao,
        status: record.status,
        cliente_id: record.cliente_id,
      })
      .select("id, titulo, tipo, descricao, data_publicacao, data_criacao, status, cliente_id")
      .single();
    if (error) return sendJson(response, 500, { error: error.message });
    return sendJson(response, 201, normalizeContentRecord(data));
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao criar conteudo." });
  }
}

async function updateContentRecord(response, id, body) {
  const record = normalizeContentRecord({ ...body, id });
  if (!hasSupabaseEnv()) {
    const store = readStore();
    const index = store.contents.findIndex((item) => Number(item.id) === id);
    if (index < 0) return sendJson(response, 404, { error: "Conteudo nao encontrado." });
    store.contents[index] = record;
    writeStore(store);
    return sendJson(response, 200, record);
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("conteudos")
      .update({
        titulo: record.titulo,
        tipo: record.tipo,
        descricao: record.descricao,
        data_publicacao: record.data_publicacao,
        data_criacao: record.data_criacao || record.data_publicacao,
        status: record.status,
        cliente_id: record.cliente_id,
      })
      .eq("id", id)
      .select("id, titulo, tipo, descricao, data_publicacao, data_criacao, status, cliente_id")
      .single();
    if (error) return sendJson(response, 500, { error: error.message });
    return sendJson(response, 200, normalizeContentRecord(data));
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao atualizar conteudo." });
  }
}

async function deleteContentRecord(response, id) {
  if (!hasSupabaseEnv()) {
    const store = readStore();
    const before = store.contents.length;
    store.contents = store.contents.filter((item) => Number(item.id) !== id);
    if (store.contents.length === before) return sendJson(response, 404, { error: "Conteudo nao encontrado." });
    writeStore(store);
    return sendJson(response, 200, { ok: true });
  }

  try {
    const { error } = await getSupabaseClient().from("conteudos").delete().eq("id", id);
    if (error) return sendJson(response, 500, { error: error.message });
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao remover conteudo." });
  }
}

async function createCampaignRecord(response, body) {
  const record = normalizeCampaignRecord(body);
  if (!record.nome || !record.cliente_id || !record.plataforma || !record.data_inicio || !record.data_fim) {
    return sendJson(response, 400, { error: "Nome, cliente, plataforma e periodo sao obrigatorios." });
  }

  if (!hasSupabaseEnv()) {
    const store = readStore();
    store.campaigns = [record, ...store.campaigns];
    writeStore(store);
    return sendJson(response, 201, record);
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("campanhas")
      .insert({
        nome: record.nome,
        cliente_id: record.cliente_id,
        orcamento: record.orcamento_numero,
        plataforma: record.plataforma,
        data_inicio: record.data_inicio,
        data_fim: record.data_fim,
        cliques: record.cliques,
        impressoes: record.impressoes,
        conversoes: record.conversoes,
        custo_resultado: record.custo_resultado,
      })
      .select("id, nome, cliente_id, orcamento, plataforma, data_inicio, data_fim, cliques, impressoes, conversoes, custo_resultado")
      .single();
    if (error) return sendJson(response, 500, { error: error.message });
    return sendJson(response, 201, normalizeCampaignRecord(data));
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao criar campanha." });
  }
}

async function updateCampaignRecord(response, id, body) {
  const record = normalizeCampaignRecord({ ...body, id });
  if (!hasSupabaseEnv()) {
    const store = readStore();
    const index = store.campaigns.findIndex((item) => Number(item.id) === id);
    if (index < 0) return sendJson(response, 404, { error: "Campanha nao encontrada." });
    store.campaigns[index] = record;
    writeStore(store);
    return sendJson(response, 200, record);
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("campanhas")
      .update({
        nome: record.nome,
        cliente_id: record.cliente_id,
        orcamento: record.orcamento_numero,
        plataforma: record.plataforma,
        data_inicio: record.data_inicio,
        data_fim: record.data_fim,
        cliques: record.cliques,
        impressoes: record.impressoes,
        conversoes: record.conversoes,
        custo_resultado: record.custo_resultado,
      })
      .eq("id", id)
      .select("id, nome, cliente_id, orcamento, plataforma, data_inicio, data_fim, cliques, impressoes, conversoes, custo_resultado")
      .single();
    if (error) return sendJson(response, 500, { error: error.message });
    return sendJson(response, 200, normalizeCampaignRecord(data));
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao atualizar campanha." });
  }
}

async function deleteCampaignRecord(response, id) {
  if (!hasSupabaseEnv()) {
    const store = readStore();
    const before = store.campaigns.length;
    store.campaigns = store.campaigns.filter((item) => Number(item.id) !== id);
    if (store.campaigns.length === before) return sendJson(response, 404, { error: "Campanha nao encontrada." });
    writeStore(store);
    return sendJson(response, 200, { ok: true });
  }

  try {
    const { error } = await getSupabaseClient().from("campanhas").delete().eq("id", id);
    if (error) return sendJson(response, 500, { error: error.message });
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Erro ao remover campanha." });
  }
}

function normalizeTimeValue(value) {
  return String(value || "").slice(0, 5);
}

function parseCurrencyValue(value) {
  const normalized = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Number(normalized || 0);
}

function formatCurrencyFromNumber(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function getInitials(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function stripSensitiveUserFields(user) {
  const { senha, ...safeUser } = normalizeUserRecord(user);
  return safeUser;
}

function isClientUser(user) {
  return String(user.tipo || "").trim().toLowerCase() === "cliente";
}

function normalizeUserRecord(payload) {
  const planType = normalizePlanType(payload.planType || payload.plano_tipo || payload.plan_type || payload.tipo_plano || payload.statusLabel || payload.status);
  return {
    id: Number(payload.id || Date.now()),
    nome: String(payload.nome || payload.name || "").trim(),
    email: String(payload.email || "").trim().toLowerCase(),
    senha: String(payload.senha || "").trim(),
    telefone: String(payload.telefone || payload.Telefone || payload.phone || "").trim(),
    tipo: String(payload.tipo || "Cliente").trim(),
    planType,
  };
}

function normalizeContact(payload) {
  const planType = normalizePlanType(payload.planType || payload.statusLabel || payload.status);
  return {
    id: Number(payload.id || Date.now()),
    initials: getInitials(payload.name || ""),
    name: String(payload.name || "").trim(),
    role: String(payload.role || "").trim(),
    company: String(payload.company || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    planType,
    value: String(payload.value || "R$ 0").trim(),
  };
}

function normalizePlanType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "producao de conteudo" || normalized === "produção de conteúdo") return "Producao de Conteudo";
  if (normalized === "gestao de trafego" || normalized === "gestão de tráfego") return "Gestao de Trafego";
  if (normalized === "ambos") return "Ambos";
  return mapLegacyStatusToPlanType(normalized);
}

function mapLegacyStatusToPlanType(value) {
  if (value === "quente" || value === "hot") return "Ambos";
  if (value === "frio" || value === "cold") return "Gestao de Trafego";
  if (value === "morno" || value === "warm") return "Producao de Conteudo";
  return planOptions[0];
}

function normalizeDeal(payload) {
  return {
    id: Number(payload.id || Date.now()),
    title: String(payload.title || "").trim(),
    value: String(payload.value || "").trim(),
    company: String(payload.company || "").trim(),
    contact: String(payload.contact || "").trim(),
    owner: String(payload.owner || "").trim(),
    date: String(payload.date || "").trim(),
    stage: String(payload.stage || "Prospeccao").trim(),
    status: String(payload.status || "").trim(),
    description: String(payload.description || "").trim(),
    nextAction: String(payload.nextAction || "").trim(),
  };
}

function normalizeFinanceItem(payload) {
  return {
    id: Number(payload.id || Date.now()),
    type: String(payload.type || "").trim(),
    name: String(payload.name || "").trim(),
    description: String(payload.description || "").trim(),
    value: String(payload.value || "").trim(),
    date: String(payload.date || payload.data_lancamento || payload.data || "").trim(),
  };
}

if (require.main === module) {
  server.listen(port, () => {
  console.log(`Fokal protótipo disponível em http://localhost:${port}`);
  });
}

module.exports = {
  handleRequest,
};
