"use strict";

const DEFAULT_WINDOW_MONTHS_BACK = 12;
const DEFAULT_WINDOW_MONTHS_FORWARD = 24;
const LEGACY_EVENT_CATEGORY_MAP = {
  reuniao: "gravacao",
  reunião: "gravacao",
  ligacao: "roteiros",
  ligação: "roteiros",
  tarefa: "conteudo",
  prazo: "relatorio",
};
const EVENT_CATEGORIES = new Set(["gravacao", "roteiros", "conteudo", "relatorio"]);

function normalizeClientIds(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0))];
  }
  if (typeof value === "string") {
    return [...new Set(value.split(",").map((item) => Number(item.trim())).filter((item) => Number.isFinite(item) && item > 0))];
  }
  const single = Number(value || 0);
  return Number.isFinite(single) && single > 0 ? [single] : [];
}

function normalizeWeekdays(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(source
    .map((item) => Number(String(item).trim()))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6))]
    .sort((a, b) => a - b);
}

function normalizeRecurrence(input = {}, baseDate = "") {
  const rawType = String(
    input.recurrenceType ||
    input.repeticao_tipo ||
    input.repeticao ||
    input.type ||
    "none",
  ).trim().toLowerCase();

  const type = ["daily", "weekly", "monthly", "custom"].includes(rawType) ? rawType : "none";
  const interval = Math.max(1, Number(input.recurrenceInterval || input.repeticao_intervalo || input.interval || 1) || 1);
  const unit = String(input.recurrenceUnit || input.repeticao_unidade || input.unit || (type === "custom" ? "weekly" : type)).trim().toLowerCase();
  const weekdays = normalizeWeekdays(input.recurrenceWeekdays || input.repeticao_dias_semana || input.weekdays);
  const parsedBaseDay = Number(String(baseDate || "").split("-")[2] || 0);
  const dayOfMonth = Math.max(1, Math.min(31, Number(input.recurrenceDayOfMonth || input.repeticao_dia_mes || input.dayOfMonth || parsedBaseDay || 1) || 1));
  const endDate = String(input.recurrenceEndDate || input.repeticao_fim || input.endDate || "").trim();

  if (type === "none") {
    return {
      type: "none",
      interval: 1,
      unit: "none",
      weekdays: [],
      dayOfMonth,
      endDate: "",
    };
  }

  return {
    type,
    interval,
    unit: type === "custom" ? normalizeCustomUnit(unit) : type,
    weekdays: (type === "weekly" || (type === "custom" && unit === "weekly")) ? weekdays : [],
    dayOfMonth,
    endDate,
  };
}

function normalizeCustomUnit(value) {
  if (value === "daily" || value === "monthly") return value;
  return "weekly";
}

function normalizeTimeValue(value) {
  return String(value || "").slice(0, 5);
}

function normalizeEventCategory(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return LEGACY_EVENT_CATEGORY_MAP[normalized] || (EVENT_CATEGORIES.has(normalized) ? normalized : "gravacao");
}

function normalizeEventRecord(payload = {}) {
  const date = String(payload.date || payload.data || "").trim();
  const recurrence = payload.recurrence
    ? normalizeRecurrence({
      recurrenceType: payload.recurrence.type,
      recurrenceInterval: payload.recurrence.interval,
      recurrenceUnit: payload.recurrence.unit,
      recurrenceWeekdays: payload.recurrence.weekdays,
      recurrenceDayOfMonth: payload.recurrence.dayOfMonth,
      recurrenceEndDate: payload.recurrence.endDate,
    }, date)
    : normalizeRecurrence(payload, date);
  return {
    id: Number(payload.id || Date.now()),
    title: String(payload.title || payload.titulo || "").trim(),
    description: String(payload.description || payload.descricao || "").trim(),
    date,
    time: normalizeTimeValue(payload.time || payload.hora || ""),
    clientIds: normalizeClientIds(payload.clientIds || payload.cliente_ids || payload.cliente_id || payload.clientId),
    clientName: String(payload.clientName || payload.cliente_nome || "").trim(),
    clientNames: Array.isArray(payload.clientNames) ? payload.clientNames.map((item) => String(item || "").trim()).filter(Boolean) : [],
    type: normalizeEventCategory(payload.type || payload.tipo),
    status: String(payload.status || "agendada").trim(),
    recurrence,
    recurrenceLabel: buildRecurrenceLabel(recurrence),
    parentEventId: payload.parentEventId ? Number(payload.parentEventId) : payload.evento_pai_id ? Number(payload.evento_pai_id) : null,
    originalDate: String(payload.originalDate || payload.data_original || "").trim(),
    exceptionType: String(payload.exceptionType || payload.tipo_excecao || "").trim().toLowerCase(),
  };
}

function buildRecurrenceLabel(recurrence = {}) {
  if (!recurrence || recurrence.type === "none") return "Sem repeticao";
  if (recurrence.type === "daily") {
    return recurrence.interval === 1 ? "Diario" : `A cada ${recurrence.interval} dias`;
  }
  if (recurrence.type === "weekly" || recurrence.unit === "weekly") {
    const weekdayLabel = recurrence.weekdays.length ? recurrence.weekdays.map(formatWeekdayShort).join(", ") : "mesmo dia";
    return recurrence.interval === 1 ? `Semanal (${weekdayLabel})` : `A cada ${recurrence.interval} semanas (${weekdayLabel})`;
  }
  if (recurrence.type === "monthly" || recurrence.unit === "monthly") {
    return recurrence.interval === 1 ? `Mensal (dia ${recurrence.dayOfMonth})` : `A cada ${recurrence.interval} meses (dia ${recurrence.dayOfMonth})`;
  }
  return "Personalizado";
}

function expandEventRecords(records = [], users = [], options = {}) {
  const horizon = buildWindow(options);
  const byParent = new Map();
  const masters = [];

  records.map(normalizeEventRecord).forEach((eventRecord) => {
    if (eventRecord.parentEventId) {
      const current = byParent.get(eventRecord.parentEventId) || [];
      current.push(eventRecord);
      byParent.set(eventRecord.parentEventId, current);
      return;
    }
    masters.push(eventRecord);
  });

  const occurrences = [];
  masters.forEach((master) => {
    const exceptions = byParent.get(master.id) || [];
    const generatedDates = generateDatesForEvent(master, horizon.start, horizon.end);
    generatedDates.forEach((date) => {
      const replacement = exceptions.find((item) => item.originalDate === date);
      if (replacement?.exceptionType === "cancelled") return;
      const source = replacement && replacement.exceptionType === "edited" ? replacement : master;
      const occurrence = hydrateEventForResponse(source, source.clientIds.length ? source.clientIds : master.clientIds, users, {
        seriesId: master.id,
        originalDate: date,
        isOccurrence: master.recurrence.type !== "none",
      });
      if (occurrence.date < horizon.start || occurrence.date > horizon.end) return;
      occurrences.push(occurrence);
    });
  });

  return occurrences.sort(compareEvents);
}

function buildWindow(options = {}) {
  const now = new Date();
  const rawStart = options.startDate ? parseIsoDate(options.startDate) : new Date(now.getFullYear(), now.getMonth() - DEFAULT_WINDOW_MONTHS_BACK, 1);
  const rawEnd = options.endDate ? parseIsoDate(options.endDate) : new Date(now.getFullYear(), now.getMonth() + DEFAULT_WINDOW_MONTHS_FORWARD + 1, 0);
  return {
    start: toIsoDate(rawStart),
    end: toIsoDate(rawEnd),
  };
}

function generateDatesForEvent(eventRecord, rangeStartIso, rangeEndIso) {
  if (!eventRecord.date) return [];
  const recurrence = eventRecord.recurrence || normalizeRecurrence({}, eventRecord.date);
  const startIso = maxIsoDate(eventRecord.date, rangeStartIso);
  const endIso = minIsoDate(recurrence.endDate || rangeEndIso, rangeEndIso);

  if (eventRecord.date > endIso) return [];
  if (recurrence.type === "none") {
    return eventRecord.date >= rangeStartIso && eventRecord.date <= rangeEndIso ? [eventRecord.date] : [];
  }
  if (recurrence.type === "daily" || recurrence.unit === "daily") {
    return generateDailyDates(eventRecord.date, endIso, recurrence.interval).filter((item) => item >= startIso);
  }
  if (recurrence.type === "monthly" || recurrence.unit === "monthly") {
    return generateMonthlyDates(eventRecord.date, endIso, recurrence.interval, recurrence.dayOfMonth).filter((item) => item >= startIso);
  }
  return generateWeeklyDates(eventRecord.date, endIso, recurrence.interval, recurrence.weekdays).filter((item) => item >= startIso);
}

function generateDailyDates(startIso, endIso, interval) {
  const dates = [];
  let current = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  while (current <= end) {
    dates.push(toIsoDate(current));
    current = addDays(current, interval);
  }
  return dates;
}

function generateWeeklyDates(startIso, endIso, interval, weekdays = []) {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  const allowedWeekdays = weekdays.length ? weekdays : [start.getDay()];
  const dates = [];
  let current = new Date(start);

  while (current <= end) {
    const diffDays = Math.floor((stripTime(current) - stripTime(start)) / 86400000);
    const weekIndex = Math.floor(diffDays / 7);
    if (weekIndex % interval === 0 && allowedWeekdays.includes(current.getDay()) && current >= start) {
      dates.push(toIsoDate(current));
    }
    current = addDays(current, 1);
  }

  return dates;
}

function generateMonthlyDates(startIso, endIso, interval, dayOfMonth) {
  const dates = [];
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor <= end) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), clampDayOfMonth(cursor.getFullYear(), cursor.getMonth(), dayOfMonth));
    if (date >= start && date <= end) {
      dates.push(toIsoDate(date));
    }
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + interval, 1);
  }

  return dates;
}

function hydrateEventForResponse(source, clientIds, users, metadata = {}) {
  const selectedClients = users.filter((item) => clientIds.includes(Number(item.id)));
  const seriesId = Number(metadata.seriesId || source.id);
  const isOccurrence = Boolean(metadata.isOccurrence);
  const originalDate = metadata.originalDate || source.originalDate || source.date;
  const occurrenceId = isOccurrence
    ? buildOccurrenceId(seriesId, originalDate, source.parentEventId ? source.id : null)
    : source.id;

  return {
    id: occurrenceId,
    persistentId: Number(source.id),
    seriesId,
    title: source.title,
    description: source.description,
    date: originalDate,
    time: source.time,
    clientIds,
    clientName: selectedClients.map((item) => item.nome).join(", "),
    clientNames: selectedClients.map((item) => item.nome),
    type: source.type,
    status: source.status,
    recurrence: source.parentEventId ? { type: "none", interval: 1, unit: "none", weekdays: [], dayOfMonth: 1, endDate: "" } : source.recurrence,
    recurrenceLabel: source.parentEventId ? "Ocorrencia editada" : source.recurrenceLabel,
    isRecurring: (source.parentEventId ? metadata.isOccurrence : source.recurrence.type !== "none"),
    isOccurrence,
    originalDate,
    parentEventId: source.parentEventId,
    exceptionType: source.exceptionType || "",
  };
}

function buildOccurrenceId(seriesId, originalDate, overrideId = null) {
  return overrideId
    ? `series:${seriesId}:${originalDate}:override:${overrideId}`
    : `series:${seriesId}:${originalDate}`;
}

function parseOccurrenceId(value) {
  const text = String(value || "");
  if (!text.startsWith("series:")) return null;
  const parts = text.split(":");
  if (parts.length < 3) return null;
  return {
    seriesId: Number(parts[1]),
    originalDate: parts[2],
    overrideId: parts[4] ? Number(parts[4]) : null,
  };
}

function compareEvents(a, b) {
  return `${a.date}T${a.time || "00:00"}`.localeCompare(`${b.date}T${b.time || "00:00"}`);
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

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function clampDayOfMonth(year, month, dayOfMonth) {
  return Math.min(dayOfMonth, new Date(year, month + 1, 0).getDate());
}

function maxIsoDate(a, b) {
  return a > b ? a : b;
}

function minIsoDate(a, b) {
  return a < b ? a : b;
}

function formatWeekdayShort(index) {
  return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][index] || "";
}

module.exports = {
  buildOccurrenceId,
  buildRecurrenceLabel,
  compareEvents,
  expandEventRecords,
  normalizeClientIds,
  normalizeEventRecord,
  normalizeRecurrence,
  normalizeWeekdays,
  parseOccurrenceId,
};
