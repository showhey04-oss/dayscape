"use strict";
function deleteLocation(id) {
  const location = state.locations.find(item => item.id === id);
  if (!location) return;
  if (!window.confirm(`「${location.name}」を登録地点から削除しますか？`)) return;
  state.locations = state.locations.filter(item => item.id !== id);
  state.events = state.events.map(event => event.locationId === id ? { ...event, locationId: "" } : event);
  delete state.weatherCache[id];
  if (state.settings.activeLocationId === id) {
    state.settings.activeLocationId = state.locations.find(item => item.isHome)?.id || state.locations[0]?.id || "";
  }
  ensureHomeLocation();
  saveState();
  renderSettings();
  render();
  refreshActiveWeather();
  showToast("登録地点を削除しました");
}

function addTag(name, color) {
  const cleanName = cleanText(name, 20);
  const cleanColor = validColor(color) ? color : "#6f7f8f";
  if (!cleanName) {
    showToast("カテゴリ名を入力してください");
    return;
  }
  if (state.tags.some(tag => tag.name.toLowerCase() === cleanName.toLowerCase())) {
    showToast("同じ名前のカテゴリがあります");
    return;
  }
  state.tags.push({ id: createId("tag"), name: cleanName, color: cleanColor });
  saveState();
  renderTagManager();
  render();
  els.newTagName.value = "";
  showToast("カテゴリを追加しました");
}

function deleteTag(id) {
  const tag = state.tags.find(item => item.id === id);
  if (!tag) return;
  if (!window.confirm(`カテゴリ「${tag.name}」を削除しますか？\nこのカテゴリを設定した予定は削除されません。`)) return;
  state.tags = state.tags.filter(item => item.id !== id);
  state.events = state.events.map(event => ({ ...event, tagIds: event.tagIds.filter(tagId => tagId !== id) }));
  saveState();
  renderTagManager();
  render();
  showToast("カテゴリを削除しました");
}

async function refreshActiveWeather(force = false) {
  const location = getActiveLocation();
  if (!location) {
    hideWeatherNotice();
    render();
    return;
  }
  const cached = state.weatherCache[location.id];
  if (!force && cached?.fetchedAt && Date.now() - Number(cached.fetchedAt) < FORECAST_TTL_MS) {
    render();
    return;
  }
  const token = ++weatherRequestToken;
  showWeatherNotice(`${location.name}の天気予報を更新しています`);
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(location.latitude));
    url.searchParams.set("longitude", String(location.longitude));
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max");
    url.searchParams.set("timezone", location.timezone && location.timezone !== "auto" ? location.timezone : "auto");
    url.searchParams.set("forecast_days", "16");
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.daily || !Array.isArray(data.daily.time)) throw new Error("Invalid weather response");
    const days = {};
    data.daily.time.forEach((time, index) => {
      days[time] = {
        code: Number(data.daily.weather_code?.[index] ?? 0),
        max: Number(data.daily.temperature_2m_max?.[index]),
        min: Number(data.daily.temperature_2m_min?.[index]),
        precipitationProbability: Number(data.daily.precipitation_probability_max?.[index] ?? 0)
      };
    });
    if (token !== weatherRequestToken) return;
    state.weatherCache[location.id] = { fetchedAt: Date.now(), days };
    saveState();
    hideWeatherNotice();
    render();
  } catch (error) {
    console.warn("Dayscape: weather refresh failed.", error);
    if (token !== weatherRequestToken) return;
    hideWeatherNotice();
    render();
    showToast(cached ? "天気予報を更新できませんでした。保存済みの予報を表示します" : "天気予報を取得できませんでした");
  }
}

async function refreshAllWeather() {
  if (!state.locations.length) {
    showToast("先に天気の表示地点を追加してください");
    return;
  }
  els.refreshWeatherButton.disabled = true;
  showToast("登録地点の天気予報を更新します");
  for (const location of state.locations) {
    state.settings.activeLocationId = location.id;
    await refreshActiveWeather(true);
  }
  const home = state.locations.find(location => location.isHome) || state.locations[0];
  state.settings.activeLocationId = home?.id || "";
  saveState();
  render();
  els.refreshWeatherButton.disabled = false;
  showToast("天気予報を更新しました");
}

function getWeatherForDate(key) {
  const active = getActiveLocation();
  if (!active) return null;
  const weather = state.weatherCache[active.id]?.days?.[key];
  if (!weather || !Number.isFinite(weather.max) || !Number.isFinite(weather.min)) return null;
  return weather;
}

function showWeatherNotice(text) {
  els.weatherNoticeText.textContent = text;
  els.weatherNotice.hidden = false;
}

function hideWeatherNotice() {
  els.weatherNotice.hidden = true;
}

function exportData() {
  const payload = {
    app: "Dayscape",
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data: state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dayscape-backup-${dateKey(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("バックアップを保存しました");
}

async function importData(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const candidate = parsed?.data || parsed;
    const normalized = normalizeState(candidate);
    if (!window.confirm("現在の予定と設定を、選択したバックアップで置き換えますか？")) return;
    state = normalized;
    ensureHomeLocation();
    saveState();
    render();
    renderSettings();
    refreshActiveWeather();
    showToast("バックアップを復元しました");
  } catch (error) {
    console.warn("Dayscape: import failed.", error);
    showToast("選択したバックアップを読み込めませんでした");
  } finally {
    els.importInput.value = "";
  }
}

function clearAllData() {
  if (!window.confirm("予定・表示地点・カテゴリを初期状態に戻しますか？\nこの操作は元に戻せません。")) return;
  state = defaultState();
  anchorDate = startOfDay(new Date());
  saveState();
  render();
  renderSettings();
  refreshActiveWeather(true);
  showToast("データを初期化しました");
}

function navigatePeriod(direction) {
  if (state.settings.view === "month") anchorDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + direction, 1);
  if (state.settings.view === "week") anchorDate = addDays(anchorDate, direction * 7);
  if (state.settings.view === "day") anchorDate = addDays(anchorDate, direction);
  render();
}

function setView(view) {
  if (!["month", "week", "day"].includes(view)) return;
  state.settings.view = view;
  saveState();
  render();
}

function openSheet(sheet, focusTarget) {
  lastFocusedElement = document.activeElement;
  document.body.classList.add("modal-open");
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  setTimeout(() => focusTarget?.focus({ preventScroll: true }), 80);
}

function closeSheet(sheet) {
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  if (![els.eventSheet, els.settingsSheet].some(item => item.classList.contains("is-open"))) {
    document.body.classList.remove("modal-open");
  }
  lastFocusedElement?.focus?.({ preventScroll: true });
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2800);
}

function ensureHomeLocation() {
  if (!state.locations.length) {
    state.settings.activeLocationId = "";
    return;
  }
  const homes = state.locations.filter(location => location.isHome);
  if (homes.length !== 1) {
    const homeId = homes[0]?.id || state.locations[0].id;
    state.locations = state.locations.map(location => ({ ...location, isHome: location.id === homeId }));
  }
  if (!state.locations.some(location => location.id === state.settings.activeLocationId)) {
    state.settings.activeLocationId = state.locations.find(location => location.isHome)?.id || state.locations[0].id;
  }
}

function getActiveLocation() {
  return state.locations.find(location => location.id === state.settings.activeLocationId)
    || state.locations.find(location => location.isHome)
    || state.locations[0]
    || null;
}

function eventsForDate(key) {
  const dayStart = parseDateKey(key);
  const dayEnd = addDays(dayStart, 1);
  return state.events
    .filter(event => {
      const start = parseLocalDateTime(event.start);
      const end = parseLocalDateTime(event.end);
      return start < dayEnd && end > dayStart;
    })
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return parseLocalDateTime(a.start) - parseLocalDateTime(b.start);
    });
}
