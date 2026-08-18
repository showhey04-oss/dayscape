"use strict";
function defaultState() {
  return {
    version: APP_VERSION,
    events: [],
    locations: [{ ...DEFAULT_LOCATION }],
    tags: DEFAULT_TAGS.map(tag => ({ ...tag })),
    settings: {
      view: "month",
      activeLocationId: DEFAULT_LOCATION.id
    },
    weatherCache: {}
  };
}

function loadState() {
  const fallback = defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return normalizeState(JSON.parse(raw), fallback);
  } catch (error) {
    console.warn("Dayscape: saved data could not be read.", error);
    return fallback;
  }
}

function normalizeState(input, fallback = defaultState()) {
  const safe = input && typeof input === "object" ? input : {};
  const locations = Array.isArray(safe.locations)
    ? safe.locations.map(normalizeLocation).filter(Boolean)
    : fallback.locations;
  const tags = Array.isArray(safe.tags)
    ? safe.tags.map(normalizeTag).filter(Boolean)
    : fallback.tags;
  const events = Array.isArray(safe.events)
    ? safe.events.map(normalizeEvent).filter(Boolean)
    : [];
  let activeLocationId = safe.settings?.activeLocationId;
  if (!locations.some(location => location.id === activeLocationId)) {
    activeLocationId = locations.find(location => location.isHome)?.id || locations[0]?.id || "";
  }
  const view = ["month", "week", "day"].includes(safe.settings?.view)
    ? safe.settings.view
    : "month";
  return {
    version: APP_VERSION,
    events,
    locations,
    tags,
    settings: { view, activeLocationId },
    weatherCache: safe.weatherCache && typeof safe.weatherCache === "object" ? safe.weatherCache : {}
  };
}

function normalizeLocation(location) {
  if (!location || typeof location !== "object") return null;
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    id: safeId(location.id, "loc"),
    name: cleanText(location.name, 80) || "登録地点",
    admin1: cleanText(location.admin1, 80),
    country: cleanText(location.country, 80),
    latitude,
    longitude,
    timezone: cleanText(location.timezone, 80) || "auto",
    isHome: Boolean(location.isHome)
  };
}

function normalizeTag(tag) {
  if (!tag || typeof tag !== "object") return null;
  const id = safeId(tag.id, "tag");
  const originalName = cleanText(tag.name, 20);
  if (!originalName) return null;
  const name = LEGACY_TAG_NAMES[id]?.[originalName] || originalName;
  return {
    id,
    name,
    color: validColor(tag.color) ? tag.color : "#6f7f8f"
  };
}

function normalizeEvent(event) {
  if (!event || typeof event !== "object") return null;
  const title = cleanText(event.title, 80);
  const start = normalizeLocalDateTime(event.start);
  const end = normalizeLocalDateTime(event.end);
  if (!title || !start || !end || parseLocalDateTime(end) < parseLocalDateTime(start)) return null;
  return {
    id: safeId(event.id, "evt"),
    title,
    start,
    end,
    allDay: Boolean(event.allDay),
    departure: normalizeLocalDateTime(event.departure) || "",
    place: normalizePlace(event.place),
    companions: Array.isArray(event.companions)
      ? event.companions
          .map(value => cleanText(value, 30))
          .map(value => COMPANION_ALIASES[value] || value)
          .filter(value => COMPANIONS.includes(value))
      : [],
    companionNote: cleanText(event.companionNote, 60),
    locationId: cleanText(event.locationId, 80),
    tagIds: Array.isArray(event.tagIds)
      ? event.tagIds.map(value => cleanText(value, 80)).filter(Boolean)
      : [],
    createdAt: cleanText(event.createdAt, 40) || new Date().toISOString(),
    updatedAt: cleanText(event.updatedAt, 40) || new Date().toISOString()
  };
}

function normalizePlace(place) {
  if (!place) return null;
  if (typeof place === "string") {
    const name = cleanText(place, 160);
    return name ? { source: "text", name } : null;
  }
  if (typeof place !== "object") return null;
  const placeId = cleanText(place.placeId || place.id, 240);
  if (placeId) return { source: "google", placeId };
  const name = cleanText(place.name || place.displayName, 160);
  return name ? { source: "text", name } : null;
}

function normalizePlaceDraft(place) {
  const stored = normalizePlace(place);
  if (!stored) return null;
  if (stored.source === "text") return stored;
  const cached = resolvedGooglePlaces.get(stored.placeId) || {};
  const latitude = Number(place?.latitude ?? cached.latitude);
  const longitude = Number(place?.longitude ?? cached.longitude);
  return {
    source: "google",
    placeId: stored.placeId,
    name: cleanText(place?.name || place?.displayName || cached.name, 160) || "Google マップの場所",
    address: cleanText(place?.address || place?.formattedAddress || cached.address, 240),
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    attributions: Array.isArray(place?.attributions) ? place.attributions : (cached.attributions || [])
  };
}

function googlePlaceAttributionData(place) {
  const providers = Array.isArray(place?.attributions)
    ? place.attributions.map(item => ({
        provider: cleanText(item?.provider, 120),
        providerURI: typeof item?.providerURI === "string" ? item.providerURI : ""
      })).filter(item => item.provider)
    : [];
  return providers;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Dayscape: data could not be saved.", error);
    showToast("予定と設定を保存できませんでした");
  }
}

function render() {
  ensureHomeLocation();
  renderViewControls();
  renderLocationSelects();
  renderPeriodHeader();
  if (state.settings.view === "month") renderMonthView();
  if (state.settings.view === "week") renderWeekView();
  if (state.settings.view === "day") renderDayView();
}

function renderViewControls() {
  els.viewButtons.forEach(button => {
    const active = button.dataset.view === state.settings.view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
}

function renderLocationSelects() {
  const activeId = state.settings.activeLocationId;
  if (!state.locations.length) {
    els.activeLocationSelect.innerHTML = '<option value="">地点を追加</option>';
    els.activeLocationSelect.disabled = true;
  } else {
    els.activeLocationSelect.disabled = false;
    els.activeLocationSelect.innerHTML = state.locations
      .map(location => `<option value="${escapeAttr(location.id)}">${escapeHTML(location.name)}</option>`)
      .join("");
    els.activeLocationSelect.value = state.locations.some(location => location.id === activeId)
      ? activeId
      : state.locations[0].id;
  }

  els.eventLocation.innerHTML = [
    '<option value="">指定しない</option>',
    ...state.locations.map(location => `<option value="${escapeAttr(location.id)}">${escapeHTML(location.name)}</option>`)
  ].join("");
}

function renderPeriodHeader() {
  const view = state.settings.view;
  const activeLocation = getActiveLocation();
  const locationText = activeLocation ? `天気：${activeLocation.name}` : "設定で天気の表示地点を追加";
  if (view === "month") {
    els.periodTitle.textContent = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long" }).format(anchorDate);
    els.periodSubtitle.textContent = locationText;
  } else if (view === "week") {
    const start = startOfWeek(anchorDate);
    const end = addDays(start, 6);
    els.periodTitle.textContent = formatWeekRange(start, end);
    els.periodSubtitle.textContent = locationText;
  } else {
    els.periodTitle.textContent = new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric" }).format(anchorDate);
    els.periodSubtitle.textContent = `${weekdayLong(anchorDate)} · ${locationText}`;
  }
  els.jumpDateInput.value = dateKey(anchorDate);
}

function renderMonthView() {
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const gridStart = startOfWeek(monthStart);
  const todayKey = dateKey(new Date());
  const selectedKey = dateKey(anchorDate);
  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index);
    const key = dateKey(date);
    const events = eventsForDate(key);
    const weather = getWeatherForDate(key);
    const visibleEvents = events.slice(0, window.innerWidth >= 620 ? 3 : 2);
    const more = events.length - visibleEvents.length;
    cells.push(`
      <div class="month-cell ${date.getMonth() !== anchorDate.getMonth() ? "is-outside" : ""} ${key === todayKey ? "is-today" : ""} ${key === selectedKey ? "is-selected" : ""}" data-date="${key}" data-add-date="${key}">
        <div class="month-cell-top">
          <button class="day-number" type="button" data-add-date="${key}" aria-label="${escapeAttr(formatFullDate(date))}に予定を追加">${date.getDate()}</button>
          <span class="month-weather" title="${escapeAttr(weather ? weatherLabel(weather.code) : "予報未取得")}">${weather ? weatherIcon(weather.code) : ""}</span>
        </div>
        <div class="month-events">
          ${visibleEvents.map(event => renderMonthEvent(event, key)).join("")}
          ${more > 0 ? `<span class="month-more">＋${more}件</span>` : ""}
        </div>
      </div>
    `);
  }
  els.calendarRoot.innerHTML = `
    <div class="month-view">
      <div class="weekday-row" aria-hidden="true">
        <div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div><div>日</div>
      </div>
      <div class="month-grid">${cells.join("")}</div>
    </div>
  `;
}
