# Thehrav on Google Play

The Android app is a Trusted Web Activity (TWA): a thin Android shell that opens https://thehrav-thementalhealthsupport.com full-screen. Website updates reach the app straight away; only icon, name, or package changes need a new upload.

Everything to paste into Play Console is in this file. Images are in this folder.

## 1. Build the Android package (PWABuilder, about 15 minutes)

1. Open https://www.pwabuilder.com and enter `https://thehrav-thementalhealthsupport.com`.
2. Choose **Package for stores → Android → Generate package**, and set:

   | Setting | Value |
   | --- | --- |
   | Package ID | `com.thehrav.app` (permanent: it can never change after the first upload) |
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
   - `ANDROID_PACKAGE_NAME` = `com.thehrav.app`
   - `ANDROID_CERT_FINGERPRINTS` = both SHA-256 values, separated by a comma
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
| Phone screenshots | `screenshot-1-home.png` to `screenshot-4-for-guides.png` | 1080 × 1920 |

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
