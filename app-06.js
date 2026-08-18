"use strict";
function eventSegmentForDay(event, key) {
  const dayStart = parseDateKey(key);
  const dayEnd = addDays(dayStart, 1);
  const eventStart = parseLocalDateTime(event.start);
  const eventEnd = parseLocalDateTime(event.end);
  const clippedStart = eventStart < dayStart ? dayStart : eventStart;
  const clippedEnd = eventEnd > dayEnd ? dayEnd : eventEnd;
  if (clippedEnd <= clippedStart) return null;
  return {
    event,
    startMinute: Math.max(0, Math.round((clippedStart - dayStart) / 60000)),
    endMinute: Math.min(1440, Math.round((clippedEnd - dayStart) / 60000))
  };
}

function eventTimeForDay(event, key, range = false) {
  const dayStart = parseDateKey(key);
  const dayEnd = addDays(dayStart, 1);
  const start = parseLocalDateTime(event.start);
  const end = parseLocalDateTime(event.end);
  const startLabel = start < dayStart ? "↳" : formatTime(start);
  if (!range) return startLabel;
  const endLabel = end >= dayEnd ? "翌日へ" : formatTime(end);
  return `${startLabel}〜${endLabel}`;
}

function eventMetaText(event) {
  const companion = event.companionNote || event.companions.join("・");
  const departure = event.departure ? `出発 ${formatTime(parseLocalDateTime(event.departure))}` : "";
  return [companion, departure].filter(Boolean).join(" · ");
}

function resolvedPlaceForDisplay(place) {
  const stored = normalizePlace(place);
  if (!stored) return null;
  if (stored.source === "text") return stored;
  return resolvedGooglePlaces.get(stored.placeId) || { source: "google", placeId: stored.placeId, name: "場所を開く", address: "", attributions: [] };
}

function googleMapsUrl(place) {
  const stored = normalizePlace(place);
  if (!stored) return "";
  const resolved = resolvedPlaceForDisplay(stored);
  const query = stored.source === "google" ? (resolved?.name && resolved.name !== "場所を開く" ? resolved.name : stored.placeId) : stored.name;
  const params = new URLSearchParams({ api: "1", query });
  if (stored.source === "google") params.set("query_place_id", stored.placeId);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

function renderGoogleAttributions(place) {
  if (place?.source !== "google") return "";
  const providerMarkup = (place.attributions || []).map(item => {
    const label = escapeHTML(item.provider);
    if (!label) return "";
    return item.providerURI
      ? `<a class="event-place-provider" href="${escapeAttr(item.providerURI)}" target="_blank" rel="noopener">${label}</a>`
      : `<span class="event-place-provider">${label}</span>`;
  }).join("");
  return `<span class="event-place-attribution" translate="no">Google Maps</span>${providerMarkup}`;
}

function renderEventPlaceLink(event, className = "") {
  const stored = normalizePlace(event.place);
  if (!stored) return "";
  const place = resolvedPlaceForDisplay(stored);
  const url = googleMapsUrl(stored);
  const label = place?.name || "場所を開く";
  return `<span class="event-place-row ${className}"><a class="event-place-link" href="${escapeAttr(url)}" target="_blank" rel="noopener" data-place-link="true" aria-label="Google マップで${escapeAttr(label)}を開く"><svg aria-hidden="true"><use href="#i-pin"></use></svg><span>${escapeHTML(label)}</span></a>${renderGoogleAttributions(place)}</span>`;
}

function eventColor(event) {
  const tagId = event.tagIds.find(id => state.tags.some(tag => tag.id === id));
  return state.tags.find(tag => tag.id === tagId)?.color || "#7c897e";
}

function weatherLabel(code) {
  if (code === 0) return "晴れ";
  if ([1, 2].includes(code)) return "晴れ時々くもり";
  if (code === 3) return "くもり";
  if ([45, 48].includes(code)) return "霧";
  if ([51, 53, 55, 56, 57].includes(code)) return "霧雨";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "雨";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "雪";
  if ([95, 96, 99].includes(code)) return "雷雨";
  return "天気";
}

function weatherIcon(code) {
  const common = 'viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
  const sun = '<circle cx="21" cy="20" r="7" stroke-width="2"/><path d="M21 7v4M21 29v4M8 20h4M30 20h4M12 11l3 3M27 26l3 3M30 11l-3 3M15 26l-3 3" stroke-width="1.7"/>';
  const cloud = '<path d="M15 34h19a7 7 0 0 0 0-14 11 11 0 0 0-21-1A7.5 7.5 0 0 0 15 34Z" stroke-width="2"/>';
  if (code === 0) return `<svg ${common}>${sun}</svg>`;
  if ([1, 2].includes(code)) return `<svg ${common}>${sun}<path d="M17 36h18a6 6 0 0 0 0-12 9 9 0 0 0-17-1 6.5 6.5 0 0 0-1 13Z" fill="var(--surface)" stroke-width="2"/></svg>`;
  if (code === 3) return `<svg ${common}>${cloud}</svg>`;
  if ([45, 48].includes(code)) return `<svg ${common}>${cloud}<path d="M10 39h27M15 43h18" stroke-width="1.7"/></svg>`;
  if ([51, 53, 55, 56, 57].includes(code)) return `<svg ${common}>${cloud}<path d="M17 38l-2 4M25 38l-2 4M33 38l-2 4" stroke-width="1.7"/></svg>`;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return `<svg ${common}>${cloud}<path d="M17 38l-3 6M26 38l-3 6M35 38l-3 6" stroke-width="2"/></svg>`;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return `<svg ${common}>${cloud}<path d="M17 39v5M14.8 40.2l4.4 2.6M19.2 40.2l-4.4 2.6M31 39v5M28.8 40.2l4.4 2.6M33.2 40.2l-4.4 2.6" stroke-width="1.5"/></svg>`;
  if ([95, 96, 99].includes(code)) return `<svg ${common}>${cloud}<path d="m27 36-5 7h5l-3 5" stroke-width="2"/></svg>`;
  return `<svg ${common}>${cloud}</svg>`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date) {
  const result = startOfDay(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function addMinutes(date, amount) {
  return new Date(date.getTime() + amount * 60000);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateKey(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return startOfDay(new Date());
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function localDateTimeValue(date) {
  return `${dateKey(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function normalizeLocalDateTime(value) {
  if (typeof value !== "string") return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return "";
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
  if (Number.isNaN(date.getTime())) return "";
  return localDateTimeValue(date);
}

function parseLocalDateTime(value) {
  const normalized = normalizeLocalDateTime(value);
  if (!normalized) return new Date(NaN);
  const [datePart, timePart] = normalized.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function formatTime(date) {
  return new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

function formatFullDate(date) {
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

function formatDateShort(date) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(date);
}

function formatWeekRange(start, end) {
  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日〜${end.getFullYear()}年${end.getMonth() + 1}月${end.getDate()}日`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${start.getMonth() + 1}月${start.getDate()}日〜${end.getMonth() + 1}月${end.getDate()}日`;
  }
  return `${start.getMonth() + 1}月${start.getDate()}日〜${end.getDate()}日`;
}

function weekdayLong(date) {
  return new Intl.DateTimeFormat("ja-JP", { weekday: "long" }).format(date);
}

function roundTemp(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : "—";
}

function createId(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeId(value, prefix) {
  const cleaned = cleanText(value, 100).replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned || createId(prefix);
}

function cleanText(value, maxLength = 200) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, maxLength) : "";
}

function validColor(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function cleanConfigValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function escapeAttr(value) {
  return escapeHTML(value).replace(/`/g, "&#96;");
}

function handleEventStartChange() {
  const start = parseLocalDateTime(els.eventStart.value);
  const end = parseLocalDateTime(els.eventEnd.value);
  if (!Number.isNaN(start.getTime()) && (Number.isNaN(end.getTime()) || end <= start)) {
    els.eventEnd.value = localDateTimeValue(addMinutes(start, 60));
  }
  if (departureFollowsStart && !Number.isNaN(start.getTime())) {
    els.eventDeparture.value = localDateTimeValue(start);
  }
}
