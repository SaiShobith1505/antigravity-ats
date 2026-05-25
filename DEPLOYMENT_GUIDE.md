# ANTIGRAVITY ATS 2.0 — DEPLOYMENT GUIDE

This document provides a step-by-step production deployment manual for the **CV⚡BOOST** (ANTIGRAVITY ATS 2.0) Next.js web application. 
Follow this guide to deploy releases safely, set up environment secrets in production hosting dashboards, and trigger fast rollbacks if issues occur.

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🚀 STAGE 1: PRE-DEPLOYMENT VERIFICATION
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before pushing any commit from `dev` to `main`, run this local verification suite to ensure the build compiles cleanly and does not contain syntax errors.

```bash
# 1. Clean build cache and verify TS/Lint compilations
npm run build
```

Verify that the console output finishes with:
```bash
✓ Compiled successfully in X.Xs
  Running TypeScript ...
  Finished TypeScript in X.Xs ...
  Collecting page data ...
✓ Generating static pages ...
  Finalizing page optimization ...
```
If there are any warnings or errors, resolve them before deploying. **Never deploy an untested build.**

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🌐 STAGE 2: VERCEL DEPLOYMENT SETUP
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We recommend deploying CV⚡BOOST to **Vercel** for optimal Next.js dynamic routing, serverless page optimizations, and secure environment isolation.

### 1. Link Your Git Repository
1. Log into your **Vercel Dashboard** (Vercel offers free-tier hosting for personal projects).
2. Click **New Project** -> **Import Git Repository**.
3. Select your linked GitHub/GitLab repository for the CV⚡BOOST project.

### 2. Configure Environment Variables
Expand the **Environment Variables** panel in Vercel and securely inject these variables. 

> [!IMPORTANT]
> **No credential exposure:** Never upload your `.env.local` file directly. Copy-paste these variables into Vercel's private dashboard.

#### Required Production Configs:
* `NEXT_PUBLIC_FIREBASE_API_KEY`: *(From Firebase Web App settings)*
* `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: `antigravity-ats.firebaseapp.com`
* `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: `antigravity-ats`
* `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: `antigravity-ats.firebasestorage.app`
* `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: `1053997080121`
* `NEXT_PUBLIC_FIREBASE_APP_ID`: `1:1053997080121:web:f668b4e6b76f540e1eb7e8`
* `NEXT_PUBLIC_RAZORPAY_KEY_ID`: `rzp_live_YourPublicLiveKey` *(Razorpay Live Merchant Key)*
* `RAZORPAY_KEY_ID`: `rzp_live_YourPublicLiveKey` *(Private Backend Key)*
* `RAZORPAY_KEY_SECRET`: `YourLiveMerchantSecretKey` *(Private Razorpay Secret)*

### 3. Deploy
* Set the build command to `npm run build`.
* Set the output directory to `.next`.
* Click **Deploy**. Vercel will build and distribute your project across Edge networks within 2 minutes.

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔒 STAGE 3: POST-DEPLOYMENT VERIFICATION
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Once Vercel gives you your production deployment URL (e.g. `https://cvboost.co` or `https://cvboost.vercel.app`):
1. **Google OAuth Check:** Attempt to log into the dashboard via the Google OAuth flow. Verify that users redirect successfully to `/dashboard`.
2. **Compliance Verification:** Scroll to the footer and check that `/privacy`, `/terms`, `/refund`, and `/contact` links load instant, readable pages.
3. **Razorpay Verification:** Attempt to trigger a checkout. Ensure the secure payment modal launches carrying the official branding details.
4. **Referral Tracking:** Check that sharing referral links from a logged-in user successfully increments counts on peer registrations in local storage.

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🚨 STAGE 4: REDEPLOYMENT & FAST ROLLBACKS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If a critical bug is reported in your live deployment (such as a payment verification failure or Firestore write crash):

### Option A: The Vercel Dashboard Rollback (Fastest)
1. Go to your **Vercel Project Dashboard**.
2. Click on the **Deployments** tab.
3. Locate the last stable deployment (which worked correctly).
4. Click the three dots next to that deployment and select **Rollback**.
5. Vercel will instantly route 100% of live traffic back to that working build within 5 seconds.

### Option B: The Git CLI Rollback
If you need to fix the codebase commit history permanently:
```bash
# 1. Revert the breaking commit on main branch
git checkout main
git revert HEAD  # Reverts the latest commit
git push origin main
```
Vercel will detect the push to the production branch and automatically trigger a clean redeploy.
