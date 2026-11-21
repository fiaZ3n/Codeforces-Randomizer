# CF Randomizer

A standalone Codeforces random problem picker with rating range and optional tag filters.

## Run locally

Open `index.html` in a modern browser with an internet connection. The app fetches the Codeforces problemset using the public API and caches the results in browser local storage for up to six hours.

## Files

- `index.html` — page structure
- `css/style.css` — styling and responsive layout
- `js/script.js` — Codeforces API integration and random selection logic

## API

`https://codeforces.com/api/problemset.problems`
