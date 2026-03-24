# Firebase Hosting Deployment Anleitung

## Voraussetzungen

1. **Firebase CLI installieren** (falls noch nicht installiert):

```bash
npm install -g firebase-tools
```

2. **Firebase Projekt haben**: Stelle sicher, dass du ein Firebase-Projekt erstellt hast ([Firebase Console](https://console.firebase.google.com/))

## Setup (Einmalig)

### 1. Firebase Login & Projekt konfigurieren

```bash
npm run firebase:init
```

- Wähle dein Firebase-Projekt aus
- Die Project ID wird in `.firebaserc` gespeichert

### 2. Umgebungsvariablen setzen

Erstelle eine `.env.local` Datei im Projektverzeichnis:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=deine_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=deine_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=deine_app_id
```

Die Werte findest du in der Firebase Console unter:
**Projekteinstellungen → Allgemein → Deine Apps → Web-App Konfiguration**

### 3. Hosting aktivieren

Falls noch nicht in der Firebase Console aktiviert:

1. Gehe zu Firebase Console → Hosting
2. Klicke auf "Get Started" oder "Loslegen"

## Deployment

### Schnelles Deployment

```bash
npm run deploy
```

Dieser Befehl:

1. Baut die Next.js App (`next build` → erstellt `/out` Ordner)
2. Deployed auf Firebase Hosting

### Nur Build (ohne Deploy)

```bash
npm run build
```

### Lokale Vorschau des Builds

```bash
firebase serve
```

## Wichtige Hinweise

- **Static Export**: Die App wird als statische Website exportiert (`output: "export"`)
- **Build Output**: Der `/out` Ordner enthält die fertige Website
- **Images**: `unoptimized: true` da statischer Export keine Next.js Image Optimization unterstützt
- **Environment Variables**: Alle `NEXT_PUBLIC_*` Variablen werden beim Build eingebaut

## Troubleshooting

### Build-Fehler: "Dynamic rendering not supported"

- Stelle sicher, dass keine Server-Side Rendering Features verwendet werden
- Alle Pages sollten client-seitig sein (`"use client"`)

### Firebase Deploy schlägt fehl

```bash
# Erneut einloggen
firebase login --reauth

# Projekt erneut auswählen
firebase use --add
```

### Umgebungsvariablen funktionieren nicht

- `.env.local` muss im Root-Verzeichnis sein
- Nach Änderungen: Dev-Server neu starten (`npm run dev`)
- Für Production: Neu builden (`npm run build`)

## Nützliche Befehle

```bash
# Firebase Projekt anzeigen
firebase projects:list

# Hosting History
firebase hosting:channel:list

# Deployment rückgängig machen
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

## Custom Domain einrichten

1. Firebase Console → Hosting → Domain hinzufügen
2. Folge den Anweisungen für DNS-Konfiguration
3. SSL-Zertifikat wird automatisch erstellt (kann bis zu 24h dauern)
