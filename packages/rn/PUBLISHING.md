# Publishing to App Store and Play Store

This guide covers building, submitting, and updating the Scaffold Stark React Native app for the Apple App Store and Google Play Store using EAS (Expo Application Services).

## Prerequisites

1. **Expo Account**: Create an account at [expo.dev](https://expo.dev) and link it to the project
2. **Apple Developer Account** (for iOS): Enroll at [developer.apple.com](https://developer.apple.com) ($99/year)
3. **Google Play Console** (for Android): Register at [play.google.com/console](https://play.google.com/console) ($25 one-time)
4. **EAS CLI**: Install globally with `npm install -g eas-cli`

## Initial Setup

### 1. Log in to EAS

```bash
eas login
```

### 2. Configure the project

```bash
cd packages/rn
eas build:configure
```

### 3. Update eas.json credentials

Edit `packages/rn/eas.json` and fill in the `submit.production` section:

**iOS fields:**
- `appleId`: Your Apple ID email
- `ascAppId`: Your App Store Connect app ID (numeric, found in App Store Connect under App Information)
- `appleTeamId`: Your Apple Developer Team ID (found in your Apple Developer account membership page)

**Android fields:**
- `serviceAccountKeyPath`: Path to your Google Play service account JSON key file (see below)
- `track`: The release track (`internal`, `alpha`, `beta`, or `production`)

### 4. Set up Google Play service account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a service account with Google Play Developer API access
3. Download the JSON key file
4. Place it in a secure location and update `serviceAccountKeyPath` in `eas.json`
5. In Google Play Console, grant the service account access under Settings > API access

### 5. Configure GitHub Secrets (for CI/CD)

Add these secrets in your GitHub repository settings (Settings > Secrets and variables > Actions):

| Secret | Description |
|--------|-------------|
| `EXPO_TOKEN` | EAS access token (generate at expo.dev/accounts/[account]/settings/access-tokens) |
| `EXPO_APPLE_ID` | Your Apple ID email (for iOS submission) |
| `EXPO_APPLE_APP_SPECIFIC_PASSWORD` | App-specific password for your Apple ID (generate at appleid.apple.com) |

## Building

### Local builds

```bash
# Development build (includes dev tools, iOS simulator)
yarn build:dev

# Preview build (internal distribution for testing)
yarn build:preview

# Production build (for store submission)
yarn build:prod

# Platform-specific production builds
yarn build:ios
yarn build:android
```

### CI/CD builds

Builds trigger automatically:
- **Push to `main`**: Triggers a production build
- **Push to `develop`**: Triggers a preview build

You can also trigger builds manually from the Actions tab in GitHub using the "EAS Build" workflow.

## Submitting to Stores

### Local submission

```bash
# Submit latest iOS build to App Store
yarn submit:ios

# Submit latest Android build to Play Store
yarn submit:android

# Submit to both stores
yarn submit:all
```

### CI/CD submission

Use the "EAS Submit" workflow in GitHub Actions (manual dispatch only). Select the platform and trigger the workflow.

### First-time iOS submission

For the first submission, you need to:
1. Create the app in [App Store Connect](https://appstoreconnect.apple.com)
2. Fill in all required metadata (description, screenshots, privacy policy URL)
3. Set the pricing and availability
4. The EAS submit will upload the build; you still need to manually submit for review in App Store Connect

### First-time Android submission

For the first submission, you need to:
1. Create the app in [Google Play Console](https://play.google.com/console)
2. Complete the store listing (description, screenshots, content rating questionnaire)
3. Set up pricing and distribution
4. EAS submit uploads to the internal track by default; promote to production in the Play Console

## OTA Updates

OTA (Over-The-Air) updates push JavaScript bundle changes to users without requiring a new store build. This works for code changes but not for native module changes.

```bash
# Push an update to the production branch
yarn update:production

# Push an update to the preview branch
yarn update:preview

# Custom update with message
yarn update -- --message "Fix login issue"
```

OTA updates also trigger automatically when pushing changes to `main` that affect `packages/rn/`.

### What can be updated OTA

- JavaScript/TypeScript code changes
- Asset changes (images, fonts added to the bundle)
- Configuration changes in app code

### What requires a new build

- Adding or upgrading native modules (any dependency with native code)
- Changing `app.json` configuration (permissions, splash screen, etc.)
- Upgrading Expo SDK version
- Changing the `expo-router` plugin configuration

## Build Profiles

| Profile | Purpose | Distribution | Auto-increment |
|---------|---------|-------------|----------------|
| `development` | Local development with dev tools | Internal (simulator on iOS) | No |
| `preview` | QA and stakeholder testing | Internal (device builds) | No |
| `production` | Store submission | Store | Yes |

## Troubleshooting

### Build fails with credential errors

- Run `eas credentials` to manage your credentials interactively
- For iOS, EAS can manage certificates and provisioning profiles automatically
- For Android, EAS can generate keystores automatically on first build

### Submission fails with authentication errors

- Verify your `EXPO_TOKEN` is valid and not expired
- For iOS, ensure your app-specific password is current
- For Android, verify your service account has the correct permissions

### OTA update not appearing on devices

- Updates are downloaded in the background and applied on next app restart
- Ensure the app was built with the matching EAS update configuration
- Check the EAS dashboard for update deployment status

### Build queue is slow

- EAS free tier has limited concurrent builds
- Consider upgrading to EAS Production plan for priority builds
- Use `--no-wait` flag to queue the build and check status later

### Version conflicts

- `appVersionSource` is set to `remote` in eas.json, so EAS manages version numbers
- If you need to set a specific version, use `eas build:version:set`
