"use strict";
function combineDateTimeParts(dateValue, timeValue) {
  const date = cleanText(dateValue, 10);
  const time = cleanText(timeValue, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return "";
  return normalizeLocalDateTime(`${date}T${time}`) || "";
}

function writeDateTimeParts(dateInput, timeInput, value) {
  const normalized = normalizeLocalDateTime(value);
  dateInput.value = normalized ? normalized.slice(0, 10) : "";
  timeInput.value = normalized ? normalized.slice(11, 16) : "";
}

function syncDateTimePartsFromCanonical() {
  writeDateTimeParts(els.eventStartDatePart, els.eventStartTimePart, els.eventStart.value);
  writeDateTimeParts(els.eventEndDatePart, els.eventEndTimePart, els.eventEnd.value);
  writeDateTimeParts(els.eventDepartureDatePart, els.eventDepartureTimePart, els.eventDeparture.value);
  els.clearDepartureButton.disabled = !normalizeLocalDateTime(els.eventDeparture.value);
}

function syncCanonicalDateTimeFromParts() {
  els.eventStart.value = combineDateTimeParts(els.eventStartDatePart.value, els.eventStartTimePart.value);
  els.eventEnd.value = combineDateTimeParts(els.eventEndDatePart.value, els.eventEndTimePart.value);
  els.eventDeparture.value = combineDateTimeParts(els.eventDepartureDatePart.value, els.eventDepartureTimePart.value);
  els.clearDepartureButton.disabled = !els.eventDeparture.value;
}

function updateStartDateTimeFromParts() {
  els.eventStart.value = combineDateTimeParts(els.eventStartDatePart.value, els.eventStartTimePart.value);
  handleEventStartChange();
  syncDateTimePartsFromCanonical();
}

function updateEndDateTimeFromParts() {
  els.eventEnd.value = combineDateTimeParts(els.eventEndDatePart.value, els.eventEndTimePart.value);
}

function updateDepartureDateTimeFromParts() {
  let date = cleanText(els.eventDepartureDatePart.value, 10);
  let time = cleanText(els.eventDepartureTimePart.value, 5);
  const start = normalizeLocalDateTime(els.eventStart.value);
  if ((date || time) && start) {
    if (!date) date = start.slice(0, 10);
    if (!time) time = start.slice(11, 16);
    els.eventDepartureDatePart.value = date;
    els.eventDepartureTimePart.value = time;
  }
  els.eventDeparture.value = combineDateTimeParts(date, time);
  departureFollowsStart = false;
  els.clearDepartureButton.disabled = !els.eventDeparture.value;
}

function clearDepartureDateTime() {
  els.eventDeparture.value = "";
  els.eventDepartureDatePart.value = "";
  els.eventDepartureTimePart.value = "";
  departureFollowsStart = false;
  els.clearDepartureButton.disabled = true;
}
function saveEventFromForm() {
  syncCanonicalDateTimeFromParts();
  const title = cleanText(els.eventTitle.value, 80);
  const allDay = els.eventAllDay.checked;
  let start;
  let end;
  if (allDay) {
    start = els.eventStartDate.value ? `${els.eventStartDate.value}T00:00` : "";
    end = els.eventEndDate.value ? `${els.eventEndDate.value}T23:59` : "";
  } else {
    start = normalizeLocalDateTime(els.eventStart.value);
    end = normalizeLocalDateTime(els.eventEnd.value);
  }
  const departure = normalizeLocalDateTime(els.eventDeparture.value) || "";

  if (!title) return showEventError("予定名を入力してください。");
  if (!start || !end) return showEventError("予定の日時を入力してください。");
  if (parseLocalDateTime(end) <= parseLocalDateTime(start)) return showEventError("終了日時は開始日時より後に設定してください。");
  if (!allDay && departure && parseLocalDateTime(departure) > parseLocalDateTime(start)) return showEventError("出発日時は開始日時以前に設定してください。");

  const companions = [...els.companionChoices.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value);
  const tagIds = [...els.eventTagChoices.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value);
  const nowIso = new Date().toISOString();
  const existing = editingEventId ? state.events.find(event => event.id === editingEventId) : null;
  const nextEvent = {
    id: existing?.id || createId("evt"),
    title,
    start,
    end,
    allDay,
    departure,
    place: getEventPlaceForSave(),
    companions,
    companionNote: cleanText(els.eventCompanionNote.value, 60),
    locationId: state.locations.some(location => location.id === els.eventLocation.value) ? els.eventLocation.value : "",
    tagIds: tagIds.filter(id => state.tags.some(tag => tag.id === id)),
    createdAt: existing?.createdAt || nowIso,
    updatedAt: nowIso
  };

  if (existing) {
    state.events = state.events.map(event => event.id === existing.id ? nextEvent : event);
  } else {
    state.events.push(nextEvent);
  }
  state.events.sort((a, b) => parseLocalDateTime(a.start) - parseLocalDateTime(b.start));
  saveState();
  anchorDate = parseDateKey(start.slice(0, 10));
  render();
  closeEventSheet();
  showToast(existing ? "予定を更新しました" : "予定を追加しました");
}

function deleteEditingEvent() {
  if (!editingEventId) return;
  const event = state.events.find(item => item.id === editingEventId);
  if (!event) return;
  if (!window.confirm(`「${event.title}」を削除しますか？`)) return;
  state.events = state.events.filter(item => item.id !== editingEventId);
  saveState();
  render();
  closeEventSheet();
  showToast("予定を削除しました");
}

function showEventError(message) {
  els.eventFormError.textContent = message;
  els.eventFormError.scrollIntoView({ behavior: "smooth", block: "center" });
}

function syncAllDayFields() {
  const allDay = els.eventAllDay.checked;
  els.timedDateFields.hidden = allDay;
  els.allDayDateFields.hidden = !allDay;
  if (allDay) {
    const startDate = els.eventStart.value.slice(0, 10) || els.eventStartDate.value || dateKey(anchorDate);
    const endDate = els.eventEnd.value.slice(0, 10) || els.eventEndDate.value || startDate;
    els.eventStartDate.value = startDate;
    els.eventEndDate.value = endDate < startDate ? startDate : endDate;
  } else {
    const startDate = els.eventStartDate.value || els.eventStart.value.slice(0, 10) || dateKey(anchorDate);
    const endDate = els.eventEndDate.value || els.eventEnd.value.slice(0, 10) || startDate;
    const startTime = els.eventStart.value.slice(11, 16) || "10:00";
    const endTime = els.eventEnd.value.slice(11, 16) || "11:00";
    els.eventStart.value = `${startDate}T${startTime}`;
    els.eventEnd.value = `${endDate}T${endTime}`;
    if (parseLocalDateTime(els.eventEnd.value) <= parseLocalDateTime(els.eventStart.value)) {
      els.eventEnd.value = localDateTimeValue(addMinutes(parseLocalDateTime(els.eventStart.value), 60));
    }
  }
  syncDateTimePartsFromCanonical();
}

function defaultEventTimes(preferredDateKey) {
  const today = dateKey(new Date());
  let startDate;
  if (preferredDateKey === today) {
    startDate = new Date();
    startDate.setSeconds(0, 0);
    startDate = addMinutes(startDate, 30);
  } else {
    startDate = parseDateKey(preferredDateKey);
    startDate.setHours(10, 0, 0, 0);
  }
  const endDate = addMinutes(startDate, 60);
  return { start: localDateTimeValue(startDate), end: localDateTimeValue(endDate) };
}

function openSettingsSheet() {
  renderSettings();
  openSheet(els.settingsSheet, els.locationSearchInput);
}

function closeSettingsSheet() {
  closeSheet(els.settingsSheet);
  els.locationSearchResults.innerHTML = "";
  els.locationSearchStatus.textContent = "";
}

function renderSettings() {
  renderLocationList();
  renderTagManager();
}

function renderLocationList() {
  if (!state.locations.length) {
    els.locationList.innerHTML = '<div class="attribution">天気の表示地点がありません。下の検索から追加してください。</div>';
    return;
  }
  els.locationList.innerHTML = state.locations.map(location => {
    const subtitle = [location.admin1, location.country].filter(Boolean).join(" · ");
    return `
      <div class="location-item">
        <label class="home-radio" title="ホーム地点に設定">
          <input type="radio" name="homeLocation" value="${escapeAttr(location.id)}" ${location.isHome ? "checked" : ""} />
          <span></span>
        </label>
        <div class="location-main">
          <strong>${escapeHTML(location.name)}</strong>
          <span>${escapeHTML(subtitle || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`)}</span>
        </div>
        <button class="mini-icon-button is-danger" type="button" data-delete-location="${escapeAttr(location.id)}" aria-label="${escapeAttr(location.name)}を削除">
          <svg aria-hidden="true"><use href="#i-trash"></use></svg>
        </button>
      </div>
    `;
  }).join("");
}

function renderTagManager() {
  els.tagManagerList.innerHTML = state.tags.map(tag => `
    <div class="tag-manager-item">
      <span class="tag-color-dot" style="--tag-color:${tag.color}"></span>
      <div class="tag-manager-main">
        <strong>${escapeHTML(tag.name)}</strong>
        <span>${tag.color.toUpperCase()}</span>
      </div>
      <button class="mini-icon-button is-danger" type="button" data-delete-tag="${escapeAttr(tag.id)}" aria-label="${escapeAttr(tag.name)}を削除">
        <svg aria-hidden="true"><use href="#i-trash"></use></svg>
      </button>
    </div>
  `).join("");
}

async function searchLocations(query) {
  const name = cleanText(query, 80);
  els.locationSearchResults.innerHTML = "";
  if (name.length < 2) {
    els.locationSearchStatus.textContent = "2文字以上で検索してください。";
    return;
  }
  els.locationSearchStatus.textContent = "検索しています…";
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", name);
    url.searchParams.set("count", "6");
    url.searchParams.set("language", "ja");
    url.searchParams.set("format", "json");
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    if (!results.length) {
      els.locationSearchStatus.textContent = "候補が見つかりませんでした。";
      return;
    }
    els.locationSearchStatus.textContent = `${results.length}件の候補`;
    els.locationSearchResults.innerHTML = results.map((result, index) => {
      const parts = [result.admin1, result.country].filter(Boolean);
      return `
        <div class="search-result-item">
          <div class="search-result-main">
            <strong>${escapeHTML(result.name || "名称なし")}</strong>
            <span>${escapeHTML(parts.join(" · "))}</span>
          </div>
          <button class="text-button" type="button" data-add-search-result="${index}">追加</button>
        </div>
      `;
    }).join("");
    els.locationSearchResults._dayscapeResults = results;
  } catch (error) {
    console.warn("Dayscape: location search failed.", error);
    els.locationSearchStatus.textContent = "検索できませんでした。通信状態を確認してください。";
  }
}

function addLocationFromSearch(index) {
  const result = els.locationSearchResults._dayscapeResults?.[index];
  if (!result) return;
  const duplicate = state.locations.some(location => Math.abs(location.latitude - Number(result.latitude)) < 0.0001 && Math.abs(location.longitude - Number(result.longitude)) < 0.0001);
  if (duplicate) {
    showToast("この地点は登録済みです");
    return;
  }
  const location = {
    id: createId("loc"),
    name: cleanText(result.name, 80) || "登録地点",
    admin1: cleanText(result.admin1, 80),
    country: cleanText(result.country, 80),
    latitude: Number(result.latitude),
    longitude: Number(result.longitude),
    timezone: cleanText(result.timezone, 80) || "auto",
    isHome: state.locations.length === 0
  };
  state.locations.push(location);
  state.settings.activeLocationId = location.id;
  ensureHomeLocation();
  saveState();
  renderSettings();
  render();
  els.locationSearchInput.value = "";
  els.locationSearchResults.innerHTML = "";
  els.locationSearchStatus.textContent = "";
  showToast(`${location.name}を追加しました`);
  refreshActiveWeather(true);
}

function setHomeLocation(id) {
  if (!state.locations.some(location => location.id === id)) return;
  state.locations = state.locations.map(location => ({ ...location, isHome: location.id === id }));
  saveState();
  renderSettings();
  render();
  showToast("ホーム地点を変更しました");
}
