# Dayscape — PROJECT_CONTEXT

## 1. Project identity
- Project name: Dayscape
- Product type: iPhone-first personal/family calendar PWA
- Primary users: non-engineer couple in their 30s with a child
- Primary device: iPhone
- Current prototype lineage: single-file HTML calendar
- Current implementation: Dayscape Calendar v1.2 pre-release

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
- Place
- Who is together
- Departure date/time
- Category / color
- Weather location

### Date/time behavior
- New event departure date/time initially matches event start date/time
- While departure time has not been manually edited, changes to start date/time also update departure time
- After manual departure-time editing, automatic following stops

### Place
- `場所` appears directly below the event title
- Google Places candidate selection is supported when a restricted browser API key is configured
- Google-selected places persist only `source: google` and `placeId`
- Google-derived display name, address, coordinates, and provider attributions are session-only and are re-resolved from the Place ID
- Free-text place input persists the user-entered name
- Week/Day views can open the place in Google Maps
- Month view normally omits place text to preserve overview density
- Google Places unavailable/API key absent: free-text fallback remains usable

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
- localStorage key remains `dayscape.calendar.v1`
- Existing v1.1 data compatibility must be preserved unless a migration is explicitly designed

## 4. UI / language principles
- iPhone-first
- Minimal, refined, low visual noise
- Natural contemporary Japanese
- Avoid overly cute, artificial, or explanatory wording
- Prefer short labels such as:
  - 予定名
  - 場所
  - 開始
  - 終了
  - 終日
  - 出発日時
  - 一緒に
  - カテゴリ
  - データ管理
- Month view prioritizes overview and must not become dense
- Week view provides moderate detail
- Day view provides the highest information density

## 5. Web application / deployment direction
- Static frontend application
- Private development repository: `showhey04-oss/dayscape`
- HTTPS hosting for production
- GitHub Pages is the default deployment candidate, but publication requires Human approval
- Web App Manifest
- Apple touch icon / PWA icons
- standalone display
- Service Worker
- offline startup for core calendar UI
- Google Maps browser API key restricted by website and API

## 6. Current architecture
- HTML/CSS/JavaScript static PWA
- Source is split into maintainable CSS/JS chunks with lightweight entrypoints
- Device-local schedule storage; no cloud schedule sync
- Open-Meteo for weather/geocoding where applicable
- Google Places for event place search after API configuration
- Google Maps URL for opening selected/free-text places

## 7. Deferred features / roadmap

### v1.2 remaining
- Google Maps Platform API key creation/restriction
- Real Google Places integration validation
- Publication review
- HTTPS/GitHub Pages deployment
- Physical iPhone PWA validation

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
- Google Places-derived place names, addresses, coordinates, and provider attributions are session-only; only Place IDs may be persisted for Google-selected places. This supersedes the earlier candidate model that proposed persisting all returned place fields.
- Free-text place names are user-provided data and may be persisted locally/backed up.
- GitHub Pages is preferred but not mandatory; any suitable HTTPS static host could work.
- For iPhone app-like use, PWA / Home Screen installation is preferred over directly opening a local HTML file.
- Google Places integration uses a restricted browser API key.
- Personal schedule data remains off GitHub; GitHub stores application source only.
- Complexity is added only when it materially reduces daily family scheduling friction.

## 10. Development governance
- This Project is the canonical workspace for Dayscape decisions.
- Major product decisions, accepted specifications, roadmap changes, implementation reviews, and release readiness should be recorded here.
- Do not infer or silently change core scope.
- Minor UI/wording/implementation decisions may be made without repeated approval when consistent with the approved direction.
- Human confirmation is reserved for:
  1. major scope changes,
  2. security/privacy boundary changes,
  3. destructive or irreversible changes,
  4. materially different product-direction choices,
  5. release/publication decisions.

## 11. Current state
Status: **v1.2 PRE-RELEASE / PRIVATE SOURCE UPLOADED / API CONFIGURATION PENDING**

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
- v1.2 place field and free-text fallback
- Google Places integration shell and Place ID-only persistence model
- Google Maps links and attribution rendering
- PWA manifest, Service Worker, Apple/PWA icons
- 320/375/390/430px responsive checks from pre-modular QA
- Private GitHub repository created and v1.2 source uploaded to `main`
- Security notes, Decision record, QA report, and release checklist committed
- No production Google API key committed

Next major work:
1. Obtain and restrict Google Maps Platform browser API key
2. Enable required Google Maps Platform APIs and billing safeguards
3. Configure `config.js` with the restricted browser key
4. Validate Google Places using the real API
5. Prepare/confirm public privacy and terms disclosures needed for production usage
6. Human review of repository visibility and publication
7. Publish via HTTPS (GitHub Pages candidate)
8. Validate Home Screen install, standalone mode, Maps handoff, offline startup, and v1.1 restore on a physical iPhone
