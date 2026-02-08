# Specification

## Summary
**Goal:** Add guardian-controlled storage and management of child biometric and/or touch-sensing records, with accurate privacy/limitations copy updates.

**Planned changes:**
- Add backend stable-state data models to store biometric/touch-sensing records linked to a specific child profile, including validation that the child profile exists and is not archived.
- Add backend guardian-only APIs to add a record, list records by child profile, delete a specific record, and delete all records for a child profile.
- Add a new guardian-only section in the Guardian Dashboard to select a child profile and manage its biometric/touch-sensing records (add, list with type + timestamp, delete single, delete all with confirmation), wired via React Query with loading/error states.
- Update English user-facing copy on the Limitations & Privacy page and landing page to remove “does not store biometric data” claims and accurately describe what is stored, who can manage it, and web-app limitations around device-level touch detection.

**User-visible outcome:** Guardians can add, view, and delete biometric/touch-sensing records per child profile in the dashboard, while the app’s marketing and privacy/limitations text accurately reflects the new storage behavior and web-only constraints.
