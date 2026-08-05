# SpiritVerse iPhone app wrapper

This folder contains a Capacitor-based iPhone shell for the main Next.js app.

## What it does
- Builds the exported web app in the parent project
- Syncs the static web build into an iOS Capacitor project
- Lets you open the generated Xcode project with `npx cap open ios`

## Commands

From this folder:

```sh
npm install
npm run prepare
npm run open
```

## Notes
- The web production output is read from the parent project's `out/` folder.
- This wrapper is meant for building an iPhone app package with Xcode / Apple Developer tooling.
