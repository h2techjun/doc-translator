# 📋 Implementation Plan: pSEO Dynamic Language Synchronization

## 🧠 Analysis
- **Problem**: Current catch-all route (`/translate/[...slug]`) renders the `HomePage` but doesn't automatically set the translation destination language based on the URL segments (e.g., `/en-to-ko/` -> Target: Korean).
- **Goal**: Make the pSEO optimized pages actually set the UI state correctly so that if a user follows a link for "Translate to French", the target language is pre-selected as French.

## 🛠️ Proposed Changes

### 1. `src/hooks/use-url-sync.ts` (New Hook)
- Create a hook that parses the `[...slug]` from the URL.
- Logic:
    - If slug[0] matches a pattern like `xx-to-yy`, extract `yy`.
    - If slug[0] and slug[1] are individual language codes, extract the second one.
    - Call `setTargetLang()` from `useGeoSmart`.

### 2. `src/app/translate/[...slug]/page.tsx` (Update)
- Pass the `slug` parameters down to the `HomePage` or use a new logic to trigger synchronization.
- Since `HomePage` is primarily a client component, we'll implement the synchronization logic inside the client-side component to interact with the `GeoSmart` context.

### 3. `src/app/page.tsx` (Update)
- Integrate the `useUrlSync` hook (or equivalent logic) to ensure that when the page is loaded via a `/translate/` route, the state is updated.

## ✅ Verification Plan
1. **Manual Check**: Navigate to `/translate/en-to-ko/docx` and verify if "한국어 (Korean)" is automatically selected.
2. **Bulk Pair Test**: Test with other segments like `/translate/ko-to-ja/xlsx` to see if Japanese is selected.
3. **Fallback Check**: Navigate to an invalid slug like `/translate/apple/banana` and ensure it doesn't crash (should fallback to IP-based defaults).

---
**Status**: [WAITING_FOR_APPROVAL]
