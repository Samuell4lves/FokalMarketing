"use strict";

function filterItemsByClient(items = [], clientId) {
  if (!clientId || clientId === "all") return [...items];
  return items.filter((item) => Number(item.cliente_id || item.clientId || item.clienteId) === Number(clientId));
}

function filterItemsByMonthYear(items = [], dateField, month, year) {
  return items.filter((item) => {
    const value = String(item[dateField] || "");
    if (!value) return false;
    const [itemYear, itemMonth] = value.split("-").map(Number);
    if (year && Number(year) !== itemYear) return false;
    if (month !== undefined && month !== null && month !== "" && Number(month) + 1 !== itemMonth) return false;
    return true;
  });
}

function summarizeContent(contents = [], clients = []) {
  const published = contents.filter((item) => normalizeStatus(item.status) === "publicado").length;
  const pending = contents.filter((item) => normalizeStatus(item.status) !== "publicado").length;

  return {
    total: contents.length,
    published,
    pending,
    byType: groupAndCount(contents, (item) => item.tipo || item.type || "Outro"),
    byClient: groupAndCount(contents, (item) => resolveClientName(item, clients)),
    byMonth: groupAndCount(contents, (item) => formatMonthKey(item.data_publicacao || item.dataPublicacao || item.data_criacao || item.dataCriacao)),
  };
}

function summarizeTraffic(campaigns = [], clients = []) {
  const totals = campaigns.reduce((acc, campaign) => {
    acc.budget += Number(campaign.orcamento_numero || campaign.orcamentoNumero || 0);
    acc.clicks += Number(campaign.cliques || 0);
    acc.impressions += Number(campaign.impressoes || 0);
    acc.conversions += Number(campaign.conversoes || 0);
    return acc;
  }, { budget: 0, clicks: 0, impressions: 0, conversions: 0 });

  const avgCostPerResult = totals.conversions > 0 ? totals.budget / totals.conversions : 0;

  return {
    totalCampaigns: campaigns.length,
    budget: totals.budget,
    clicks: totals.clicks,
    impressions: totals.impressions,
    conversions: totals.conversions,
    avgCostPerResult,
    byPlatform: groupAndCount(campaigns, (item) => item.plataforma || item.platform || "Nao informado"),
    byClient: groupAndCount(campaigns, (item) => resolveClientName(item, clients)),
  };
}

function groupAndCount(items, getKey) {
  return items.reduce((acc, item) => {
    const key = String(getKey(item) || "Nao informado");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function resolveClientName(item, clients = []) {
  const clientId = Number(item.cliente_id || item.clientId || item.clienteId || 0);
  const client = clients.find((entry) => Number(entry.id) === clientId);
  return client?.nome || "Sem cliente";
}

function formatMonthKey(value) {
  const [year, month] = String(value || "").split("-");
  if (!year || !month) return "Sem data";
  return `${month}/${year}`;
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

module.exports = {
  filterItemsByClient,
  filterItemsByMonthYear,
  summarizeContent,
  summarizeTraffic,
};
