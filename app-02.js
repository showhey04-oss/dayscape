"use strict";
function renderMonthEvent(event, dayKey) {
  const color = eventColor(event);
  const prefix = event.allDay ? "" : `${eventTimeForDay(event, dayKey)} `;
  return `<button class="month-event" type="button" data-event-id="${escapeAttr(event.id)}" style="--event-color:${color}" title="${escapeAttr(event.title)}">${escapeHTML(prefix + event.title)}</button>`;
}

function renderWeekView() {
  const start = startOfWeek(anchorDate);
  const todayKey = dateKey(new Date());
  const days = [];
  for (let index = 0; index < 7; index += 1) {
    const date = addDays(start, index);
    const key = dateKey(date);
    const events = eventsForDate(key);
    const weather = getWeatherForDate(key);
    days.push(`
      <section class="week-day ${key === todayKey ? "is-today" : ""}">
        <button class="week-day-head" type="button" data-add-date="${key}" aria-label="${escapeAttr(formatFullDate(date))}に予定を追加">
          <span class="week-date">
            <span class="week-date-number">${date.getDate()}</span>
            <span class="week-date-copy">
              <strong>${weekdayLong(date)}</strong>
              <span>${new Intl.DateTimeFormat("ja-JP", { month: "long" }).format(date)}</span>
            </span>
          </span>
          <span class="week-weather">
            ${weather ? weatherIcon(weather.code) : ""}
            <span class="week-temp">
              ${weather ? `<strong>${roundTemp(weather.max)}°</strong><span> / ${roundTemp(weather.min)}°</span>` : '<span>予報未取得</span>'}
            </span>
          </span>
        </button>
        ${events.length
          ? `<div class="week-events">${events.map(event => renderAgendaEvent(event, key)).join("")}</div>`
          : `<button class="week-empty" type="button" data-add-date="${key}" aria-label="${escapeAttr(formatFullDate(date))}に予定を追加">＋ 予定を追加</button>`}
      </section>
    `);
  }
  els.calendarRoot.innerHTML = `<div class="week-view">${days.join("")}</div>`;
}

function renderAgendaEvent(event, dayKey) {
  const color = eventColor(event);
  const time = event.allDay ? "終日" : eventTimeForDay(event, dayKey, true);
  const meta = eventMetaText(event);
  const placeLink = renderEventPlaceLink(event, "agenda-place");
  return `
    <div class="agenda-event-shell">
      <button class="agenda-event" type="button" data-event-id="${escapeAttr(event.id)}" style="--event-color:${color}">
        <span class="agenda-time">${escapeHTML(time)}</span>
        <span class="agenda-copy">
          <strong>${escapeHTML(event.title)}</strong>
          ${meta ? `<span>${escapeHTML(meta)}</span>` : ""}
        </span>
      </button>
      ${placeLink}
    </div>
  `;
}

function renderDayView() {
  const key = dateKey(anchorDate);
  const events = eventsForDate(key);
  const allDayEvents = events.filter(event => event.allDay);
  const timedEvents = events.filter(event => !event.allDay);
  const weather = getWeatherForDate(key);
  const location = getActiveLocation();
  const weatherMarkup = weather
    ? `<div class="day-weather">
        ${weatherIcon(weather.code)}
        <div class="day-weather-numbers">
          <strong>${roundTemp(weather.max)}° / ${roundTemp(weather.min)}°</strong>
          <span>降水確率 ${Math.round(weather.precipitationProbability ?? 0)}%</span>
        </div>
      </div>`
    : `<div class="day-weather"><div class="day-weather-numbers"><strong>—</strong><span>予報期間外</span></div></div>`;

  let bodyMarkup = "";
  if (!events.length) {
    bodyMarkup = `
      <button class="day-empty" type="button" data-add-date="${key}" aria-label="${escapeAttr(formatFullDate(anchorDate))}に予定を追加">
        <span class="day-empty-content">
          <span class="day-empty-graphic" aria-hidden="true"></span>
          <strong>この日の予定はありません</strong>
          <span class="day-empty-copy">タップして予定を追加できます。</span>
        </span>
      </button>
    `;
  } else {
    const allDayMarkup = allDayEvents.length
      ? `<section class="all-day-section">
          <p class="section-caption">終日</p>
          <div class="all-day-list">
            ${allDayEvents.map(event => `<div><button class="all-day-event" type="button" data-event-id="${escapeAttr(event.id)}" style="--event-color:${eventColor(event)}"><span class="all-day-dot"></span><strong>${escapeHTML(event.title)}</strong></button>${renderEventPlaceLink(event, "agenda-place")}</div>`).join("")}
          </div>
        </section>`
      : "";
    bodyMarkup = `${allDayMarkup}${renderTimeline(timedEvents, key)}`;
  }

  els.calendarRoot.innerHTML = `
    <div class="day-view">
      <section class="day-hero" data-add-date="${key}" role="button" tabindex="0" aria-label="${escapeAttr(formatFullDate(anchorDate))}に予定を追加">
        <div class="day-hero-date">${formatFullDate(anchorDate)}</div>
        <div class="day-hero-main">
          <h2>${weekdayLong(anchorDate)}</h2>
          ${weatherMarkup}
        </div>
        <div class="day-location">
          <svg aria-hidden="true"><use href="#i-pin"></use></svg>
          <span>${escapeHTML(location ? location.name : "天気の表示地点は未設定")}</span>
        </div>
      </section>
      ${bodyMarkup}
    </div>
  `;
}

function renderTimeline(events, dayKey) {
  if (!events.length) return "";
  const segments = events.map(event => eventSegmentForDay(event, dayKey)).filter(Boolean);
  if (!segments.length) return "";
  const minMinute = Math.min(...segments.map(segment => segment.startMinute));
  const maxMinute = Math.max(...segments.map(segment => segment.endMinute));
  const startHour = Math.max(0, Math.min(7, Math.floor(minMinute / 60)));
  const endHour = Math.min(24, Math.max(22, Math.ceil(maxMinute / 60)));
  const totalHours = Math.max(1, endHour - startHour);
  const pixelsPerMinute = HOUR_HEIGHT / 60;
  const laidOut = layoutSegments(segments);
  const hourLines = [];
  for (let hour = startHour; hour <= endHour; hour += 1) {
    hourLines.push(`<div class="timeline-hour" style="top:${(hour - startHour) * HOUR_HEIGHT}px"><span>${String(hour).padStart(2, "0")}:00</span></div>`);
  }
  const eventMarkup = laidOut.map(segment => {
    const top = (segment.startMinute - startHour * 60) * pixelsPerMinute + 3;
    const rawHeight = Math.max(1, segment.endMinute - segment.startMinute) * pixelsPerMinute - 6;
    const height = Math.max(36, rawHeight);
    const laneWidth = 100 / segment.laneCount;
    const left = segment.lane * laneWidth;
    const width = laneWidth;
    const event = segment.event;
    const detail = [
      `${formatTime(parseLocalDateTime(event.start))}〜${formatTime(parseLocalDateTime(event.end))}`,
      eventMetaText(event)
    ].filter(Boolean).join(" · ");
    return `<div class="timeline-event" style="--event-color:${eventColor(event)};top:${top}px;height:${height}px;left:calc(${left}% + 6px);width:calc(${width}% - 10px)"><button class="timeline-event-main" type="button" data-event-id="${escapeAttr(event.id)}"><strong>${escapeHTML(event.title)}</strong><span>${escapeHTML(detail)}</span></button>${renderEventPlaceLink(event, "timeline-place")}</div>`;
  }).join("");

  let nowLine = "";
  const now = new Date();
  if (dayKey === dateKey(now)) {
    const minute = now.getHours() * 60 + now.getMinutes();
    if (minute >= startHour * 60 && minute <= endHour * 60) {
      const top = (minute - startHour * 60) * pixelsPerMinute;
      nowLine = `<div class="now-line" style="top:${top}px" aria-label="現在時刻"></div>`;
    }
  }

  return `<section class="timeline-wrap"><p class="section-caption">時間ごとの予定</p><div class="timeline" style="height:${totalHours * HOUR_HEIGHT}px">${hourLines.join("")}${eventMarkup}${nowLine}</div></section>`;
}

function layoutSegments(segments) {
  const sorted = [...segments].sort((a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute);
  const groups = [];
  let group = [];
  let groupEnd = -1;
  sorted.forEach(segment => {
    if (group.length && segment.startMinute >= groupEnd) {
      groups.push(group);
      group = [];
      groupEnd = -1;
    }
    group.push(segment);
    groupEnd = Math.max(groupEnd, segment.endMinute);
  });
  if (group.length) groups.push(group);

  return groups.flatMap(items => {
    const laneEnds = [];
    items.forEach(item => {
      let lane = laneEnds.findIndex(end => end <= item.startMinute);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = item.endMinute;
      item.lane = lane;
    });
    const laneCount = Math.max(1, laneEnds.length);
    return items.map(item => ({ ...item, laneCount }));
  });
}

function renderCompanionChoices(selected = []) {
  els.companionChoices.innerHTML = COMPANIONS.map(name => `
    <label class="choice-chip">
      <input type="checkbox" value="${escapeAttr(name)}" ${selected.includes(name) ? "checked" : ""} />
      <span>${escapeHTML(name)}</span>
    </label>
  `).join("");
}

function renderEventTagChoices(selected = []) {
  els.eventTagChoices.innerHTML = state.tags.map(tag => `
    <label class="tag-chip" style="--tag-color:${tag.color}">
      <input type="checkbox" value="${escapeAttr(tag.id)}" ${selected.includes(tag.id) ? "checked" : ""} />
      <span><i class="tag-chip-dot"></i>${escapeHTML(tag.name)}</span>
    </label>
  `).join("");
}

function setEventPlaceDraft(place) {
  eventPlaceDraft = normalizePlaceDraft(place);
  renderEventPlaceSelection();
  if (eventPlaceFallbackInput) {
    eventPlaceFallbackInput.value = eventPlaceDraft?.source === "text" ? eventPlaceDraft.name : "";
  }
  if (eventPlaceAutocomplete && !eventPlaceDraft) {
    try { eventPlaceAutocomplete.value = ""; } catch (_) {}
  }
}
