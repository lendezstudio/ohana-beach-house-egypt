# Ohana Beach House: website concept

Single-page concept for **Ohana Beach House**, a beach and pool house on the North Coast of New Alamein City, Egypt.
Static HTML/CSS/JS with no build step and no dependencies, ready for GitHub Pages.

## Preview locally

In VS Code: **Terminal → Run Build Task** (`Ctrl+Shift+B`) → *Ohana: Preview (localhost:5500)*, then open <http://localhost:5500/>.

From any terminal:

```powershell
powershell -ExecutionPolicy Bypass -File tools/serve.ps1          # http://localhost:5500
```

## Where things live

| Path | What |
|---|---|
| `index.html` | All page content and SEO / Open Graph tags |
| `assets/css/styles.css` | Styles (tokens at the top) |
| `assets/js/site-config.js` | **Edit this first:** phone, WhatsApp, map links, form provider, events |
| `assets/js/main.js` | Interactions (menu, hero, lightbox, events, form) |
| `assets/img/` | Optimized photos (WebP at several widths + one JPEG fallback each) |
| `assets/brand/` | Transparent logo (white + ink), favicons, app icons |
| `assets/og/og-image.jpg` | 1200×630 social sharing image |
| `Images/` | Original source photos (not referenced by the page) |
| `tools/` | Preview server, image pipeline, QA pages (not needed in production) |

## Common updates

**Add an event.** Add an object to `events` in `assets/js/site-config.js`. Cards, dates, the ticket button and Event structured data are generated automatically, and past dates hide themselves. With no events, the page shows "New dates are coming soon."

**Connect the inquiry form.** Set `form.provider` in `site-config.js`:
- `formspree`: `endpoint: 'https://formspree.io/f/…'`
- `webhook`: any JSON endpoint (GoHighLevel inbound webhook, custom backend)
- `emailjs`: fill `emailjs.serviceId / templateId / publicKey`

Until a provider is set, the form tells the visitor their message was **not** sent and points them to the phone number. It never fakes success.

**Map & directions.** Once the official Google Maps pin is confirmed, set `location.mapUrl` (shows the Get Directions button) and `location.mapEmbedUrl` (replaces the Visit image with a live map).

**WhatsApp.** Set `contact.whatsapp` once the official number is confirmed. It adds WhatsApp to the mobile action bar.

**Rebuild images** after adding or replacing photos in `Images/` (needs Chrome or Edge):
`powershell -ExecutionPolicy Bypass -File tools/build-images.ps1` (the list of photos lives in `tools/image-pipeline.html`).

## Deployment (GitHub Pages)

Live URL: <https://lendezstudio.github.io/ohana-beach-house-egypt/>

Deployed from the `main` branch, root folder (**Settings → Pages → Deploy from a branch → main / (root)**). Every push to `main` republishes the site within a minute or two.

- `.nojekyll` tells GitHub to serve the files as-is.
- `404.html` is the branded "page not found" page. Its links are absolute to `/ohana-beach-house-egypt/`.
- The canonical link, `og:url`, `og:image`, `twitter:image` and the structured data in `index.html` use the full GitHub Pages URL so social previews work.
- `Images/` (original photos) and the project PDFs are excluded by `.gitignore`.

**Moving to a custom domain later:** add the domain in Settings → Pages, then replace `https://lendezstudio.github.io/ohana-beach-house-egypt/` in the `<head>` of `index.html` and change the `/ohana-beach-house-egypt/` paths in `404.html` to `/`.

**Still to confirm with the business:** opening hours, reservation process, entry policy, WhatsApp, map pin, private-event capacity and services. None of these are stated on the site yet.

## QA aids

- `http://localhost:5500/tools/qa-tests.html`: automated checks (assets, links, menu, lightbox, form, events)
- `http://localhost:5500/?slide=2`: open the hero on a specific slide
