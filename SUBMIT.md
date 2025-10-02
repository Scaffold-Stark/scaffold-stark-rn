## 🚀 Submit Your App to the Apple App Store

Follow the steps below to prepare and submit your Expo app to the **Apple App Store**.

---

### 1. Sign up for an Apple Developer Account

To distribute your app on the App Store, you must have an **Apple Developer account**.

> Register at the [Apple Developer Portal](https://developer.apple.com/).

---

### 2. Configure the Bundle Identifier

Add your unique bundle identifier in \*\*`app.json`:

```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.yourapp"
  }
}
```

This identifier must match the one you set in **App Store Connect**.

---

### 3. Install EAS CLI and Authenticate

Install the **EAS CLI** globally and log in with your Expo account:

```bash
npm install -g eas-cli
eas login
```

---

### 4. Build a Production App

Create a **production-ready build** using EAS Build:

```bash
eas build --platform ios --profile production
```

This will generate a build suitable for App Store submission.

---

### 5. Submit the Build to the App Store

Once the build is ready, submit it with:

```bash
eas submit --platform ios
```

The command will guide you step by step through the submission process.

---

✅ After submission, you can track the status of your build and app review in **App Store Connect**.

## 🚀 Submit Your App to the Google Play Store

Follow the steps below to prepare and submit your Expo app to the **Google Play Store**.

---

### 1. Sign up for a Google Play Developer Account

A **Google Play Developer account** is required to submit your app.

> Sign up at the [Google Play Console sign-up page](https://play.google.com/apps/publish/signup/).

---

### 2. Create an App on Google Play Console

Go to the [Google Play Console](https://play.google.com/apps/publish/) and click **Create app** to start a new app project.

---

### 3. Create a Google Service Account

EAS requires you to upload and configure a **Google Service Account Key** to submit your app.

> Follow the guide: [Creating a Google Service Account Key](https://github.com/expo/fyi/blob/main/creating-google-service-account.md).

---

### 4. Install EAS CLI and Authenticate

Install the **EAS CLI** globally and log in with your Expo account:

```bash
npm install -g eas-cli
eas login
```

---

### 5. Configure the Package Name

Add your package name in **`app.json`**:

```json
{
  "android": {
    "package": "com.yourcompany.yourapp"
  }
}
```

This must match the package name you set in **Google Play Console**.

---

### 6. Build a Production App

Create a **production-ready build** using EAS Build:

```bash
eas build --platform android --profile production
```

---

### 7. Upload Your App Manually Once

⚠️ You must upload your app manually at least once. This is a limitation of the Google Play Store API.

> Learn how in the [First Submission Guide](https://expo.fyi/first-android-submission).

---

### 8. Submit the Build to Google Play

Once all prerequisites are complete, submit your build with:

```bash
eas submit --platform android
```

The command will guide you step by step through the submission process.

> See all options in the [eas.json reference](https://docs.expo.dev/eas/json/#android-specific-options-1).

---

✅ After submission, you can track your app’s status, review process, and releases in the **Google Play Console**.
