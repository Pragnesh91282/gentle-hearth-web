# Thehrav on Google Play

The Android app is a Trusted Web Activity (TWA): a thin Android shell that opens https://thehrav-thementalhealthsupport.com full-screen, starting on the app home at `/app?source=app`. Inside the app, Thehrav shows app-only screens: the app home, a bottom tab bar, and offline breathing and grounding exercises. Website updates reach the app straight away; only icon, name, start URL, or package changes need a new upload.

Published so far: **Indus Appstore** (package `com.thehrav_thementalhealthsupport.twa`).

Everything to paste into Play Console is in this file. Images are in this folder.

## 1. Build the Android package (PWABuilder, about 15 minutes)

1. Open https://www.pwabuilder.com and enter `https://thehrav-thementalhealthsupport.com`.
2. Choose **Package for stores → Android → Generate package**, and set:

   | Setting | Value |
   | --- | --- |
   | Package ID | `com.thehrav_thementalhealthsupport.twa` (permanent: every store and every update must use exactly this) |
   | Start URL | `/app?source=app` |
   | App version / version code | Start at `1.0.0` / `1`; see section 7 for updates |
   | Notification delegation | On |
   | App name | `Thehrav` |
   | Launcher name | `Thehrav` |
   | Theme colour | `#1F5C46` |
   | Background colour | `#FDFAF4` |
   | Signing key | Create new |

3. Download the zip. It contains the `.aab` file to upload, `signing.keystore`, `signing-key-info.txt`, and an `assetlinks.json`.
4. **Back up `signing.keystore` and `signing-key-info.txt` somewhere safe and private** (not in this repository, not in email). You need them for every future update.

## 2. Create the app in Play Console

1. Sign up at https://play.google.com/console (one-time fee of US$25, plus identity verification).
2. **Create app**: name `Thehrav: Be heard, gently`, default language English (India), App, Free.
3. Upload the `.aab` to **Testing → Closed testing** first (see section 5).

## 3. Connect the app to the website (removes the address bar)

1. In Play Console, open **Test and release → App integrity → App signing**, and copy the **SHA-256** of both the **app signing key** and the **upload key**.
2. In **Vercel → Settings → Environment Variables**, add for Production:
   - `ANDROID_PACKAGE_NAME` = `com.thehrav_thementalhealthsupport.twa`
   - `ANDROID_CERT_FINGERPRINTS` = the existing fingerprint (from the PWABuilder zip's `assetlinks.json`) plus both Play SHA-256 values, separated by commas. Brackets and quotes are ignored, so values can be pasted straight from `assetlinks.json`
3. Redeploy, then check https://thehrav-thementalhealthsupport.com/.well-known/assetlinks.json shows the package name and both fingerprints.

If the app shows a browser address bar at the top, the fingerprints don't match. Check them against App integrity again.

## 4. Store listing

**App name** (30 characters max)

```
Thehrav: Be heard, gently
```

**Short description** (80 characters max)

```
Free, anonymous, unhurried support from verified listeners and psychologists.
```

**Full description**

```
Take a pause. Someone is here to listen.

Thehrav (ठहराव, "a pause") is a free, quiet place in India to share what feels heavy and get a thoughtful reply from a real person. Write in your own words, whenever you're ready. A verified listener, clinical psychologist or doctor reads it and replies gently, in their own time.

Whatever you're carrying is welcome here: exam or career pressure, expectations at home, loneliness in a new city, overthinking at night, burnout, heartbreak, grief, or a heaviness you can't name.

HOW IT WORKS
• Write it down. No forms, no labels, no real name needed.
• A guide picks it up and starts a private conversation with you.
• Talk at your own pace. We email you when there's a new message, never with what was said.

TAKE A PAUSE (WORKS OFFLINE)
• Breathe: a guided breathing exercise. Breathe in for 4, out for 6, for 1, 3 or 5 minutes.
• Ground: the 5-4-3-2-1 exercise for anxious or racing thoughts.
• Today's thought: a gentle principle of compassion each day.
Both exercises work without internet.

WHY THEHRAV
• Free: no fees, no subscriptions, no ads.
• Anonymous: use any name you like. Guides never see your email.
• Verified: doctors are checked on the NMC register, psychologists on the RCI register, and every listener is reviewed by a moderator.
• Unhurried: no timers and no pressure to reply.
• Discreet: just a leaf icon and the name Thehrav on your phone.

FOR PSYCHOLOGISTS, DOCTORS AND TRAINED LISTENERS
Give an hour when you can. Choose which requests to take and reply when it suits you. Apply in the app under "Become a guide".

IMPORTANT
Thehrav is not an emergency service and does not provide diagnosis or treatment. If you might hurt yourself or you are in danger, call Tele-MANAS on 14416 (free, 24/7) or 112.

Thehrav is for adults aged 18 and over.
```

**Graphics** (in this folder)

| Asset | File | Size |
| --- | --- | --- |
| App icon | `public/icons/icon-512.png` | 512 × 512 |
| Feature graphic | `feature-graphic.png` | 1024 × 500 |
| Phone screenshots (use these) | `app/1-app-home.png` to `app/4-share.png`: the app home, breathing, grounding, and sharing, with the tab bar | 1080 × 1920 |
| Website screenshots (optional extras) | `screenshot-1-home.png` to `screenshot-4-for-guides.png` | 1080 × 1920 |

**Category and contact**

| Field | Value |
| --- | --- |
| App category | Health & Fitness |
| Tags | Mental health, Self-care |
| Contact email | the Grievance Officer email |
| Website | https://thehrav-thementalhealthsupport.com |
| Privacy policy | https://thehrav-thementalhealthsupport.com/privacy |

## 5. App content (Policy → App content)

| Section | Answer |
| --- | --- |
| Privacy policy | https://thehrav-thementalhealthsupport.com/privacy |
| Ads | No ads |
| App access | Some features need an account. Give reviewers a test patient account (email and password) in the instructions |
| Content rating | Complete the questionnaire honestly: users can talk to each other (yes), content is moderated, no violence or mature content |
| Target audience | 18 and over only |
| Health apps | Declare it as a health app, in the mental and emotional wellbeing category. It is not a medical device and makes no medical claims |
| Government app | No |
| Financial features | None |
| Account deletion | Yes. In-app: Account → Delete my account. Web: https://thehrav-thementalhealthsupport.com/delete-account |

**Data safety** (check against the live app before submitting)

| Data type | Collected | Purpose | Optional |
| --- | --- | --- | --- |
| Email address | Yes | Account management, notifications | No |
| Name (display name, can be anonymous) | Yes | App functionality | Yes |
| Other in-app messages (support requests and conversations) | Yes | App functionality | No |
| Health info (members may describe mental health in messages) | Yes | App functionality | No |
| App interactions (anonymous page views, Vercel Web Analytics) | Yes | Analytics | No |

- Data is encrypted in transit: **Yes**.
- Users can request deletion: **Yes**.
- Data shared with third parties: **No** (Supabase, Vercel, and Resend process data on Thehrav's behalf as service providers).
- Data sold: **No**.

## 6. Testing before production

Personal developer accounts created after November 2023 must run a **closed test with at least 12 testers for 14 days in a row** before Google allows a production release. Organisation accounts (which need a D-U-N-S number) are exempt.

1. Create a closed testing track and add testers by email (friends, guides, family).
2. Share the opt-in link; each tester joins and installs from Play.
3. After 14 days, apply for production access in Play Console, then promote the release.

Use the testing period to check the app opens without an address bar, sign-up and the email link work, and the inbox, reply emails, and account deletion behave as on the website.

## 7. Publishing an update

Rebuild on PWABuilder whenever the start URL, icon, name, colours, or Android settings change. Website changes alone need no new upload.

1. Use the same **Package ID**: `com.thehrav_thementalhealthsupport.twa`.
2. Raise the **version code** by 1 and the **version name** (for example `1.0.1` → `1.0.2`). Stores refuse an upload whose version code isn't higher.
3. Under **Signing key**, choose **Use mine** and upload the original `signing.keystore` with the passwords from `signing-key-info.txt`. A new key breaks the full-screen link and stores reject the update.
4. Before uploading, open the new zip's `assetlinks.json` and check the package name and the fingerprint `06:87:30:2F:…:71:44` match what https://thehrav-thementalhealthsupport.com/.well-known/assetlinks.json serves.
5. Upload the signed `.apk` (Indus, Galaxy Store) or `.aab` (Google Play).

| Version | Code | Date | Change |
| --- | --- | --- | --- |
| 1.0.1 | 2 | 2026-10-11 | App home, tab bar, offline breathing and grounding; resubmitted to Indus |
| 1.0.0 | 1 | 2026-10-05 | First Indus submission (rejected as a website wrapper) |
