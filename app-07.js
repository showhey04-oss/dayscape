"use strict";
function readSessionMapsDemoKey() {
  try {
    const hash = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
    const params = new URLSearchParams(hash);
    const hashKey = cleanConfigValue(params.get("dayscapeDemoKey"));
    if (hashKey) {
      try { sessionStorage.setItem("dayscape.maps.demoKey", hashKey); } catch (_) {}
      try { history.replaceState(null, "", `${location.pathname}${location.search}`); } catch (_) {}
      return hashKey;
    }
  } catch (_) {}
  try {
    return cleanConfigValue(sessionStorage.getItem("dayscape.maps.demoKey"));
  } catch (_) {
    return "";
  }
}

const STORAGE_KEY = "dayscape.calendar.v1";
const APP_VERSION = "1.2.1";
const CONFIGURED_GOOGLE_MAPS_API_KEY = cleanConfigValue(window.DAYSCAPE_CONFIG?.googleMapsApiKey);
const SESSION_GOOGLE_MAPS_DEMO_KEY = readSessionMapsDemoKey();
const GOOGLE_MAPS_API_KEY = CONFIGURED_GOOGLE_MAPS_API_KEY || SESSION_GOOGLE_MAPS_DEMO_KEY;
const GOOGLE_MAPS_KEY_MODE = CONFIGURED_GOOGLE_MAPS_API_KEY ? "configured" : (SESSION_GOOGLE_MAPS_DEMO_KEY ? "demo-session" : "none");
const FORECAST_TTL_MS = 30 * 60 * 1000;
const HOUR_HEIGHT = 82;
const COMPANIONS = ["ひとり", "パートナー", "子ども", "家族全員", "友人"];
const COMPANION_ALIASES = { "家族みんな": "家族全員" };
const LEGACY_TAG_NAMES = {
  "tag-outing": { "おでかけ": "外出" },
  "tag-learning": { "学び": "学習" },
  "tag-health": { "からだ": "健康" },
  "tag-home": { "暮らし": "生活" }
};
const DEFAULT_TAGS = [
  { id: "tag-family", name: "家族", color: "#b86f67" },
  { id: "tag-outing", name: "外出", color: "#5f806c" },
  { id: "tag-work", name: "仕事", color: "#63788d" },
  { id: "tag-learning", name: "学習", color: "#ad844a" },
  { id: "tag-health", name: "健康", color: "#806b83" },
  { id: "tag-home", name: "生活", color: "#897765" }
];
const DEFAULT_LOCATION = {
  id: "loc-tokyo",
  name: "東京",
  admin1: "東京都",
  country: "日本",
  latitude: 35.6895,
  longitude: 139.6917,
  timezone: "Asia/Tokyo",
  isHome: true
};

const els = {
  calendarRoot: document.getElementById("calendarRoot"),
  periodTitle: document.getElementById("periodTitle"),
  periodSubtitle: document.getElementById("periodSubtitle"),
  periodLabel: document.getElementById("periodLabel"),
  previousButton: document.getElementById("previousButton"),
  nextButton: document.getElementById("nextButton"),
  todayButton: document.getElementById("todayButton"),
  viewButtons: [...document.querySelectorAll("[data-view]")],
  activeLocationSelect: document.getElementById("activeLocationSelect"),
  weatherNotice: document.getElementById("weatherNotice"),
  weatherNoticeText: document.getElementById("weatherNoticeText"),
  settingsButton: document.getElementById("settingsButton"),
  addEventButton: document.getElementById("addEventButton"),
  jumpDateInput: document.getElementById("jumpDateInput"),
  eventSheet: document.getElementById("eventSheet"),
  settingsSheet: document.getElementById("settingsSheet"),
  eventSheetTitle: document.getElementById("eventSheetTitle"),
  eventForm: document.getElementById("eventForm"),
  eventTitle: document.getElementById("eventTitle"),
  eventPlaceSearchHost: document.getElementById("eventPlaceSearchHost"),
  eventPlaceSelected: document.getElementById("eventPlaceSelected"),
  eventPlaceName: document.getElementById("eventPlaceName"),
  eventPlaceAddress: document.getElementById("eventPlaceAddress"),
  eventPlaceAttribution: document.getElementById("eventPlaceAttribution"),
  eventPlaceChange: document.getElementById("eventPlaceChange"),
  eventPlaceNote: document.getElementById("eventPlaceNote"),
  eventAllDay: document.getElementById("eventAllDay"),
  timedDateFields: document.getElementById("timedDateFields"),
  allDayDateFields: document.getElementById("allDayDateFields"),
  eventStart: document.getElementById("eventStart"),
  eventEnd: document.getElementById("eventEnd"),
  eventStartDatePart: document.getElementById("eventStartDatePart"),
  eventStartTimePart: document.getElementById("eventStartTimePart"),
  eventEndDatePart: document.getElementById("eventEndDatePart"),
  eventEndTimePart: document.getElementById("eventEndTimePart"),
  eventStartDate: document.getElementById("eventStartDate"),
  eventEndDate: document.getElementById("eventEndDate"),
  eventDeparture: document.getElementById("eventDeparture"),
  eventDepartureDatePart: document.getElementById("eventDepartureDatePart"),
  eventDepartureTimePart: document.getElementById("eventDepartureTimePart"),
  clearDepartureButton: document.getElementById("clearDepartureButton"),
  companionChoices: document.getElementById("companionChoices"),
  eventCompanionNote: document.getElementById("eventCompanionNote"),
  eventLocation: document.getElementById("eventLocation"),
  eventTagChoices: document.getElementById("eventTagChoices"),
  eventFormError: document.getElementById("eventFormError"),
  eventSheetFooter: document.getElementById("eventSheetFooter"),
  deleteEventButton: document.getElementById("deleteEventButton"),
  saveEventButton: document.getElementById("saveEventButton"),
  locationList: document.getElementById("locationList"),
  locationSearchForm: document.getElementById("locationSearchForm"),
  locationSearchInput: document.getElementById("locationSearchInput"),
  locationSearchStatus: document.getElementById("locationSearchStatus"),
  locationSearchResults: document.getElementById("locationSearchResults"),
  refreshWeatherButton: document.getElementById("refreshWeatherButton"),
  tagManagerList: document.getElementById("tagManagerList"),
  tagAddForm: document.getElementById("tagAddForm"),
  newTagName: document.getElementById("newTagName"),
  newTagColor: document.getElementById("newTagColor"),
  exportButton: document.getElementById("exportButton"),
  importButton: document.getElementById("importButton"),
  importInput: document.getElementById("importInput"),
  clearButton: document.getElementById("clearButton"),
  toast: document.getElementById("toast")
};

let state = loadState();
let anchorDate = startOfDay(new Date());
let editingEventId = null;
let departureFollowsStart = false;
let toastTimer = null;
let lastFocusedElement = null;
let weatherRequestToken = 0;
let eventPlaceDraft = null;
let eventPlaceAutocomplete = null;
let eventPlaceFallbackInput = null;
let googlePlacesReady = false;
let eventPlaceViewportFixed = false;
let eventPlaceViewportScrollY = 0;
let eventPlaceViewportSheetScrollTop = 0;
let eventPlaceViewportTimers = [];
const resolvedGooglePlaces = new Map();
const googlePlaceResolveInFlight = new Map();

els.previousButton.addEventListener("click", () => navigatePeriod(-1));
els.nextButton.addEventListener("click", () => navigatePeriod(1));
els.todayButton.addEventListener("click", () => { anchorDate = startOfDay(new Date()); render(); });
els.viewButtons.forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
els.activeLocationSelect.addEventListener("change", () => {
  state.settings.activeLocationId = els.activeLocationSelect.value;
  saveState();
  render();
  refreshActiveWeather();
});
els.periodLabel.addEventListener("click", () => {
  els.jumpDateInput.value = dateKey(anchorDate);
  try {
    if (typeof els.jumpDateInput.showPicker === "function") els.jumpDateInput.showPicker();
    else els.jumpDateInput.click();
  } catch (error) {
    els.jumpDateInput.click();
  }
});
els.jumpDateInput.addEventListener("change", () => {
  if (!els.jumpDateInput.value) return;
  anchorDate = parseDateKey(els.jumpDateInput.value);
  render();
});
els.addEventButton.addEventListener("click", () => openEventSheet(null, dateKey(anchorDate)));
els.settingsButton.addEventListener("click", openSettingsSheet);
els.saveEventButton.addEventListener("click", saveEventFromForm);
els.deleteEventButton.addEventListener("click", deleteEditingEvent);
els.eventAllDay.addEventListener("change", syncAllDayFields);
els.eventStartDatePart.addEventListener("input", updateStartDateTimeFromParts);
els.eventStartTimePart.addEventListener("input", updateStartDateTimeFromParts);
els.eventEndDatePart.addEventListener("input", updateEndDateTimeFromParts);
els.eventEndTimePart.addEventListener("input", updateEndDateTimeFromParts);
els.eventDepartureDatePart.addEventListener("input", updateDepartureDateTimeFromParts);
els.eventDepartureTimePart.addEventListener("input", updateDepartureDateTimeFromParts);
els.clearDepartureButton.addEventListener("click", clearDepartureDateTime);
els.eventStartDate.addEventListener("change", () => {
  if (!els.eventEndDate.value || els.eventEndDate.value < els.eventStartDate.value) els.eventEndDate.value = els.eventStartDate.value;
  if (departureFollowsStart && els.eventStartDate.value) {
    const departureTime = els.eventDeparture.value.slice(11, 16) || els.eventStart.value.slice(11, 16) || "10:00";
    els.eventDeparture.value = `${els.eventStartDate.value}T${departureTime}`;
  }
  syncDateTimePartsFromCanonical();
});
els.eventForm.addEventListener("submit", event => { event.preventDefault(); saveEventFromForm(); });
els.eventPlaceChange.addEventListener("click", () => {
  setEventPlaceDraft(null);
  if (eventPlaceFallbackInput) eventPlaceFallbackInput.focus();
  else if (eventPlaceAutocomplete?.focus) eventPlaceAutocomplete.focus();
});
installEventPlaceViewportFix();

document.querySelectorAll('[data-close-sheet="event"]').forEach(button => button.addEventListener("click", closeEventSheet));
document.querySelectorAll('[data-close-sheet="settings"]').forEach(button => button.addEventListener("click", closeSettingsSheet));

els.calendarRoot.addEventListener("click", event => {
  const placeLink = event.target.closest("[data-place-link]");
  if (placeLink) return;
  const eventButton = event.target.closest("[data-event-id]");
  if (eventButton) {
    openEventSheet(eventButton.dataset.eventId);
    return;
  }
  const addDateButton = event.target.closest("[data-add-date]");
  if (addDateButton) {
    openEventSheet(null, addDateButton.dataset.addDate);
    return;
  }
});

els.calendarRoot.addEventListener("keydown", event => {
  const addDateTarget = event.target.closest('[role="button"][data-add-date]');
  if (!addDateTarget || addDateTarget.tagName === "BUTTON") return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  openEventSheet(null, addDateTarget.dataset.addDate);
});
