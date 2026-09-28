# CoalGov AI — How to Build & Install the Actual Mobile Application (.apk)

CoalGov AI supports two seamless methods for deploying the mobile field application to actual Android and iOS smartphones:

---

## Method 1: Instant PWA Mobile Installation (Zero Build Required)

The PWA (Progressive Web App) engine is already built into the platform.

### On Android (Chrome / Edge / Brave):
1. Open Chrome on your Android phone and go to:  
   `http://<your-computer-ip>:8000/mobile`
2. Tap the **Three Dots (Menu)** in the top right corner.
3. Select **"Install app"** or **"Add to Home screen"**.
4. The CoalGov AI app icon will appear on your phone home screen like a native app.
5. Launches in full-screen standalone mode with offline IndexedDB support, camera access, and GPS geotagging!

### On iOS (Safari):
1. Open Safari on your iPhone and go to `http://<your-computer-ip>:8000/mobile`.
2. Tap the **Share** button at the bottom.
3. Tap **"Add to Home Screen"**.

---

## Method 2: Convert Web App to Actual Native Android APK File (.apk)

Using **Capacitor**, you can convert the web app into a native Android Studio project and generate an `.apk` file.

### Step 1: Install Capacitor in the `web/` folder
Open your terminal in `d:\projects\sih26024\web` and run:

```bash
cd web

# 1. Install Capacitor CLI & Core
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor Project
npx cap init "CoalGov AI Mobile" "in.gov.coal.coalgov" --web-dir dist

# 3. Add Android Native Platform
npx cap add android
```

### Step 2: Sync and Build Native Assets
```bash
# 1. Build web production bundle
npm run build

# 2. Copy web assets into Android project
npx cap sync android
```

### Step 3: Open in Android Studio & Generate `.apk`
```bash
# Open the generated Android project in Android Studio
npx cap open android
```

In Android Studio:
1. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
2. Android Studio will generate `app-debug.apk` in `android/app/build/outputs/apk/debug/`.
3. Transfer `app-debug.apk` to any Android phone and tap **Install**!

---

## 📱 Mobile Native Features Included

- **Offline Geolocation GPS Capture**: Automatically locks latitude & longitude coordinates during field walkovers.
- **Camera Evidence Snapshot**: Direct HTML5 / Native camera picker to capture violation photos.
- **IndexedDB / SQLite Offline Queue**: Saves observations locally when field officers are inside underground seams or remote pit areas.
- **Idempotent Background Sync**: Automatically uploads queued observations with `client_uuid` deduplication when returning to 4G/Wi-Fi coverage.
