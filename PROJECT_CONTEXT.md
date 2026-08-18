# Dayscape — PROJECT_CONTEXT

## 1. Project identity
- Project name: Dayscape
- Product type: iPhone-first personal/family calendar PWA
- Primary users: non-engineer couple in their 30s with a child
- Primary device: iPhone
- Current prototype lineage: single-file HTML calendar
- Current implementation: Dayscape Calendar v1.2.1 public pilot
- Public URL: `https://showhey04-oss.github.io/dayscape/`

## 2. Product goal
Create a simple, refined family calendar that combines:
1. schedules,
2. place,
3. weather,
4. departure information,

without becoming a general-purpose task manager or social app.

The core product principle is:
**Family schedules should be understandable and actionable with the fewest possible operations.**

## 3. Current functional specification

### Calendar
- Month / Week / Day views
- Date tap creates a new event with the tapped date preselected
- Existing event tap opens editing
- 1-minute time precision
- All-day events
- Multi-day events

### Required event fields
- Event title
- Event date/time

### Optional event fields
- Who is together
- Departure date/time
- Category / color
- Weather location
- Place

### Date/time behavior
- Timed events use separate visible date and time inputs on iPhone
- Canonical persisted values remain `YYYY-MM-DDTHH:mm` for compatibility
- New event departure date/time initially matches event start date/time
- While departure time has not been manually edited, changes to start date/time also update departure time
- After manual departure-time editing, automatic following stops
- Departure date/time can be cleared with `設定しない`

### Weather
- Multiple registered forecast locations
- Home/default forecast location
- Event-specific forecast location
- Month view: weather icon
- Week view: weather icon + temperature
- Day view: weather icon + temperature + precipitation probability
- Forecast unavailable/out of range: leave weather information blank
- Calendar event functions remain usable without weather network access

### Storage
- Device-local persistence
- JSON backup
- JSON restore
- Existing v1.1 data compatibility must be preserved unless a migration is explicitly designed

## 4. UI / language principles
- iPhone-first
- Minimal, refined, low visual noise
- Natural contemporary Japanese
- Avoid overly cute, artificial, or explanatory wording
- Event sheets must not allow unintended horizontal scrolling
- Prefer short labels such as:
  - 予定名
  - 開始
  - 終了
  - 終日
  - 出発日時
  - 一緒に
  - 場所
  - カテゴリ
  - データ管理
- Month view prioritizes overview and must not become dense
- Week view provides moderate detail
- Day view provides the highest information density

## 5. Approved product behavior

### Place integration
Add optional `場所` directly below event title.

Target behavior:
1. Enter facility name/address
2. Show Google Places suggestions
3. Select a specific place
4. Google-selected places persist only the Google Place ID. Display name, address, coordinates, and provider attributions are resolved for the current session and are not persisted.
5. Free-text places persist the user-entered place name.
6. When Google-derived place content is shown without a Google Map, display required `Google Maps` and provider attribution near the content.
7. After registration, tapping the place name opens Google Maps
8. If Google Places is unavailable, allow fallback free-text storage
9. Month view: normally omit place text
10. Week view: show place name
11. Day view: show place name and, when useful, address

### Web application / deployment
The public pilot is deployed as an installable iPhone web app with:
- HTTPS hosting through GitHub Pages
- Public GitHub repository
- Web App Manifest
- Apple touch icon
- standalone display
- Service Worker
- offline startup for core calendar UI
- session-only Maps Demo Key validation entry

A production Google Maps Platform browser key is not embedded yet. It must be restricted by website and API before later approval.

## 6. Current architecture direction
- Static frontend application
- GitHub Pages deployment
- Local device storage for schedule data during the current phase
- Open-Meteo for weather/geocoding where applicable
- Google Places for event place search
- Google Maps URL for opening selected places
- GitHub Actions deployment with post-deployment smoke testing

No family/cloud synchronization is included yet.

## 7. Deferred features / roadmap

### v1.2.1 public pilot
- Google Places search
- Google Maps deep/open link
- PWA conversion
- GitHub Pages deployment
- Demo Key validation
- Maintain v1.1 data compatibility
- Prevent unintended horizontal scrolling in event sheets
- Separate date/time controls for improved iPhone time visibility

### v1.3 candidate
- Recurring events
- Duplicate event
- Memo
- Distinguish `whose event` from `who is together`

### v1.4 candidate
- Event-place-specific weather
- Improved departure-time UX

### v2.0 candidate
- Couple/family synchronization across devices
- Authentication and cloud data storage only after actual need is validated

## 8. Explicit non-goals for the current phase
Do not add unless separately approved:
- Google Calendar integration
- Apple Calendar integration
- Chat/messaging
- Photo album
- Household accounting
- Full task-management system
- AI schedule generation
- Cloud synchronization
- Complex social features

## 9. Product decisions
- Google Places-derived place names, addresses, and coordinates are session-only; only Place IDs may be persisted. This supersedes the earlier v1.2 candidate storage model for Google-selected places.
- GitHub Pages is preferred but not inherently mandatory; any suitable HTTPS static host could work.
- For iPhone app-like use, PWA / Home Screen installation is preferred over directly opening a local HTML file.
- Google Places integration should use a restricted browser API key.
- Personal schedule data should remain off GitHub; GitHub stores application source only.
- Complexity should only be added when it materially reduces daily family scheduling friction.
- Human approval was granted on 2026-08-18 to publish the repository and the public pilot through GitHub Pages.
- The public pilot keeps `config.js` free of Google API keys; Demo Key input remains session-only until the production key is separately approved and restricted.
- Deployment health is verified automatically after each `main` push and recorded in GitHub Issue #2.
- The compound iOS `datetime-local` control was replaced by separate date/time inputs in v1.2.1 because the native picker made the time value easy to overlook.
- The persisted event schema was not changed by the v1.2.1 date/time UI revision.

## 10. Development governance
- This Project is the canonical workspace for Dayscape decisions.
- Major product decisions, accepted specifications, roadmap changes, implementation reviews, and release readiness should be recorded here.
- Do not infer or silently change core scope.
- Minor UI/wording/implementation decisions may be made without repeated approval when they are consistent with the approved direction.
- Human confirmation should be reserved for:
  1. major scope changes,
  2. security/privacy boundary changes,
  3. destructive or irreversible changes,
  4. materially different product-direction choices,
  5. release/publication decisions.

## 11. Current state
Status: v1.2.1 PUBLIC PILOT DEPLOYED / IPHONE FIX RECHECK PENDING

Completed:
- Initial one-shot HTML prototype
- Month / Week / Day calendar
- Weather integration
- Local persistence
- Backup/restore
- Event editing
- Date-tap creation
- Departure-time initialization/follow behavior
- Japanese UI revision
- Place field, Google Places integration shell, Google Maps links, and PWA assets
- Google Places persistence model revised to Place ID-only for policy compliance
- 390px iPhone-equivalent rendering QA
- GitHub repository populated and published: `showhey04-oss/dayscape`
- Maps Demo Key obtained by the project owner
- Demo Key session-only validation entry implemented
- Public Terms of Use and Privacy Policy added
- Public app links to Terms of Use, Privacy Policy, and feedback
- GitHub Pages deployment workflow added
- Service Worker updated for the public pilot shell
- Public source secret scan completed with no API key or schedule data detected
- Human approval granted to publish the repository and web application publicly
- GitHub Pages deployed at `https://showhey04-oss.github.io/dayscape/`
- Post-deployment checks passed for the app shell, Service Worker, PWA Manifest, Demo Key page, policies, and empty public API-key configuration
- Physical iPhone validation passed for Safari rendering, event CRUD, date/time/departure behavior, Google Places suggestions, Google Maps launch, Home Screen installation, standalone display, and offline startup
- v1.2.1 fixed unintended horizontal scrolling in the event sheet
- v1.2.1 replaced compound datetime controls with separate date/time controls and larger time text
- v1.2.1 local QA passed at 320 / 390 / 430 px, including save/reopen, cross-day end adjustment, departure follow/manual override, and forced oversized Google Places element containment
- v1.2.1 GitHub Pages post-deployment smoke test passed

Next major work:
1. Recheck the two v1.2.1 fixes on a physical iPhone
2. Validate Place ID persistence and place-name re-resolution after relaunch
3. Restore a v1.1 backup and confirm save compatibility
4. Decide whether the public pilot is ready to use as the normal family calendar
5. Obtain and restrict a production Google Maps Platform browser key when Places should be enabled without session entry
6. Replace Demo validation with the production key only after validation and cost controls
