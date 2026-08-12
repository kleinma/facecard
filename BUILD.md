# Building Facecard

Two people, two ways to run it:

- **Your Android → a standalone app** you install once and keep. That's the main
  part of this guide (EAS Build → an `.apk`).
- **Your friend's iPhone → Expo Go**, unchanged. This keeps working because the
  project stays on **Expo SDK 54** (the version Expo Go supports). See the last
  section for the how and the caveats.

Nothing here upgrades the SDK, so both stay compatible.

---

## Part 1 — The standalone Android app (EAS Build)

EAS Build compiles your project into a real installable app in the cloud. No
Android Studio, no Mac needed.

### One-time setup

1. **Make a free Expo account** at <https://expo.dev>.
2. **Install the EAS command-line tool** (in the project folder):
   ```bash
   npm install -g eas-cli
   ```
   (If that gives a permissions error, you can instead put `npx` in front of
   every `eas` command below, e.g. `npx eas-cli login`.)
3. **Log in:**
   ```bash
   eas login
   ```
4. **Link the project to your account:**
   ```bash
   eas init
   ```
   This creates the project on Expo's side and writes a `projectId` into
   `app.json`. Commit that change (`git add app.json && git commit -m "Add EAS projectId"`).

### Build the APK

```bash
eas build --platform android --profile preview
```

- The first time, it will offer to **generate an Android Keystore** — say **yes**
  and let EAS manage it. (This is the signing key for your app; EAS keeps it safe.)
- The build runs in the cloud. It usually takes **10–20 minutes**; on the free
  tier it may wait in a queue first.
- When it finishes you get a **link and a QR code**. On your Android phone, open
  the link and **download the `.apk`**, then tap it to install.
  - Android will ask you to allow **"install unknown apps"** for your browser the
    first time — that's expected for apps installed outside the Play Store. Allow
    it, then install.
- Facecard now appears as a normal app with your custom icon. It runs on its own
  — **no Expo Go, no dev server, no SDK-54 limit** for this installed copy.

You can send the same `.apk` link to any Android friend, too.

### Updating it later

Make your changes, then build again:

```bash
eas build --platform android --profile preview
```

Install the new `.apk` over the old one — **your data stays**, because Facecard
stores everything on the device, not in the app package.

(Later, if you want to push small JavaScript-only updates without a full rebuild,
there's **EAS Update** — we can set that up when you're ready.)

---

## Part 2 — Your friend's iPhone via Expo Go

Because we stayed on SDK 54, your friend can run Facecard in **Expo Go** with no
build and no Apple account:

1. Friend installs **Expo Go** from the App Store.
2. You run the dev server:
   ```bash
   npx expo start --tunnel
   ```
   (`--tunnel` lets them connect over the internet, not just your Wi-Fi.)
3. Share the QR code / link; they scan it with the **Camera app** and it opens in
   Expo Go.

**Two things to know about the Expo Go route:**

- It only runs **while your `npx expo start` is running**. It's great for trying
  it together, but it is *not* a permanent app installed on their phone.
- To give your friend a permanent, standalone iPhone app (like your Android APK),
  you'd need Apple's route — a **development/TestFlight build**, which requires the
  **Apple Developer Program ($99/year)**. We can do that whenever it's worth it.

---

## Which profile is which (`eas.json`)

- **preview** — internal distribution, Android builds as a direct-install `.apk`.
  This is the one you want for your own phone.
- **development** — a "dev client" build for active development with a live server.
- **production** — an `.aab` app bundle for submitting to the Google Play Store.
