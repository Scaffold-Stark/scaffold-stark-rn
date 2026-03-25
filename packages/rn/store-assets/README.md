# Store Assets

This directory contains assets required for App Store and Play Store listings.

## Directory Structure

```
store-assets/
  ios/          - iOS App Store assets
  android/      - Google Play Store assets
```

## Required Assets

### iOS (App Store)

Place the following in the `ios/` directory:

- **Screenshots** (required for each supported device size):
  - iPhone 6.9" (1320 x 2868 or 2868 x 1320)
  - iPhone 6.7" (1290 x 2796 or 2796 x 1290)
  - iPhone 6.5" (1284 x 2778 or 2778 x 1284)
  - iPad Pro 13" (2064 x 2752 or 2752 x 2064)
  - At minimum, provide 6.7" iPhone and 13" iPad screenshots
  - Up to 10 screenshots per device size

- **App Icon**: 1024 x 1024 PNG (no alpha/transparency)

- **App Preview Video** (optional): 15-30 seconds, specific resolutions per device

### Android (Google Play)

Place the following in the `android/` directory:

- **Screenshots** (minimum 2, maximum 8):
  - Phone: minimum 320px, maximum 3840px on any side
  - 7-inch tablet: same constraints
  - 10-inch tablet: same constraints
  - Aspect ratio between 16:9 and 9:16

- **Feature Graphic**: 1024 x 500 PNG or JPG (required)

- **App Icon**: 512 x 512 PNG (32-bit, with alpha)

- **Promo Video** (optional): YouTube URL

## Store Listing Text

Prepare the following text content (not stored as files, entered directly in store consoles):

### Both platforms
- App name (max 30 chars)
- Short description (max 80 chars for Android, subtitle for iOS)
- Full description (max 4000 chars)
- Keywords (iOS only, max 100 chars comma-separated)
- Privacy policy URL (required for both)
- Support URL

### Additional for iOS
- What's New text for each version
- Age rating questionnaire responses

### Additional for Android
- Content rating questionnaire responses
- Data safety section responses
- Target audience and content declarations
