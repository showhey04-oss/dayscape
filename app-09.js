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

"use strict";

(() => {
  const READY_ATTRIBUTE = "data-swipe-dismiss-ready";
  const INTERACTIVE_SELECTOR = "button, a, input, select, textarea, [contenteditable='true'], [role='button']";
  const MIN_AXIS_DISTANCE = 7;
  const MIN_FLING_DISTANCE = 44;
  const FLING_VELOCITY = 0.55;
  const SNAP_DURATION = 180;

  function installSheetSwipeDismiss(layer) {
    if (!(layer instanceof HTMLElement) || layer.hasAttribute(READY_ATTRIBUTE)) return;
    const sheet = layer.querySelector(".sheet");
    const handle = layer.querySelector(".sheet-handle");
    const header = layer.querySelector(".sheet-header");
    const backdrop = layer.querySelector(".sheet-backdrop");
    if (!(sheet instanceof HTMLElement) || !(handle instanceof HTMLElement)) return;

    layer.setAttribute(READY_ATTRIBUTE, "true");
    handle.style.touchAction = "none";
    if (header instanceof HTMLElement) header.style.touchAction = "pan-x";

    let gesture = null;
    let settleTimer = 0;
    let swipeClosing = false;

    function clearSettleTimer() {
      if (!settleTimer) return;
      window.clearTimeout(settleTimer);
      settleTimer = 0;
    }

    function resetInlineStyles() {
      clearSettleTimer();
      gesture = null;
      layer.classList.remove("is-swipe-dragging");
      sheet.style.removeProperty("transition");
      sheet.style.removeProperty("transform");
      sheet.style.removeProperty("will-change");
      if (backdrop instanceof HTMLElement) {
        backdrop.style.removeProperty("transition");
        backdrop.style.removeProperty("opacity");
      }
    }

    function animateBack() {
      sheet.style.transition = `transform ${SNAP_DURATION}ms cubic-bezier(.2,.75,.25,1)`;
      sheet.style.transform = "translate3d(0, 0, 0)";
      if (backdrop instanceof HTMLElement) {
        backdrop.style.transition = `opacity ${SNAP_DURATION}ms ease`;
        backdrop.style.opacity = "1";
      }
      settleTimer = window.setTimeout(resetInlineStyles, SNAP_DURATION + 40);
    }

    function preserveClosedSwipeStyles() {
      clearSettleTimer();
      gesture = null;
      layer.classList.remove("is-swipe-dragging");
      sheet.style.removeProperty("transition");
      sheet.style.removeProperty("will-change");
      if (backdrop instanceof HTMLElement) {
        backdrop.style.removeProperty("transition");
      }
    }

    function requestClose(distance) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && layer.contains(active)) active.blur();

      const sheetHeight = Math.max(sheet.getBoundingClientRect().height, sheet.offsetHeight, 1);
      const targetDistance = Math.max(sheetHeight + 32, distance + 120);
      const duration = Math.max(140, Math.min(220, (targetDistance - distance) / 1.8));
      sheet.style.transition = `transform ${duration}ms cubic-bezier(.32,.72,0,1)`;
      sheet.style.transform = `translate3d(0, ${targetDistance}px, 0)`;
      if (backdrop instanceof HTMLElement) {
        backdrop.style.transition = `opacity ${duration}ms ease`;
        backdrop.style.opacity = "0";
      }

      settleTimer = window.setTimeout(() => {
        settleTimer = 0;
        swipeClosing = true;
        const closeTrigger = layer.querySelector("[data-close-sheet]");
        if (closeTrigger instanceof HTMLElement) closeTrigger.click();
        else layer.classList.remove("is-open");

        // Keep the off-screen transform/opacity after swipe-close.
        // Resetting them immediately can make iOS Safari composite the sheet
        // on-screen for one frame before the layer fully disappears.
        preserveClosedSwipeStyles();

        window.setTimeout(() => {
          swipeClosing = false;
          if (layer.classList.contains("is-open")) resetInlineStyles();
        }, 0);
      }, duration + 20);
    }

    function startGesture(event) {
      if (!layer.classList.contains("is-open")) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(INTERACTIVE_SELECTOR)) return;
      const withinHandle = handle.contains(target);
      const withinHeader = header instanceof HTMLElement && header.contains(target);
      if (!withinHandle && !withinHeader) return;

      clearSettleTimer();
      gesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startedAt: performance.now(),
        axis: "",
        distance: 0
      };
      sheet.style.willChange = "transform";
      layer.classList.add("is-swipe-dragging");
      if (typeof target.setPointerCapture === "function") {
        try { target.setPointerCapture(event.pointerId); } catch (_) {}
      }
    }

    function moveGesture(event) {
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      if (!gesture.axis) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < MIN_AXIS_DISTANCE) return;
        gesture.axis = Math.abs(deltaY) >= Math.abs(deltaX) ? "vertical" : "horizontal";
      }
      if (gesture.axis !== "vertical") return;

      event.preventDefault();
      const distance = Math.max(0, deltaY);
      gesture.distance = distance;
      sheet.style.transition = "none";
      sheet.style.transform = `translate3d(0, ${distance}px, 0)`;
      if (backdrop instanceof HTMLElement) {
        const sheetHeight = Math.max(sheet.getBoundingClientRect().height, 1);
        backdrop.style.transition = "none";
        backdrop.style.opacity = String(Math.max(0.18, 1 - distance / (sheetHeight * 0.8)));
      }
    }

    function finishGesture(event, cancelled = false) {
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      const current = gesture;
      gesture = null;
      if (current.axis !== "vertical" || cancelled) {
        animateBack();
        return;
      }

      const elapsed = Math.max(16, performance.now() - current.startedAt);
      const velocity = current.distance / elapsed;
      const sheetHeight = Math.max(sheet.getBoundingClientRect().height, 1);
      const distanceThreshold = Math.min(132, Math.max(84, sheetHeight * 0.2));
      const shouldClose = current.distance >= distanceThreshold
        || (current.distance >= MIN_FLING_DISTANCE && velocity >= FLING_VELOCITY);
      if (shouldClose) requestClose(current.distance);
      else animateBack();
    }

    layer.addEventListener("pointerdown", startGesture);
    window.addEventListener("pointermove", moveGesture, { passive: false });
    window.addEventListener("pointerup", event => finishGesture(event, false));
    window.addEventListener("pointercancel", event => finishGesture(event, true));
    layer.addEventListener("click", event => {
      const target = event.target;
      if (
        !swipeClosing
        && target instanceof Element
        && target.closest("[data-close-sheet]")
      ) {
        resetInlineStyles();
      }
    }, true);

    let wasOpen = layer.classList.contains("is-open");
    const openStateObserver = new MutationObserver(() => {
      const isOpen = layer.classList.contains("is-open");
      if (isOpen && !wasOpen && !swipeClosing) {
        // Clear stale swipe-close inline styles immediately before repainting.
        resetInlineStyles();
      }
      wasOpen = isOpen;
    });
    openStateObserver.observe(layer, { attributes: true, attributeFilter: ["class"] });
  }

  function installAllSheetSwipeDismiss() {
    document.querySelectorAll(".sheet-layer").forEach(installSheetSwipeDismiss);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installAllSheetSwipeDismiss, { once: true });
  } else {
    installAllSheetSwipeDismiss();
  }
})();
