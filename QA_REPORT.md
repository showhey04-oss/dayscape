# Dayscape v1.2.1 — QA Report

Date: 2026-08-18
Status: public pilot deployed / physical iPhone fix recheck pending

## Scope

This report covers the v1.2.1 iPhone UX correction requested after the first physical-device validation:

1. Prevent unintended horizontal scrolling in the event entry sheet.
2. Make the event time values easier to notice than in the compound iOS `datetime-local` picker.
3. Preserve the existing v1.1 / v1.2 persisted event schema and behavior.

## Physical iPhone validation before the v1.2.1 correction

Reported PASS:
- Safari rendering
- Month / Week / Day views
- Event create / edit / delete
- 1-minute date-time and departure-time handling
- Google Places suggestion display
- Google Maps launch
- Home Screen installation
- standalone display
- offline startup

Reported findings:
- The event entry sheet could be moved horizontally.
- The time value inside the native compound date-time picker was visually small and easy to overlook.

## v1.2.1 implementation

### Horizontal-overflow containment

Implemented:
- `html` and `body` constrained to the viewport width with horizontal overflow disabled.
- Sheet layer, sheet, sheet body, forms, field groups, Flex/Grid children, and input controls constrained with `max-width: 100%` and `min-width: 0` where required.
- Event-sheet scrolling limited to the vertical direction.
- Google Places autocomplete host and child component constrained to the available inline size.

### Date-time visibility

Implemented:
- Replaced visible compound `datetime-local` controls with separate native `date` and `time` controls for Start, End, and Departure.
- Increased time-input text size and weight.
- Kept `step="60"` for one-minute precision.
- Added `設定しない` for clearing Departure.

### Compatibility

Preserved:
- Storage key: `dayscape.calendar.v1`
- Persisted date-time format: `YYYY-MM-DDTHH:mm`
- Existing event object schema
- New-event Departure initially matching Start
- Departure following Start until manually edited
- Manual Departure override
- v1.1 / v1.2 event-data normalization path

## Local mobile-equivalent QA

Reported PASS at:
- 320 px
- 390 px
- 430 px

Reported PASS:
- No event-sheet horizontal overflow
- Date and time controls remain inside the viewport
- Forced oversized Google Places element remains contained
- Event save and reopen retain one-minute values
- End time adjusts correctly when Start moves past End
- Departure follows Start before manual edit
- Departure stops following after manual edit
- Departure can be cleared
- Cross-day event end values remain valid

## GitHub Pages deployment QA

Deployment workflow:
- Run: `32157279532`
- Commit: `d041ef4b927ef18f496526defa06ac9631af3164`
- Result: PASS

Post-deployment smoke test PASS:
- App shell
- Service Worker
- Demo Key entry
- Privacy Policy
- Terms of Use
- PWA Manifest
- Public `config.js` contains no Google Maps API key

## Remaining physical-device checks

- Confirm the v1.2.1 event sheet no longer moves horizontally on the physical iPhone.
- Confirm Start / End / Departure times are sufficiently noticeable on the physical iPhone.
- Confirm Google Place ID persistence and place-name re-resolution after relaunch.
- Restore a v1.1 backup and confirm read/write compatibility.

## Release assessment

The v1.2.1 correction is implemented and publicly deployed. No data-schema migration was introduced. Final closure of the two reported UI findings requires the short physical-iPhone recheck listed above.
