# Sakane — focused UI/UX refinement

Prepared 19 September 2026 from the supplied frontend.zip and read-only inspection of https://sakane.vercel.app/.

## What this is
A preservation-first patch, not a redesign. The cobalt/slate/cyan palette, Space Grotesk + Inter typography, core compositions, photographs, routes, services, authentication and business logic are preserved. The live deployment has NOT been updated.

The archive contains a complete clean `frontend/` source tree. `review/sakane-ui-refinement.patch` is an alternative way to apply the same changes to an unchanged copy of the supplied frontend. Do not apply the patch again to the already-refined source.

## Concise audit
1. **Strongest decisions:** photographic hero and integrated search; asymmetric featured listing; readable listing metadata; image-led details; real owner summaries; shared tokens and clear button hierarchy.
2. **Already good:** home structure, search comparison hierarchy, place gallery, owner place/reservation tables and coherent create-place sections. These were retained.
3. **Needs improvement:** auth frame/footer relationship, notification icons/unread styling, profile summary, loading skeletons, star feedback and some focus/overlay details.
4. **Overly templated patterns:** nested dashboard cards, pill containers for every property fact, repeated card-lift/image-zoom hover effects. Simplified locally, not across every useful card.
5. **Login/register:** confirmed 64px gap from global footer margin; diverging laptop panel heights; card-sized image sources enlarged into large side panels. Shared framing and correct responsive images fix this without replacing the photos.
6. **Responsive:** no page-level horizontal overflow in tested widths. Fixed shrinking guest navigation target, narrow notification layout, image-control sizing and short-page footer positioning. Existing form-first auth mobile behavior is retained.
7. **Priority:** authentication and imagery first; broken presentation states/control geometry second; subtle row/metadata/motion cleanup third; regression validation last.

## What changed and why
- Shared auth minimum frame sized to accommodate the existing longer registration form; both layouts can still grow for errors or zoom. Removed auth-specific footer separation; preserved page-specific photos and copy.
- Explicit responsive image sizes for auth, home hero and featured photo. Natural aspect ratios remain intact; object-fit cover and deliberate focal positions control crops.
- Angular app host becomes a flex column so the existing main-flex rule actually governs short-page layout. Header remains sticky. Footer clears the mobile bottom bar.
- Notifications render the existing SVG icon mapping instead of raw words and use the existing unread class. Narrow-screen actions no longer compress message text.
- Existing profile-summary styling is connected to coherent name/email/role/count markup.
- Listing skeletons own the same grid as loaded results; favorites uses the supported card skeleton.
- Owner subnav remains in one consistent position. Nested dashboard items use separators inside their existing parent panels.
- Property facts become quiet inline metadata rather than six equal pills. Useful listing cards, role choices and status badges remain.
- Decorative card/image hover scaling/lifting is removed; meaningful color, focus and state feedback stays.
- Lightbox close/arrows have explicit SVG dimensions and visible controls. Thumbnail semantics match ordinary buttons, preserving current handlers.
- Review rating selection is visible and announced through aria-pressed. No rating calculation or persistence change.
- Existing form errors get IDs, aria-invalid and aria-describedby. No validator or submit-handler changes.
- Booking stickiness moves to the grid aside, with normal flow on shorter desktop screens. Dates and search controls have individual focus indicators. Loading spinner styling uses the existing loading state.

## Screen/area coverage
| Requested area | Review and decision |
|---|---|
| Home | Preserve structure; improve hero/featured image resolution, kicker hierarchy and hover restraint. |
| Search/places | Preserve filters/result comparison; correct shared skeleton grid and card stability. |
| Place details | Preserve gallery/content/booking hierarchy; simplify facts, repair overlay icons and sticky aside. |
| Booking/reservation | Real availability/cost read checked; focus and loading presentation refined; no booking submitted. |
| Favorites | Empty state rendered; loading repaired; populated state source-reviewed only. |
| Notifications | Tenant empty and owner populated states inspected; icons/unread/mobile layout repaired. |
| Account/profile | Identity summary clarified; no account data changed. |
| Owner dashboard | Genuine metrics retained; nested request/notification cards simplified to rows. |
| Owner create/edit place | Existing coherent sections/photos retained; validation associations and photo-control fit improved. |
| Login | Shared image frame, responsive image resolution, footer relationship and error associations. |
| Register | Same framing system as login, distinct existing photo/copy, existing role behavior retained. |
| Mobile responsiveness | Tested 360–1440px plus tablet/breakpoint/tall-screen checks; no page overflow. |
| Global navigation | Preserved destinations; fixed narrow guest toggle sizing and owner subnav placement. |
| Footer | Auth gap removed; short-page shell/footer relationship corrected. |
| Typography | Fonts and global scale retained; corrected hero kicker override and profile hierarchy. |
| Spacing | Targeted auth/footer, fact metadata and nested-row spacing; no global spacing reset. |
| Buttons | Existing hierarchy retained; remove generic active scaling; restore icon geometry. |
| Forms | Preserve fields and validation logic; improve focus, error linkage and date target height. |
| Empty states | Existing useful copy/actions retained; no invented content. |
| Loading states | Genuine delayed GET checked; listing/favorites skeleton layout corrected. |
| Error states | Explicitly test-induced GET failure/retry checked; existing form errors associated. |
| Modals/overlays | Photo viewer, focus trap, Escape and focus restoration checked; invisible icons repaired. |

## Verification
- Production build: passed before and after.
- Existing tests: 36/36 before, 36/36 after.
- 51 route/viewport capture checks before and 51 after; no document overflow, uncaught page errors or broken images in completed capture runs.
- Extra auth sweep: 20 route/viewport measurements, zero image-section-to-footer gap.
- Final settled browser assertions: 19/19, no runtime errors, no prohibited writes.
- Actual backend availability check for 28–31 December 2026: three nights at $350 = $1,050. No request submitted.
- At 1440x1000 after scrolling, booking panel top is 80px and bottom is 733.375px. At 1024x768 it uses normal flow.
- 20x20px lightbox icons; Escape returns focus to its gallery trigger.
- All 59 TypeScript class bodies and all non-decorator/non-import application logic unchanged in the structural comparison.
- Protected core (37 files), environments, routes, API models/services, package/lock/config files and design tokens are byte-identical.
- See `verification.json`, final QA log and integrity manifest for machine-readable evidence.

### Testing notes
Browser validation used Chromium and the original backend from a local production preview. No fabricated API responses were used. A delayed GET exposed loading; an aborted GET exposed the error state, then retry recovered actual results. No live account, booking, listing, review, notification or photo data was changed. Snapshot capture forces existing image elements to eager-load solely for full-page screenshot completeness. Fixed bottom navigation appears at the initial viewport boundary in full-page screenshots; separate focus/scroll checks verify actual reachability.

Some initial probes were interrupted or read geometry before existing animation/Angular updates settled. The final settled 19-check run supersedes these partial measurements. Hidden/lazy images not loaded in an initial non-scrolled probe were not classified as broken; completed screenshot passes loaded them successfully.

## Deliberately deferred functional defects
These predate the patch and require a separate approved functionality pass:
- Favorites controls on home/search are not wired to state/actions.
- Search filter chips can stay stale; clearing filters leaves old URL query parameters, so reload can restore the old filter.
- Some links use /owner/inbox or /review-form rather than the declared routes. The guest booking redirect also uses an old place.html-style destination.
- Review-load failure can be shown as an empty list; detail loading/availability race concerns need functional review.
- Invalid create-place submission does not focus/scroll to its first error. This patch makes the errors visible/associated but leaves the handler unchanged.
- Mobile navigation does not close on Escape; gallery arrow-key handling is limited when focus is on the outer close button. Existing functioning Escape/focus-trap behavior is preserved.
- Review form's complete keyboard radio model/validation and registration password-rule indicator discrepancies remain outside this presentation-only change.

## Integration
Option A: use the included complete `frontend/` source tree, preserving your own repository history and local configuration.

Option B: from a clean, unchanged copy of the original frontend directory, review and apply the patch:

```sh
git apply --check ../review/sakane-ui-refinement.patch
git apply ../review/sakane-ui-refinement.patch
```

Use the existing scripts (`npm ci`, `npm run build`, `npm test -- --watch=false --browsers=ChromeHeadless`) in your development/CI environment. Browser tests require Chrome/Chromium. No dependency upgrade was introduced. Deployment remains an explicit separate action.

## Limitations
Not a Safari/Firefox or physical-device certification. Tenant demo has no populated trips/favorites/review list; those states were source-reviewed. Live writes, upload completion and end-to-end booking confirmation were intentionally not exercised. The screenshots are comparison evidence, not a promise that third-party imagery or live records will never change.
