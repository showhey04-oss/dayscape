"use strict";

els.locationSearchForm.addEventListener("submit", event => {
  event.preventDefault();
  searchLocations(els.locationSearchInput.value);
});
els.locationSearchResults.addEventListener("click", event => {
  const button = event.target.closest("[data-add-search-result]");
  if (button) addLocationFromSearch(Number(button.dataset.addSearchResult));
});
els.locationList.addEventListener("change", event => {
  const input = event.target.closest('input[name="homeLocation"]');
  if (input) setHomeLocation(input.value);
});
els.locationList.addEventListener("click", event => {
  const button = event.target.closest("[data-delete-location]");
  if (button) deleteLocation(button.dataset.deleteLocation);
});
els.refreshWeatherButton.addEventListener("click", refreshAllWeather);

els.tagAddForm.addEventListener("submit", event => {
  event.preventDefault();
  addTag(els.newTagName.value, els.newTagColor.value);
});
els.tagManagerList.addEventListener("click", event => {
  const button = event.target.closest("[data-delete-tag]");
  if (button) deleteTag(button.dataset.deleteTag);
});

els.exportButton.addEventListener("click", exportData);
els.importButton.addEventListener("click", () => els.importInput.click());
els.importInput.addEventListener("change", () => importData(els.importInput.files?.[0]));
els.clearButton.addEventListener("click", clearAllData);

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (els.eventSheet.classList.contains("is-open")) closeEventSheet();
  else if (els.settingsSheet.classList.contains("is-open")) closeSettingsSheet();
});

render();
initializeEventPlaceSearch();
refreshActiveWeather();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(error => console.warn("Dayscape: service worker registration failed.", error));
  });
}
