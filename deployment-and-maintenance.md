# AuraCalc deployment and monthly maintenance

This guide covers the current static-site foundation. AuraCalc is not deployed, and no hosting account, domain, feedback endpoint, consent manager, or advertising provider is configured.

## Run and review the site locally

Install Node.js 20 or newer. From the project folder:

```text
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173` in a browser and manually review the home page, calculator pages, converter, history controls, feedback form, keyboard flow, and narrow-screen layout. The current environment could not complete this browser review, so a human browser/device check is still a release task. Stop the preview with `Ctrl+C`.

## Prepare a static deployment

1. Choose a static host and domain, then confirm it supports HTTPS, clean directory URLs (for example `/calculators/rectangle-area/`), and JavaScript ES modules with the correct MIME type.
2. Set `AURACALC_PUBLIC_URL` to the site's final HTTPS origin before building if sitemap and canonical links are wanted. For PowerShell:

   ```powershell
   $env:AURACALC_PUBLIC_URL = "https://your-domain.example/"
   npm run build
   ```

   Use the real domain only. The build rejects non-HTTPS values and paths beyond the origin.
3. Upload the **contents of `dist/`** as the static site's document root. Do not publish the project root, `sources/`, or development files.
4. Verify the deployed home page, every generated calculator route, unit converter, module loading, HTTPS, service-worker registration, canonical URLs, sitemap, and `robots.txt` in a browser.
5. Keep a copy of the last known-good deployment bundle so it can be restored if a release has a problem.

`npm run build` regenerates calculator information pages and service-worker routes, then creates a clean bundle in `dist/`. It replaces `dist/` only when an AuraCalc build marker is present. If the marker is absent, the build stops rather than deleting an unknown folder. Lenis is vendored under `web/vendor/` with its license so smooth scrolling works without a runtime CDN request; update the package, vendored module, stylesheet, and license together.

## Add or change a calculator

1. Follow `calculation-assurance-policy.md`; identify the exact use, exclusions, risk class, jurisdiction (where relevant), authoritative formula source and edition, units, and precision limits.
2. Add a versioned method definition under `catalog/public/` only after its risk-appropriate review is complete. Keep test fixtures out of the public catalog.
3. Add expected-value, boundary, invalid-input, unit, and regression cases. Have a second person independently derive and review the expected values when the risk policy requires it.
4. Run `npm test`, `npm run build`, then review the affected pages in a real browser. Inspect workflow links and downstream definitions if the changed method feeds another calculator.
5. Record the change and source/review evidence with the method version. Publish the new static bundle only after its release record is accurate.

The current starter calculators record developer self-review and automated/reference cases. They do not claim independent domain review. Do not use them for structural design, safety, medical, tax, or other consequential decisions.

## Monthly maintenance routine

- Check whether referenced equations, standards, data sources, supported units, or software dependencies changed. These four starter methods use stable educational equations; immediately revisit them if a source correction, bug report, or scope change is found.
- Review feedback exports for suspected result issues and missing tools. Feedback currently stays on the user's device until the user exports it; the website owner does not receive submissions automatically.
- Run the automated checks, build the bundle, review changed pages on desktop and mobile browsers, and confirm links, units, warnings, and result provenance.
- Retain the current and prior release bundles, record the changed calculator versions, and verify that a rollback copy is usable.
- Recheck privacy and consent before adding analytics, AI, camera uploads, account services, or advertising. The advertising adapter is disabled unless explicit consent and an adapter are supplied; no consent platform or provider is installed.
- Revisit accessibility, security headers/content policy, backups, uptime monitoring, incident reporting, and operational ownership before inviting public traffic.

## Not yet ready for public launch

The website can build a static bundle, but it has not passed browser/device, screen-reader, accessibility, security, load, or production-host verification. It has no server-side feedback collection, AI service, camera measurement, synchronized history, authentication, analytics, or advertising network. There is no evidence for any traffic capacity or production service level. Finish those reviews and decisions before describing the platform as production-ready.
