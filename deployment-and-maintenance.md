# AuraCalc deployment and monthly maintenance

This guide covers the current static-site foundation. AuraCalc is not deployed, and no hosting account, domain, feedback endpoint, consent manager, or advertising provider is configured.

## Run and review the site locally

Install Node.js 20 or newer. From the project folder:

```text
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173` in a browser and review the home page, calculator pages, converter, history controls, feedback form, keyboard flow, and narrow-screen layout. Selected desktop and narrow-screen browser checks have been completed locally; real mobile hardware, camera permissions, AR tracking and screen readers remain release checks. Stop the preview with `Ctrl+C`.

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

- Check whether referenced equations, standards, data sources, supported units, or software dependencies changed. Immediately revisit affected methods when a source correction, bug report, or scope change is found.
- Review feedback exports for suspected result issues and missing tools. Feedback currently stays on the user's device until the user exports it; the website owner does not receive submissions automatically.
- Run the automated checks, build the bundle, review changed pages on desktop and mobile browsers, and confirm links, units, warnings, and result provenance.
- Retain the current and prior release bundles, record the changed calculator versions, and verify that a rollback copy is usable.
- Recheck privacy and consent before adding analytics, AI, camera uploads, account services, or advertising. The advertising adapter is disabled unless explicit consent and an adapter are supplied; no consent platform or provider is installed.
- Revisit accessibility, security headers/content policy, backups, uptime monitoring, incident reporting, and operational ownership before inviting public traffic.

## Not yet ready for public launch

The website builds a static bundle and has local browser checks. Photo measurement and supported-device AR are implemented as estimates; the optional photo AI endpoint is local-only. A public authenticated AI backend, cost limits and privacy arrangements are not deployed. Physical-device accuracy, screen-reader, security, load and production-host verification remain outstanding. Feedback stays on the user's device, and there is no synchronized history or connected advertising network. Do not claim an established production service level or million-user capacity.

The bundle includes a `_headers` file for hosts that support it. On other hosts, configure equivalent content-type, referrer and permission restrictions. The camera, location and XR permissions are limited to the same origin; microphone access is disabled. Verify these settings after deployment, and validate a content security policy against the selected host and providers before enforcing it.
