# QFlow – Smart Admission & Student Services Queue Management

Web app for Sri Shakthi Institute of Engineering and Technology, Coimbatore. Built with React, Vite, Firebase Authentication, Cloud Firestore, and Firebase Hosting.

> **Firebase project configured for this setup:** `qflow-9fddf`  
> Use the values from your own Firebase Console if your project ID differs. Never use another project's credentials.

## 1. One-time setup

### Install dependencies

Open a terminal in the `QFlow` folder and run:

```powershell
npm install
npm install firebase react-router-dom
npm install -D qrcode
```

### Configure Firebase

1. In [Firebase Console](https://console.firebase.google.com/), open project `qflow-9fddf`.
2. Go to **Project settings → General → Your apps → QFlow Web** and copy the web app configuration.
3. In the project root (beside `package.json`), create `.env.local` by copying `.env.example`:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Fill `.env.local` with the actual values from your Firebase web app. Use the exact variable names shown in `.env.example`. Do not leave placeholders in place.
5. In **Build → Authentication → Sign-in method**, enable **Email/Password**.
6. In **Build → Firestore Database**, create the `(default)` database if it does not already exist. Standard edition and production mode are suitable for this project. Choose the location carefully; it generally cannot be changed later.
7. Start the app:

   ```powershell
   npm run dev
   ```

If you change `.env.local`, stop and restart the Vite server so the new values load.

### Publish Firestore rules

The repository contains `firestore.rules` and `firestore.indexes.json`. From the `QFlow` folder, install and sign in to the Firebase CLI, then deploy the rules and indexes:

```powershell
npm install -g firebase-tools
firebase login
firebase use qflow-9fddf
firebase deploy --only firestore:rules,firestore:indexes
```

You can also paste the complete contents of `firestore.rules` into **Firestore Database → Rules** and click **Publish**. Do not replace the rules with `allow read, write: if true;`.

## 2. Create the first staff (admin) user

Staff roles must not be assignable from the website; otherwise any user could make themselves staff.

1. Register using the staff member's email, or create the account in **Authentication → Users → Add user**.
2. In **Authentication → Users**, copy that user's UID.
3. Open **Firestore Database → Data**. Start a collection named `admins` if it does not exist.
4. Set the document ID to the staff user's exact UID. Add a field `role` (string) with value `staff`.
5. Log in at `/admin/login`. Open the **Counters** tab and click **Create 4 default counters**.

Only trusted project administrators should create documents in `admins`. Client-side Firestore rules deny writes to this collection.

## 3. Architecture

| Collection | Purpose | Access summary |
|---|---|---|
| `users/{uid}` | Student profile: name, email, phone, category | Owner (limited edits) and staff read |
| `admins/{uid}` | Marks a staff account | Owner can read own entry; app clients cannot write |
| `queues/{service}_{date}` | Per-service, per-day token counter (`lastNumber`) | Signed-in read; validated increment alongside token creation |
| `tokens/{queueId}_{n}` | Queue number and status; no personal form details | Signed-in read; staff update status; owner can cancel while Waiting |
| `serviceRequests/{id}` | Private service form data | Owner and staff read; owner creates; no client updates/deletes |
| `counters/{id}` | Staff counter status | Staff only |

- **Unique tokens:** a Firestore transaction increments `queues.lastNumber` and creates the token and service request together. Rules validate the counter increment and token relationship.
- **Live queue:** Firestore `onSnapshot` listeners keep queue status current. People ahead are active tokens (`Waiting`, `Called`, `In Progress`) for the same service/day with a lower number. Estimated wait is people ahead × `avgMinutes` in `src/data.js`.
- **Queue day:** queues are created per service and day using the India (IST) date. The date is derived from the user's device.
- **Demo limitations:** one-active-token-per-service is a client-side check, not a server-enforced guarantee. For production use, consider trusted server-side logic such as Cloud Functions and additional validation.
- **Fee Payment:** records a queue request only; no real payment is processed.
- **Document verification:** is completed by staff at the counter.
- **Phone-number login:** is not included. Email/password login is used; Firebase Phone Auth requires additional configuration and may have billing requirements.

## 4. Deploy to Firebase Hosting

Confirm `.firebaserc` points to your Firebase project (`qflow-9fddf`) and `.env.local` contains that project's web configuration. Then run:

```powershell
npm run build
firebase deploy
```

The expected Hosting URL for project `qflow-9fddf` is usually `https://qflow-9fddf.web.app`, but **use the exact URL printed by Firebase CLI**.

After deployment, generate a QR code using the real HTTPS URL printed by the deploy command:

```powershell
node scripts/make-qr.mjs https://qflow-9fddf.web.app
npm run build
firebase deploy --only hosting
```

If Firebase prints a different Hosting URL, substitute that URL in the QR command. The generated image is `public/qflow-qr.png` and should be available at `/qflow-qr.png` after redeploying Hosting. Test it with another phone, preferably using mobile data.

## 5. Testing checklist

- Register with invalid email, invalid phone, weak password, and mismatched passwords; confirm clear validation messages.
- Confirm email and phone are stored separately and no password is written to Firestore.
- Refresh `/dashboard` and confirm the session persists.
- Open `/admin` as a normal student and confirm access is denied or redirected to staff login.
- Request a Fee Payment token without an enquiry. Use two accounts and verify sequential numbers such as `FP-001`, `FP-002`.
- As staff, go to **Queues**, choose a service, click **Call Next**, then **Start** and **Complete**. Confirm the student's queue view updates live.
- In Firestore Rules Playground or the Firebase Emulator, verify a normal user cannot mark a token Completed, write to `admins`, or read another user's `serviceRequests`.

## 6. College demo flow

1. Open the deployed site or QR code on a phone.
2. Register or sign in as a student.
3. Choose **Fee Payment**, request a token, and show the token page.
4. On a laptop, sign in to the staff console and call the next token.
5. Show the student's phone updating live, then complete the token and show the Reports tab.

## Folder structure

- `src/pages` – screens
- `src/components` and `src/components/admin` – reusable UI and staff tools
- `src/services` – Firebase and queue operations
- `src/hooks` – authentication and live queue tracking
- `src/utils` – validators, date helpers, and Firebase error handling
- `src/data.js` – college and service configuration
- `firestore.rules` / `firestore.indexes.json` – Firestore access rules and indexes
