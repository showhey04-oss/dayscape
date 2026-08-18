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
- Who is together
- Departure date/time
- Category / color
- Weather location

### Date/time behavior
- New event departure date/time initially matches event start date/time
- While departure time has not been manually edited, changes to start date/time also update departure time
- After manual departure-time editing, automatic following stops

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

## 5. Approved next direction

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
Move from local single-file prototype toward an installable iPhone web app:
- HTTPS hosting
- GitHub repository
- GitHub Pages as default deployment option
- Web App Manifest
- Apple touch icon
- standalone display
- Service Worker
- offline startup for core calendar UI
- Google Maps API key restricted by website and API

## 6. Current architecture direction
- Static frontend application
- GitHub Pages deployment
- Local device storage for schedule data during the current phase
- Open-Meteo for weather/geocoding where applicable
- Google Places for event place search
- Google Maps URL for opening selected places

No family/cloud synchronization is included yet.

## 7. Deferred features / roadmap

### v1.2 candidate
- Google Places search
- Google Maps deep/open link
- PWA conversion
- GitHub Pages deployment
- API key restriction
- Maintain v1.1 data compatibility

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
Status: v1.2 PRE-RELEASE / LOCAL GIT READY / INITIAL PUSH PENDING

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
- v1.2 local pre-release implementation (place field, Google Places integration shell, Google Maps links, PWA assets)
- Google Places persistence model revised to Place ID-only for policy compliance
- 390px iPhone-equivalent rendering QA
- Private GitHub repository created: `showhey04-oss/dayscape`
- Local `main` history prepared for initial push

Next major work:
1. Push the prepared local `main` commit to the private repository `showhey04-oss/dayscape`
2. Obtain/restrict Google Maps Platform API key
3. Validate Google Places with the real API
4. Prepare public Terms of Use / Privacy Policy required for Google Maps Platform usage
5. Human review of repository visibility and publication
6. Publish to GitHub Pages
7. Validate on physical iPhone
