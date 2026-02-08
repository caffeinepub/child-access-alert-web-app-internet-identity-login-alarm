# Specification

## Summary
**Goal:** Build a guardian-managed web app that uses Internet Identity sign-in to identify a child profile, trigger a loud visual/audible alarm on access, and log access events for guardian review.

**Planned changes:**
- Add Internet Identity (WebAuthn) authentication and map authenticated principals to guardian-created child profiles (no biometric data collected/stored).
- Create React screens: landing/sign-in, guardian dashboard (profiles + access logs), alarm state/screen, and a “Limitations & Privacy” page (English).
- Implement guardian dashboard features: create/rename/archive child profiles; link/unlink a principal to a profile; view archived profiles separately.
- Implement alarm flow: simulate “child access detected” to trigger an alarm state with prominent visuals + sound; require guardian PIN to stop/acknowledge.
- Add guardian PIN management: set/change PIN; store hashed PIN in backend; verify PIN server-side to stop alarms.
- Implement Motoko backend APIs + stable storage for profiles, principal links, access/alarm logs, and guardian PIN hash; persist across reloads/upgrades; enforce guardian-only authorization for restricted writes.
- Apply a consistent safety/alert visual theme across all screens (avoid blue/purple as primary colors); ensure distinct high-contrast alarm state styling.
- Wire all frontend-backend calls using React Query with loading/error states.
- Add and reference generated static images (icon + illustration) from `frontend/public/assets/generated`.

**User-visible outcome:** Users can sign in via Internet Identity, be associated with a child profile, trigger a simulated access alarm that can only be stopped with a guardian PIN, and guardians can manage profiles and review persistent access logs in a themed UI with a clear limitations/privacy explanation.
