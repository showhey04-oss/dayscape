# Dayscape deployment status

- Deployment target: GitHub Pages
- Public URL: https://showhey04-oss.github.io/dayscape/
- Release channel: v1.2 public pilot
- Repository visibility: Public
- Pages source: GitHub Actions
- Deployment initiated: 2026-08-18

## Security state

- `config.js` does not contain a Google Maps Platform API key.
- Maps Demo Key is entered through `demo-key.html` and retained only for the browser session.
- Calendar data remains in the user's browser storage and is not committed to GitHub.

## Validation remaining

- Confirm GitHub Pages workflow success.
- Confirm HTTPS responses for the app, manifest, service worker, policy pages, and Demo Key entry page.
- Validate Google Places and Home Screen behavior on a physical iPhone.
