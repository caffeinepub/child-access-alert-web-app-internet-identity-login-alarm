# Specification

## Summary
**Goal:** Make the app ready to publish on the Internet Computer with clear deployment documentation, consistent “Child Access Control” naming, and reliable routing/asset loading under a custom HTTPS domain.

**Planned changes:**
- Add a deployment/publishing document (e.g., `DEPLOYMENT.md`) covering build, deploy, upgrade, and custom domain configuration for the Internet Computer, including domain slug rules and an example slug conversion.
- Update user-facing app metadata and branding text to consistently use the app name “Child Access Control” (including the browser tab title and app shell header) without invalid domain characters.
- Ensure frontend routing and asset paths work when served from a custom domain over HTTPS, including direct navigation to `/`, `/dashboard`, `/alarm`, and `/limitations`, and correct loading of generated assets from `/assets/generated`.

**User-visible outcome:** The app can be deployed with documented steps, shows “Child Access Control” consistently in the UI and page metadata, and works correctly (routes and generated assets load) when accessed via a custom HTTPS domain.
