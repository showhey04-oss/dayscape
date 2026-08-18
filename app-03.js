"use strict";
function renderEventPlaceSelection() {
  const place = eventPlaceDraft;
  els.eventPlaceSelected.hidden = !place || place.source === "text";
  if (!place) {
    els.eventPlaceName.textContent = "";
    els.eventPlaceAddress.textContent = "";
    els.eventPlaceAttribution.innerHTML = "";
    els.eventPlaceAttribution.hidden = true;
    return;
  }
  els.eventPlaceName.textContent = place.name;
  els.eventPlaceAddress.textContent = place.address || (place.source === "google" ? "選択したGoogle マップの場所" : "自由入力");
  els.eventPlaceAttribution.innerHTML = place.source === "google" ? renderGoogleAttributions(place) : "";
  els.eventPlaceAttribution.hidden = place.source !== "google";
}

function getEventPlaceForSave() {
  if (eventPlaceDraft?.source === "google" && eventPlaceDraft.placeId) {
    resolvedGooglePlaces.set(eventPlaceDraft.placeId, { ...eventPlaceDraft });
    return { source: "google", placeId: eventPlaceDraft.placeId };
  }
  if (eventPlaceDraft?.source === "text") return { source: "text", name: cleanText(eventPlaceDraft.name, 160) };
  const fallbackText = cleanText(eventPlaceFallbackInput?.value, 160);
  return fallbackText ? { source: "text", name: fallbackText } : null;
}

function renderPlaceFallback(message = "場所検索のAPIキーが未設定です。場所は自由入力で保存できます。") {
  googlePlacesReady = false;
  eventPlaceAutocomplete = null;
  els.eventPlaceSearchHost.innerHTML = `<input class="text-input place-fallback-input" id="eventPlaceFallback" type="text" maxlength="160" autocomplete="street-address" placeholder="施設名・住所を入力" />`;
  eventPlaceFallbackInput = document.getElementById("eventPlaceFallback");
  eventPlaceFallbackInput.value = eventPlaceDraft?.source === "text" ? eventPlaceDraft.name : "";
  eventPlaceFallbackInput.addEventListener("input", () => {
    if (eventPlaceDraft && (eventPlaceDraft.source !== "text" || eventPlaceFallbackInput.value !== eventPlaceDraft.name)) {
      eventPlaceDraft = null;
      renderEventPlaceSelection();
    }
  });
  els.eventPlaceNote.textContent = message;
}

function cacheGooglePlaceDetails(place) {
  const placeId = cleanText(place?.id || place?.placeId, 240);
  if (!placeId) return null;
  const location = place?.location;
  const latitude = Number(typeof location?.lat === "function" ? location.lat() : (location?.lat ?? place?.latitude));
  const longitude = Number(typeof location?.lng === "function" ? location.lng() : (location?.lng ?? place?.longitude));
  const details = {
    source: "google",
    placeId,
    name: cleanText(place?.displayName || place?.name, 160) || "Google マップの場所",
    address: cleanText(place?.formattedAddress || place?.address, 240),
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    attributions: googlePlaceAttributionData(place)
  };
  resolvedGooglePlaces.set(placeId, details);
  return details;
}

async function resolveGooglePlace(placeId) {
  const id = cleanText(placeId, 240);
  if (!id || !googlePlacesReady || !window.google?.maps?.places?.Place) return null;
  if (resolvedGooglePlaces.has(id)) return resolvedGooglePlaces.get(id);
  if (googlePlaceResolveInFlight.has(id)) return googlePlaceResolveInFlight.get(id);
  const promise = (async () => {
    try {
      const place = new google.maps.places.Place({ id });
      await place.fetchFields({ fields: ["id", "displayName", "formattedAddress", "location"] });
      return cacheGooglePlaceDetails(place);
    } catch (error) {
      console.warn("Dayscape: saved place could not be resolved.", error);
      return null;
    } finally {
      googlePlaceResolveInFlight.delete(id);
    }
  })();
  googlePlaceResolveInFlight.set(id, promise);
  return promise;
}

let visibleGooglePlaceResolutionPromise = null;

function visibleEventRange() {
  if (state.settings.view === "week") {
    const start = startOfWeek(anchorDate);
    return { start, end: addDays(start, 7) };
  }
  if (state.settings.view === "day") {
    const start = startOfDay(anchorDate);
    return { start, end: addDays(start, 1) };
  }
  return null;
}

function visibleGooglePlaceIds() {
  const range = visibleEventRange();
  if (!range) return [];
  const ids = new Set();
  state.events.forEach(event => {
    const start = parseLocalDateTime(event.start);
    const end = parseLocalDateTime(event.end);
    if (start >= range.end || end <= range.start) return;
    const place = normalizePlace(event.place);
    if (place?.source === "google" && place.placeId) ids.add(place.placeId);
  });
  return [...ids];
}

async function resolveGooglePlacesForVisibleEvents() {
  if (!googlePlacesReady || state.settings.view === "month") return;
  if (visibleGooglePlaceResolutionPromise) return visibleGooglePlaceResolutionPromise;
  const unresolved = visibleGooglePlaceIds().filter(id => !resolvedGooglePlaces.has(id));
  if (!unresolved.length) return;

  const promise = Promise.all(unresolved.map(resolveGooglePlace));
  visibleGooglePlaceResolutionPromise = promise;
  try {
    await promise;
  } finally {
    if (visibleGooglePlaceResolutionPromise === promise) visibleGooglePlaceResolutionPromise = null;
  }
  render();
}

const renderWithoutGooglePlaceResolution = render;
render = function renderWithVisibleGooglePlaceResolution() {
  renderWithoutGooglePlaceResolution();
  if (state.settings.view !== "month") void resolveGooglePlacesForVisibleEvents();
};

function loadGoogleMapsScript(apiKey) {
  if (window.google?.maps?.importLibrary) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const callbackName = `dayscapeGoogleMapsReady_${Date.now()}`;
    window[callbackName] = () => { delete window[callbackName]; resolve(); };
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=${callbackName}`;
    script.onerror = () => { delete window[callbackName]; reject(new Error("Google Maps JavaScript API could not load")); };
    document.head.appendChild(script);
  });
}

async function initializeEventPlaceSearch() {
  if (!GOOGLE_MAPS_API_KEY) {
    renderPlaceFallback();
    return;
  }
  try {
    await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
    const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");
    const autocomplete = new PlaceAutocompleteElement({ includedRegionCodes: ["jp"] });
    autocomplete.placeholder = "施設名・住所を検索";
    autocomplete.style.width = "100%";
    autocomplete.addEventListener("gmp-select", async ({ placePrediction }) => {
      try {
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ["id", "displayName", "formattedAddress", "location"] });
        const details = cacheGooglePlaceDetails(place);
        setEventPlaceDraft(details);
        try { autocomplete.value = ""; } catch (_) {}
      } catch (error) {
        console.warn("Dayscape: place details could not be read.", error);
        showToast("場所の情報を取得できませんでした");
      }
    });
    els.eventPlaceSearchHost.replaceChildren(autocomplete);
    eventPlaceAutocomplete = autocomplete;
    eventPlaceFallbackInput = null;
    googlePlacesReady = true;
    els.eventPlaceNote.textContent = "Google マップの候補から場所を選択できます。";
    void resolveGooglePlacesForVisibleEvents();
  } catch (error) {
    console.warn("Dayscape: Google Places could not be initialized.", error);
    renderPlaceFallback("場所検索に接続できないため、自由入力で保存できます。");
  }
}

function openEventSheet(eventId = null, preferredDateKey = dateKey(anchorDate)) {
  editingEventId = eventId;
  const event = eventId ? state.events.find(item => item.id === eventId) : null;
  els.eventFormError.textContent = "";
  els.eventForm.reset();
  renderCompanionChoices(event?.companions || []);
  renderEventTagChoices(event?.tagIds || []);
  renderLocationSelects();

  if (event) {
    els.eventSheetTitle.textContent = "予定を編集";
    els.eventTitle.value = event.title;
    setEventPlaceDraft(event.place);
    const storedPlace = normalizePlace(event.place);
    if (storedPlace?.source === "google" && !resolvedGooglePlaces.has(storedPlace.placeId)) {
      resolveGooglePlace(storedPlace.placeId).then(details => {
        if (details && editingEventId === event.id) setEventPlaceDraft(details);
      });
    }
    els.eventAllDay.checked = event.allDay;
    els.eventStart.value = event.start;
    els.eventEnd.value = event.end;
    els.eventStartDate.value = event.start.slice(0, 10);
    els.eventEndDate.value = event.end.slice(0, 10);
    els.eventDeparture.value = event.departure || "";
    departureFollowsStart = false;
    els.eventCompanionNote.value = event.companionNote || "";
    els.eventLocation.value = state.locations.some(location => location.id === event.locationId) ? event.locationId : "";
    els.deleteEventButton.hidden = false;
    els.eventSheetFooter.classList.remove("is-new");
  } else {
    const defaults = defaultEventTimes(preferredDateKey);
    els.eventSheetTitle.textContent = "新しい予定";
    els.eventTitle.value = "";
    setEventPlaceDraft(null);
    els.eventAllDay.checked = false;
    els.eventStart.value = defaults.start;
    els.eventEnd.value = defaults.end;
    els.eventStartDate.value = preferredDateKey;
    els.eventEndDate.value = preferredDateKey;
    els.eventDeparture.value = defaults.start;
    departureFollowsStart = true;
    els.eventCompanionNote.value = "";
    els.eventLocation.value = state.locations.find(location => location.isHome)?.id || "";
    els.deleteEventButton.hidden = true;
    els.eventSheetFooter.classList.add("is-new");
  }
  syncAllDayFields();
  openSheet(els.eventSheet, els.eventTitle);
}

function closeEventSheet() {
  closeSheet(els.eventSheet);
  editingEventId = null;
  departureFollowsStart = false;
}
