"use strict";

(function installMobileSearchViewportGuards() {
  let placeSearchActive = false;
  let weatherSearchActive = false;
  const timers = new Set();

  function clearTimers() {
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
  }

  function revealSearchControl(target) {
    if (!target?.isConnected) return;
    if (target.classList.contains("is-viewport-fixed")) return;
    const sheet = target.closest(".sheet-layer");
    if (!sheet?.classList.contains("is-open")) return;
    target.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
  }

  function settleSearchControl(target) {
    clearTimers();
    [0, 120, 320].forEach(delay => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        revealSearchControl(target);
      }, delay);
      timers.add(timer);
    });
  }

  els.locationSearchInput.addEventListener("focus", () => {
    weatherSearchActive = true;
    settleSearchControl(els.locationSearchInput);
  });
  els.locationSearchInput.addEventListener("blur", () => {
    weatherSearchActive = false;
  });

  els.eventPlaceSearchHost.addEventListener("pointerdown", () => {
    placeSearchActive = true;
    settleSearchControl(els.eventPlaceSearchHost);
  });
  els.eventPlaceSearchHost.addEventListener("focusin", () => {
    placeSearchActive = true;
    settleSearchControl(els.eventPlaceSearchHost);
  });
  els.eventPlaceSearchHost.addEventListener("focusout", () => {
    setTimeout(() => {
      if (document.activeElement !== els.eventPlaceSearchHost) placeSearchActive = false;
    }, 0);
  });

  window.visualViewport?.addEventListener("resize", () => {
    if (placeSearchActive && els.eventSheet.classList.contains("is-open")) {
      settleSearchControl(els.eventPlaceSearchHost);
    } else if (weatherSearchActive && els.settingsSheet.classList.contains("is-open")) {
      settleSearchControl(els.locationSearchInput);
    }
  });
})();
