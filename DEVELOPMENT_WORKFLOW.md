# ANTIGRAVITY ATS 2.0 — DEVELOPMENT WORKFLOW

This document outlines the professional environment management, security controls, and future-proof AI Agent architecture guidelines for the **CV⚡BOOST** (ANTIGRAVITY ATS 2.0) platform. 
Follow this guide to iterate rapidly without risking credit leaks, security failures, or database corruption.

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔑 ENVIRONMENT VARIABLE MANAGEMENT
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To secure user records and payments, CV⚡BOOST uses a strict separation between **Local Development** and **Production Deployments**. 

### 1. The Environment Files Matrix
All system credentials must be declared inside environment variables. **Never commit raw files.** 

| Environment File | Scope | Git Committed? | Purpose |
| :--- | :--- | :---: | :--- |
| `.env.local` | Local Dev | ❌ **NO** | Contains local firebase configs, local sandbox keys, and mock overrides. |
| `.env.production` | Production | ❌ **NO** | Configured inside Vercel / hosting dashboard securely. Uses live keys. |

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 💳 RAZORPAY ENVIRONMENT KEY PAIRS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ensure your keys are configured correctly to avoid charging users real money in staging or failing checkout actions in production.

### A. Development / Test Mode Config
In your local `.env.local` file:
```env
# Client-side (Public) Key - must start with rzp_test_
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_e3G8B87N5g8G6Z

# Backend-side (Private) Secret - must start with rzp_test_
RAZORPAY_KEY_ID=rzp_test_e3G8B87N5g8G6Z
RAZORPAY_KEY_SECRET=abCD1234efGH5678ijKL9012
```

### B. Production / Live Mode Config
In Vercel / deployment environment variable panels:
```env
# Client-side (Public) Key - must start with rzp_live_
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_x8F2G98M4e9H7Z

# Backend-side (Private) Secret - must start with rzp_live_
RAZORPAY_KEY_ID=rzp_live_x8F2G98M4e9H7Z
RAZORPAY_KEY_SECRET=LiveCryptographicSecretKey1029384756
```

> [!WARNING]
> **Production Key Protection:** Never place `rzp_live_` keys inside your local `.env.local` file. If a private live key is accidentally committed or printed in debug logs, deactivate it immediately inside the Razorpay Merchant Dashboard and generate a new key pair.

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔥 FIREBASE SECURITY & WORKSPACE ISOLATION
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To protect student datasets and ensure multi-user isolation, the database structures are strictly bound.

1. **User Identity Isolation:**
   Every resume is saved in Firestore using user-specific document paths:
   ```typescript
   // Stored under 'resumes/resume_userId'
   const resumeId = `resume_${user.uid}`;
   ```
2. **Firestore Security Rules:**
   Ensure your Firestore security rules enforce this path-level isolation:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /resumes/{resumeId} {
         // Allow read/write only if the resumeId matches the authenticated user's ID format
         allow read, write: if request.auth != null && resumeId == 'resume_' + request.auth.uid;
       }
     }
   }
   ```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🤖 FUTURE AI AGENT PREPARATION (DEV SANDBOX)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To expand CV⚡BOOST into a smart, agentic system (such as Job Description Matchers, AI Resume Retuners, or Automated bullet enhancers) without breaking payments, we implement an **Isolate & Decouple Architecture**:

```
src/
  ├── agents/               <── Experimental AI Sandbox (Isolate all LLM logic here)
  │    ├── jdMatcher.ts
  │    └── bulletEnhancer.ts
  ├── app/                  <── Clean UI & Endpoint Layer
  │    └── api/
  │         └── resume/
  │              └── enhance/ <── Protected backend routes with safe default fallbacks
  ├── lib/                  <── Stable Core Infrastructure
  │    ├── firebase.ts
  │    └── db.ts            <── Payment checks remain untouched & fully private
```

### AI Sandbox Integration Guidelines
Follow these three engineering guidelines to prepare the dev sandbox:

#### 1. Graceful LLM Fallbacks
AI endpoints must fail gracefully. If the LLM throws an API timeout or out-of-credit error, the code must fallback instantly to the cached stable data without blocking the PDF download engine:
```typescript
try {
  const enhancedBullets = await callLLMAgent(originalResume);
  return NextResponse.json({ success: true, bullets: enhancedBullets });
} catch (error) {
  console.warn("[AI AGENT ERROR] Fallback engaged. Returning original draft:", error);
  return NextResponse.json({ success: false, bullets: originalResume.experience.bullets });
}
```

#### 2. Keep Core Databases Agnostic
Do not store complicated, ever-changing AI parameters directly in the main `resumes` Firestore schema. Store AI-specific session states in an isolated `ai_sessions` collection, keeping the main `resumes` object lightweight, high-performance, and standard-compliant.

#### 3. Strict Rate-Limiting
LLM APIs (such as OpenAI, Gemini, or custom agents) can be expensive. Always lock AI endpoint calls behind:
* Authenticated user sessions (`request.user.uid`).
* Strictly enforced rate-limiters (e.g. max 5 optimization runs per paid user per day).
* Max character bounds on input texts to prevent large prompt consumption attacks.
