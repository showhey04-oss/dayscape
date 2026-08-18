# Dayscape v1.2 — QA Report

Date: 2026-08-18
Status: pre-release

## Static checks

PASS:
- JavaScript syntax (`index.html` inline scripts, `config.js`, `service-worker.js`)
- HTML id uniqueness
- PWA manifest JSON parse
- Manifest icon file existence
- `dayscape.calendar.v1` storage key retained
- `APP_VERSION = 1.2.0`
- event form order: 予定名 → 場所 → 終日／日時
- Google-selected place persistence restricted to Place ID
- `Google Maps` attribution markup present
- No production Google API key or GitHub token present in tracked files
- Local Git repository has a clean `main` branch and configured `origin`

## Chromium mobile-equivalent interaction checks

Viewport: 390 × 844 CSS px, device scale factor 3.

PASS:
- Calendar renders without horizontal overflow
- Date tap opens new event with tapped date preselected
- Departure datetime initially equals start datetime
- Start change updates departure while follow mode is active
- Manual departure edit disables subsequent automatic following
- Free-text place can be entered, saved, reopened, and displayed in week view
- Free-text place generates Google Maps search URL
- Event edit sheet renders without horizontal overflow

## Google Places mocked integration checks

A browser-side Google Places mock was injected to validate the integration path without a production API key.

PASS:
- `PlaceAutocompleteElement` initialization path
- `gmp-select` selection path
- Selected Google place name/address shown during session
- Persisted event data contains only:
  - `source: google`
  - `placeId`
- Returned display name, address, latitude, longitude are not persisted
- Week display resolves the in-memory Google place name
- `Google Maps` attribution shown
- Third-party provider attribution shown when returned
- Google Maps URL contains `api=1`, `query`, and `query_place_id`

## Responsive checks

PASS horizontal overflow check:
- 320 px
- 375 px
- 390 px
- 430 px

## Not yet validated

Requires HTTPS deployment / physical device / production Google key:
- Real Google Places autocomplete results
- Google billing / API restrictions
- Google Maps app handoff on physical iPhone
- PWA Home Screen installation on physical iPhone
- Service Worker offline behavior on iPhone Safari
- GitHub Pages production path and cache behavior
- Real third-party attribution cases from Google Places
- Public Terms of Use / Privacy Policy
