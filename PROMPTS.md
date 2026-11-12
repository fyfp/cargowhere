# Development Prompts Log

This document records the user prompts and requirements used during the development of the **SG ParkSense** (Singapore Carpark Availability) application.

---

### Prompt 1: Initial Application Build (Frontend)

```text
build a singapore based carpark application that tracks real-time carpark lots availability. build just the frontend for now, i will integrate backend later.
```

**Key Deliverables:**
- Interactive Leaflet map of Singapore with live color-coded lot availability pins.
- Direct client-side integration with Singapore's open `data.gov.sg` Carpark Availability API (`/v1/transport/carpark-availability`).
- Real-time lot counters across Cars, Motorcycles, Heavy vehicles, and EV charging points.
- Coverage across HDB, Commercial, and URA carparks spanning Central/CBD, Orchard, Bugis, East, West, North, North-East, and Changi/Sentosa.
- Interactive parking fee calculator supporting Central Area rates ($1.20/30m), Heartlands rates ($0.60/30m), Sunday/PH Free Parking Scheme (FPS), and Night Parking Cap ($5.00).
- 24-hour occupancy forecast curves, gantry height clearance checks, and one-tap Google Maps / Waze navigation.
- Saved carpark bookmarks stored locally in `localStorage`.

---

### Prompt 2: GitHub Repository Setup & Push

```text
git push https://<GITHUB_PAT>@github.com/fyfp/cargowhere.git
```
*(Token redacted for security purposes)*

**Key Deliverables:**
- Initialized local Git repository and configured commit metadata.
- Created initial commit and pushed the `main` branch to [https://github.com/fyfp/cargowhere](https://github.com/fyfp/cargowhere).
- Sanitized remote configuration to ensure secrets are not stored in plaintext within `.git/config`.

---

### Prompt 3: LTA DataMall Serverless Connection

```text
1. add a serverless connection that pulls live data from LTA's datamall using the following endpoints: 

# Live carpark lots (HDB, LTA and URA):
https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2

# Every request needs the header:  AccountKey: <LTA_ACCOUNT_KEY>

2. Store this in /api folder at project root level (not the source file).
3. Include /health.ts and /carparkavailability.ts within the same sub folder.
4. Do not hardcode any key, I will input them later.
```

**Key Deliverables:**
- Created `/api/carparkavailability.ts` at the project root connecting to LTA's DataMall `CarParkAvailabilityv2` API.
- Configured dynamic retrieval of `AccountKey` via `process.env.LTA_ACCOUNT_KEY` and optional incoming request headers without hardcoding keys.
- Implemented `/api/health.ts` for service status and environment validation (`ltaDatamallConfigured`).
- Added full-stack Express server (`server.ts`) with Vite dev middleware mounting `/api/*` routes.
- Added in-memory caching (45s TTL) and pagination handling (`$skip` / `?all=true`).
- Documented `LTA_ACCOUNT_KEY` in `/.env.example`.

---

### Prompt 4: Prompts Documentation

```text
collate all of the pompts and store them as a PROMPTS.md file
```

**Key Deliverables:**
- Generated `PROMPTS.md` containing the complete chronological prompt transcript and technical implementations.
