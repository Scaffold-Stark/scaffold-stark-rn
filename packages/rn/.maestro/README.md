# E2E Testing with Maestro

[Maestro](https://maestro.mobile.dev/) is a mobile UI testing framework that uses
simple YAML flows to drive real device / simulator interactions.

## Prerequisites

1. Install Maestro CLI:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. Start the Expo dev server and run the app on an emulator/simulator:
   ```bash
   # iOS
   yarn ios
   # Android
   yarn android
   ```

## Running E2E Tests

Run a single flow:
```bash
maestro test .maestro/app-navigation.yaml
```

Run all flows in the `.maestro/` directory:
```bash
maestro test .maestro/
```

## Writing New Flows

Create a new `.yaml` file in this directory. Each flow should:

1. Set the `appId` at the top (use `com.ss_rn.rn` for this project).
2. Start with a `waitForAnimationToEnd` to let the app settle.
3. Use `assertVisible`, `tapOn`, `scrollUntilVisible`, etc. to interact.
4. Use `takeScreenshot` for visual verification checkpoints.

See the [Maestro docs](https://maestro.mobile.dev/docs) for the full list of
available commands.
