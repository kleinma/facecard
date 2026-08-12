# Facecard 🃏

A private flashcard app for learning a big network of people — faces, names,
and how you know them. You build a deck of people (photo + name + notes), then
play a quick game: the app shows one thing, you guess the rest out loud, reveal
the answer, and mark how you did.

**Everything stays on your phone.** No accounts, no servers, no internet — the
app has no networking code at all. Photos are copied into the app's own private
storage.

This is **v1**: a solo/face-to-face app. (Sharing decks with friends is a
planned future phase.)

---

## First time? Start here.

You've never run an app before — that's fine. Here's the whole path, and you
only do steps 1–3 once.

### 1. Install two free tools on your computer

- **Node.js** — the engine that runs the project.
  Download the "LTS" version from <https://nodejs.org> and install it.
- **A code editor** (optional but nice): **VS Code** from
  <https://code.visualstudio.com>.

To check Node installed, open a terminal (on Windows: "Command Prompt"; on
Mac: "Terminal") and type:

```bash
node --version
```

If it prints a version number (like `v22.x.x`), you're good.

### 2. Put "Expo Go" on your Android phone

Expo Go is the free app that runs *this* project while you're building it, so
you don't need to publish anything to try it.

- Open the **Play Store** on your Android and install **"Expo Go"**.
- Make sure your phone and computer are on the **same Wi‑Fi network**.

### 3. Get the project onto your computer

Download/clone this repository, then open a terminal **in the project folder**
and install its dependencies (this reads `package.json` and downloads what the
app needs — it can take a couple of minutes the first time):

```bash
npm install
```

### 4. Run it 🎉

```bash
npx expo start
```

A **QR code** appears in the terminal. On your Android, open **Expo Go** and
scan it (there's a "Scan QR code" button in the app). Facecard loads on your
phone. Leave `npx expo start` running while you use it; press `Ctrl + C` to
stop.

> **On an iPhone instead?** Same steps — install "Expo Go" from the App Store
> and scan the QR code with the phone's Camera app. This project runs on both.

### Troubleshooting: "Project is incompatible with this version of Expo Go"

The Expo Go app in the Play Store / App Store is frozen at **SDK 54** — Expo
stopped shipping newer Expo Go builds to the stores. So this project is pinned
to SDK 54 on purpose. If you ever see that "incompatible / requires a newer
Expo Go" error, it means something bumped the project to a newer SDK; keep the
`expo` version in `package.json` on `~54.x`. (When we're ready to use a newer
SDK, the path is a "development build" instead of Expo Go — a slightly bigger
setup we can do later.)

---

## How to use the app

1. **Add people.** Tap **＋** (top-right). Add a photo (from your library or
   the camera), a name, free-form notes ("Met at college, wine nights. Hiking
   buddy."), and any groups ("College", "Minnesota").
2. **Practice.** Tap **Practice** at the bottom, pick a group (or Everyone),
   and **Start session**.
3. **Play.** Each card shows one random thing — a face, a name, or your notes.
   Say the rest out loud, tap **Reveal**, then mark **Got it / Close / Missed**.
   Tap **End** any time to see your score.

Hand the phone to a friend and let them guess your network — you're the judge.

---

## For the curious: how it's built

- **[Expo](https://expo.dev) + React Native** — one codebase, runs on Android
  and iPhone. Written in TypeScript.
- **[React Navigation](https://reactnavigation.org)** — moving between screens.
- **AsyncStorage** — saves the deck (names, notes, groups) on the device.
- **expo-file-system** — copies photos into the app's private storage.
- **expo-image-picker** — the bridge to your camera and photo library.

### Project layout

```
App.tsx                     # App shell + screen navigation
index.ts                    # Entry point (Expo boilerplate)
src/
  types.ts                  # The Person data model
  theme.ts                  # Colors (light + dark mode)
  utils.ts                  # Small helpers (ids, initials, shuffle)
  storage.ts                # Load/save the deck + photo files (all local)
  navigation.ts             # Type-safe screen params
  components/               # Avatar, Button, Chip
  screens/
    PeopleListScreen.tsx    # Home: the deck
    PersonEditScreen.tsx    # Add / edit a person
    PersonDetailScreen.tsx  # View one person
    SessionSetupScreen.tsx  # Choose who to practice
    PlayScreen.tsx          # The game
    ScoreScreen.tsx         # Session results
```

### Handy commands

```bash
npm install         # install dependencies (first time, and after pulling changes)
npx expo start      # run the app (scan the QR with Expo Go)
npx tsc --noEmit    # check the code types without running
```

---

## What's next (planned phases)

- **Phase 2** — multiple photos shown at random, "practice just the ones I
  miss", richer per-person history, smarter group filtering.
- **Phase 3** — back up / restore your deck to a file, and spaced practice
  that resurfaces the people you keep forgetting.
- **Phase 4** — connect with friends and (opt-in, both sides) share decks so
  you can learn each other's networks.
