import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listPublicCalculators, listPublicConverters } from '../catalog/public/index.mjs';
import { FIELD_DIRECTORY } from '../catalog/field-directory.mjs';
import { createFieldToolIndex } from '../catalog/field-tool-index.mjs';
import { fieldRoute, fieldSlug } from '../catalog/field-route.mjs';
import { getUnit } from '../src/calculation-core/index.mjs';

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function fieldList(fields) {
  return fields.map(field => `<li><strong>${escapeHtml(field.label)}</strong> — ${field.acceptedUnits.map(unit => escapeHtml(getUnit(unit).symbol)).join(', ')}</li>`).join('');
}

function fieldLinks(fields) {
  return fields.map(field => `<a class="field-tag-link" href="${fieldRoute(field)}">${escapeHtml(field)}</a>`).join('');
}

function referenceList(references) {
  return references.map(reference => `<li><a href="${escapeHtml(reference.url || '#')}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.citation)} ↗</a></li>`).join('');
}

export async function generateCalculatorPages(root = scriptRoot) {
  const calculatorRoot = resolve(root, 'web', 'calculators');
  const converterRoot = resolve(root, 'web', 'converters');
  const calculatorDefinitions = listPublicCalculators();
  const converterDefinitions = listPublicConverters();
  const calculatorIds = new Set(calculatorDefinitions.map(definition => definition.id));
  for (const entry of await readdir(calculatorRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || calculatorIds.has(entry.name)) continue;
    const oldPage = resolve(calculatorRoot, entry.name);
    if (!oldPage.startsWith(`${calculatorRoot}${sep}`)) throw new Error(`Unsafe stale calculator path: ${entry.name}`);
    let page = '';
    try { page = await readFile(resolve(oldPage, 'index.html'), 'utf8'); }
    catch (error) { if (error?.code !== 'ENOENT') throw error; }
    // Remove only pages bearing this generator's calculator marker; leave unrelated files untouched.
    if (page.includes(`data-calculator-id="${entry.name}" data-catalog-kind="calculator"`)) {
      await rm(oldPage, { recursive: true, force: true });
    }
  }
  for (const definition of converterDefinitions) {
    const oldPage = resolve(calculatorRoot, definition.id);
    if (!oldPage.startsWith(`${calculatorRoot}${sep}`)) throw new Error(`Unsafe legacy converter path: ${definition.id}`);
    await rm(oldPage, { recursive: true, force: true });
  }
  for (const definition of [...calculatorDefinitions, ...converterDefinitions]) {
    const isConverter = definition.catalogKind === 'converter';
    const outputRoot = isConverter ? converterRoot : calculatorRoot;
    const routeRoot = isConverter ? '/converters' : '/calculators';
    const toolGroup = isConverter ? 'converters' : 'formula calculators';
    const folder = resolve(outputRoot, definition.id);
    await mkdir(folder, { recursive: true });
    const description = `${definition.description} Method, inputs, units, source references, and limitations are documented.`;
    const structuredData = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: definition.title,
      applicationCategory: isConverter ? 'ConverterApplication' : 'CalculatorApplication', operatingSystem: 'Any modern browser',
      description: definition.description, isAccessibleForFree: true,
    }).replaceAll('<', '\\u003c');
    const page = `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#050508"><meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(definition.title)} | AuraCalc"><meta property="og:description" content="${escapeHtml(definition.description)}"><meta property="og:type" content="website">
  <link rel="canonical" href="${routeRoot}/${encodeURIComponent(definition.id)}/">
  <title>${escapeHtml(definition.title)} | AuraCalc ${toolGroup}</title>
  <link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icon.svg" type="image/svg+xml"><link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/lenis.css"><link rel="stylesheet" href="/aura-theme.css">
  <script type="application/ld+json">${structuredData}</script><script type="module" src="/scroll.mjs"></script><script type="module" src="/app.mjs"></script>
</head><body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><a class="brand" href="/" aria-label="AuraCalc home"><span class="brand-symbol" aria-hidden="true">A</span><span>AURACALC</span></a><nav class="desktop-nav page-navigation" id="calculatorPageNavigation" aria-label="Main navigation"><a href="/#explore">Calculators</a><a href="/fields/">Fields</a><a href="/converters/">Converters</a><a href="/measure/">Measure</a></nav><div class="header-tools"><label class="locale-control"><span class="sr-only">Number format</span><select id="localeSelect" aria-label="Number format"><option value="en-US">1,234.5</option><option value="en-GB">1,234.5 · UK</option><option value="de-DE">1.234,5 · DE</option><option value="fr-FR">1 234,5 · FR</option><option value="hi-IN">1,234.5 · IN</option></select></label><button class="icon-action history-action" id="historyButton" type="button" aria-label="Open calculation history" title="History">↺</button><button class="page-menu mobile-menu-button" id="calculatorPageMenu" type="button" aria-expanded="false" aria-controls="calculatorPageNavigation" aria-label="Open navigation menu">☰</button></div></header>
  <main class="section-shell tool-page" id="main"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="${isConverter ? '/converters/' : '/#explore'}">${isConverter ? 'Converters' : 'Formula calculators'}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(definition.title)}</span></nav>
    <div class="tool-page-heading"><div><div class="eyebrow">${escapeHtml(definition.discipline)} · ${escapeHtml(definition.category)}</div><h1>${escapeHtml(definition.title)}</h1><p>${escapeHtml(definition.description)}</p></div><span class="verified-pill"><span class="status-dot"></span> Published · ${escapeHtml(definition.riskClass)}</span></div>
    <section id="calculatorRuntime" class="calculator-runtime" data-calculator-id="${escapeHtml(definition.id)}" data-catalog-kind="${isConverter ? 'converter' : 'calculator'}" aria-label="${escapeHtml(definition.title)} ${isConverter ? 'converter' : 'calculator'}"><noscript>Enable JavaScript to calculate. The method and input definitions remain available on this page.</noscript></section>
    <section class="tool-method-info"><div><h2>Method and scope</h2><p>${escapeHtml(definition.method.description)}</p><p>${escapeHtml(definition.purpose)} Intended for ${escapeHtml(Array.isArray(definition.intendedAudience) ? definition.intendedAudience.join(', ') : definition.intendedAudience)}.</p><strong>Inputs</strong><ul class="seo-list">${fieldList(definition.inputs)}</ul></div>
      <div class="method-source"><span class="eyebrow">SOURCE AND LIMITS</span><ul class="seo-list">${referenceList(definition.references)}</ul><p><strong>Assumptions:</strong> ${escapeHtml(definition.assumptions.join(' '))}</p><p><strong>Limitations:</strong> ${escapeHtml(definition.limitations.join(' '))}</p><small>Method version ${escapeHtml(definition.version)} · Unit registry and result provenance are shown after calculation. This tool is limited to the documented scope.</small></div></section>
    ${isConverter ? '<section class="tool-field-links"><h2>Browse all converters</h2><p>Choose another physical quantity and supported unit pair.</p><a class="field-tag-link" href="/converters/">Open the converter section ↗</a></section>' : `<section class="tool-field-links" aria-labelledby="related-fields-title"><h2 id="related-fields-title">Explore related fields</h2><p>See the other currently released formula calculators tagged for these research fields.</p><div>${fieldLinks(definition.fields)}</div></section>`}
    <a class="back-link" href="${isConverter ? '/converters/' : '/#explore'}">← Back to ${isConverter ? 'converters' : 'formula calculators'}</a></main>
  <footer class="site-footer compact-footer"><a class="brand" href="/" aria-label="AuraCalc home"><span class="brand-symbol" aria-hidden="true">A</span><span>AURACALC</span></a><small>Documented methods. Visible limits. Traceable results.</small></footer>
  <dialog class="app-dialog" id="historyDialog" aria-labelledby="historyTitle" data-lenis-prevent><div class="dialog-heading"><div><span class="eyebrow">SAVED ON THIS DEVICE</span><h2 id="historyTitle">Calculation history</h2></div><button class="icon-action" type="button" data-close-dialog aria-label="Close history">×</button></div><p class="dialog-description">History stays in this browser profile. Avoid saving sensitive information on a shared device.</p><label class="history-setting"><input id="historyEnabled" type="checkbox"><span><strong>Save successful calculations</strong><small>Turn this off to pause future saves. Existing entries remain until deleted.</small></span></label><div class="history-list" id="historyList"></div><div class="dialog-actions"><button class="button button-danger" id="clearHistory" type="button">Clear history</button><button class="button button-primary" type="button" data-close-dialog>Done</button></div></dialog>
  <dialog class="app-dialog" id="historyRecordDialog" aria-labelledby="historyRecordTitle" data-lenis-prevent><div class="dialog-heading"><div><span class="eyebrow">ORIGINAL SAVED RESULT</span><h2 id="historyRecordTitle">Calculation</h2></div><button class="icon-action" type="button" data-close-dialog aria-label="Close saved result">×</button></div><div id="historyRecordContent"></div><div class="dialog-actions"><button class="button button-quiet" id="restoreHistoryInputs" type="button">Restore inputs</button><button class="button button-primary" type="button" data-close-dialog>Done</button></div></dialog>
  <dialog class="app-dialog small-dialog" id="noticeDialog" aria-labelledby="noticeTitle" data-lenis-prevent><div class="dialog-heading"><h2 id="noticeTitle">AuraCalc note</h2><button class="icon-action" type="button" data-close-dialog aria-label="Close">×</button></div><p id="noticeText"></p><div class="dialog-actions"><button class="button button-primary" type="button" data-close-dialog>Got it</button></div></dialog>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
</body></html>`;
    await writeFile(resolve(folder, 'index.html'), page, 'utf8');
  }
  await generateFieldPages(root, calculatorDefinitions);
  const definitions = calculatorDefinitions;
  const converterRouteLines = converterDefinitions.map(definition => `  '/converters/${definition.id}/',`).join('\n');
  const workerPath = resolve(root, 'web', 'sw.js');
  const worker = await readFile(workerPath, 'utf8');
  const routeLines = definitions.map(definition => `  '/calculators/${definition.id}/',`).join('\n');
  const updatedWorker = worker.replace(
    /  \/\/ GENERATED_CALCULATOR_ROUTES_START[\s\S]*?  \/\/ GENERATED_CALCULATOR_ROUTES_END/,
    `  // GENERATED_CALCULATOR_ROUTES_START\n${routeLines}\n  // GENERATED_CALCULATOR_ROUTES_END`,
  );
  if (updatedWorker === worker && !worker.includes('GENERATED_CALCULATOR_ROUTES_START')) {
    throw new Error('Service worker calculator-route markers are missing.');
  }
  const updatedConverterWorker = updatedWorker.replace(
    /  \/\/ GENERATED_CONVERTER_ROUTES_START[\s\S]*?  \/\/ GENERATED_CONVERTER_ROUTES_END/,
    `  // GENERATED_CONVERTER_ROUTES_START\n${converterRouteLines}\n  // GENERATED_CONVERTER_ROUTES_END`,
  );
  if (updatedConverterWorker === updatedWorker && !worker.includes('GENERATED_CONVERTER_ROUTES_START')) {
    throw new Error('Service worker converter-route markers are missing.');
  }
  const fieldRouteLines = FIELD_DIRECTORY.map(field => `  '${fieldRoute(field)}',`).join('\n');
  const finalWorker = updatedConverterWorker.replace(
    /  \/\/ GENERATED_FIELD_ROUTES_START[\s\S]*?  \/\/ GENERATED_FIELD_ROUTES_END/,
    `  // GENERATED_FIELD_ROUTES_START\n${fieldRouteLines}\n  // GENERATED_FIELD_ROUTES_END`,
  );
  if (finalWorker === updatedConverterWorker && !worker.includes('GENERATED_FIELD_ROUTES_START')) {
    throw new Error('Service worker field-route markers are missing.');
  }
  await writeFile(workerPath, finalWorker, 'utf8');
  return Object.freeze({ calculators: definitions.length, converters: converterDefinitions.length });
}

export async function generateFieldPages(root = scriptRoot, definitions = listPublicCalculators()) {
  const outputRoot = resolve(root, 'web', 'fields');
  const fieldToolMap = createFieldToolIndex(definitions);
  const slugs = new Set();
  for (const [index, field] of FIELD_DIRECTORY.entries()) {
    const slug = fieldSlug(field);
    if (slug === 'index') throw new Error('The field slug "index" is reserved for the field directory page.');
    if (slugs.has(slug)) throw new Error(`Field URL slug collision: ${slug}`);
    slugs.add(slug);
    const tools = fieldToolMap.get(field) || [];
    const route = fieldRoute(field);
    const pageDescription = tools.length
      ? `Browse ${tools.length} currently released calculators tagged for ${field} on AuraCalc, with methods, source links, and documented limits.`
      : `Explore AuraCalc's research directory for ${field}. No calculator has been released for this field yet; suggest a tool for future development.`;
    const publicOrigin = process.env.AURACALC_PUBLIC_URL || process.env.NEXORA_PUBLIC_URL;
    const structuredData = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${field} calculators`,
      description: pageDescription,
      ...(publicOrigin ? { url: new URL(route, publicOrigin).href } : {}),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: tools.length,
        itemListElement: tools.map((definition, toolIndex) => ({
          '@type': 'ListItem', position: toolIndex + 1,
          ...(publicOrigin ? { url: new URL(`/calculators/${definition.id}/`, publicOrigin).href } : {}), name: definition.title,
        })),
      },
    }).replaceAll('<', '\\u003c');
    const groupedTools = new Map();
    for (const definition of [...tools].sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title))) {
      if (!groupedTools.has(definition.category)) groupedTools.set(definition.category, []);
      groupedTools.get(definition.category).push(definition);
    }
    const toolCards = [...groupedTools].map(([category, entries]) => `<section class="directory-group" data-field-group><h3>${escapeHtml(category)}</h3><ul class="directory-links">${entries.map(definition => `<li data-field-tool data-search="${escapeHtml(`${definition.title} ${definition.description} ${definition.category} ${definition.discipline} ${definition.keywords.join(' ')}`.toLocaleLowerCase())}"><a href="/calculators/${encodeURIComponent(definition.id)}/">${escapeHtml(definition.title)}</a></li>`).join('')}</ul></section>`).join('\n');
    const emptyState = tools.length ? '' : `<div class="field-empty-state"><span class="eyebrow">RESEARCH SCOPE · NO RELEASED CALCULATORS</span><h2>We haven’t released a calculator for this field yet.</h2><p>This field is in the research directory. A tool will appear here after its method, sources, and required review are in place.</p><a class="hero-cta" href="/?feedback=idea&amp;field=${encodeURIComponent(field)}#feedback"><span>Suggest a calculator for ${escapeHtml(field)}</span><span aria-hidden="true">↗</span></a></div>`;
    const toolsSection = tools.length ? `<section class="field-page-catalog" aria-labelledby="field-tools-title">
      <div class="field-page-section-heading"><div><p class="eyebrow">CURRENT RELEASED SET</p><h2 id="field-tools-title">${tools.length} related calculator${tools.length === 1 ? '' : 's'}</h2></div><p>Every calculator currently tagged for this field is listed below. Related tools can be general-purpose; their page explains the method and limits.</p></div>
      <div class="field-tool-controls"><label for="field-calculator-search">Search calculators in ${escapeHtml(field)}</label><input id="field-calculator-search" type="search" autocomplete="off" placeholder="Search by calculator name or topic"><p id="field-calculator-status" role="status" aria-live="polite">Showing ${Math.min(tools.length, 20)} of ${tools.length} calculators.</p></div>
      <div class="field-tool-directory">${toolCards}</div>
      <button class="field-tools-more" id="field-tools-more" type="button"${tools.length > 20 ? '' : ' hidden'}>Show next ${Math.min(20, Math.max(0, tools.length - 20))} calculators</button>
      <div class="field-page-note"><strong>Coverage note</strong><p>Being related to a field does not make a tool a specialist or professional design method. Check each calculator’s scope, assumptions, sources, and review record before using its result.</p></div>
    </section>` : emptyState;
    const page = `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#050508"><meta name="description" content="${escapeHtml(pageDescription)}">
  <meta name="robots" content="${tools.length ? 'index,follow' : 'noindex,follow'}">
  <meta property="og:title" content="${escapeHtml(field)} calculators | AuraCalc"><meta property="og:description" content="${escapeHtml(pageDescription)}"><meta property="og:type" content="website">
  <title>${escapeHtml(field)} calculators | AuraCalc</title>
  <link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icon.svg" type="image/svg+xml"><link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/lenis.css"><link rel="stylesheet" href="/aura-theme.css">
  <script type="application/ld+json">${structuredData}</script><script type="module" src="/scroll.mjs"></script><script type="module" src="/field-catalog-page.mjs"></script><script type="module" src="/app.mjs"></script>
</head><body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><a class="brand" href="/" aria-label="AuraCalc home"><span class="brand-symbol" aria-hidden="true">A</span><span>AURACALC</span></a><nav class="desktop-nav page-navigation" id="calculatorPageNavigation" aria-label="Main navigation"><a href="/#explore">Explore tools</a><a href="/fields/">Fields</a><a href="/converters/">Converters</a><a href="/measure/">Measure</a><a href="/#workflow">Workflows</a></nav><div class="header-tools"><button class="page-menu mobile-menu-button" id="calculatorPageMenu" type="button" aria-expanded="false" aria-controls="calculatorPageNavigation" aria-label="Open navigation menu">☰</button></div></header>
  <main class="section-shell field-page" id="main"><nav class="breadcrumbs field-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/fields/">All fields</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(field)}</span></nav>
    <section class="field-page-hero"><div><p class="eyebrow">FIELD DIRECTORY / ${String(index + 1).padStart(2, '0')} OF ${FIELD_DIRECTORY.length}</p><h1>${escapeHtml(field)}</h1><p>${tools.length ? `Browse the ${tools.length} calculators currently released and tagged for this field.` : `This field is mapped in our research directory; no calculator has been released for it yet.`}</p></div><div class="field-page-count"><strong>${tools.length}</strong><span>${tools.length === 1 ? 'RELATED TOOL' : 'RELATED TOOLS'}</span><small>${tools.length ? 'CURRENTLY RELEASED' : 'RESEARCH IN PROGRESS'}</small></div></section>
    ${toolsSection}
    ${tools.length ? `<p class="field-page-suggest-wrap"><a class="field-page-suggest" href="/?feedback=idea&amp;field=${encodeURIComponent(field)}#feedback">Suggest another calculator ↗</a></p>` : ''}
  </main>
  <footer class="site-footer compact-footer"><a class="brand" href="/" aria-label="AuraCalc home"><span class="brand-symbol" aria-hidden="true">A</span><span>AURACALC</span></a><small>Documented methods. Visible limits. Traceable results.</small></footer>
</body></html>`;
    const folder = resolve(outputRoot, slug);
    await mkdir(folder, { recursive: true });
    await writeFile(resolve(folder, 'index.html'), page, 'utf8');
  }
  const publicOrigin = process.env.AURACALC_PUBLIC_URL || process.env.NEXORA_PUBLIC_URL;
  const populatedFields = FIELD_DIRECTORY.filter(field => fieldToolMap.get(field).length > 0).length;
  const directoryDescription = `Browse all ${FIELD_DIRECTORY.length} AuraCalc research fields. Open any field to see its complete currently released calculator list and coverage status.`;
  const directorySchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Calculator fields',
    description: directoryDescription,
    ...(publicOrigin ? { url: new URL('/fields/', publicOrigin).href } : {}),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: FIELD_DIRECTORY.length,
      itemListElement: FIELD_DIRECTORY.map((field, index) => ({
        '@type': 'ListItem', position: index + 1,
        ...(publicOrigin ? { url: new URL(fieldRoute(field), publicOrigin).href } : {}), name: field,
      })),
    },
  }).replaceAll('<', '\\u003c');
  const directoryCards = FIELD_DIRECTORY.map((field, index) => {
    const tools = fieldToolMap.get(field) || [];
    const status = tools.length
      ? `${tools.length} related general-purpose ${tools.length === 1 ? 'tool' : 'tools'}`
      : 'Research mapped · no released tool yet';
    return `<a class="field-directory-card" data-field-name="${escapeHtml(field.toLocaleLowerCase())}" href="${fieldRoute(field)}" aria-label="Open ${escapeHtml(field)} field page with ${tools.length} currently released calculators">
      <span class="field-index">${String(index + 1).padStart(2, '0')}</span><span class="field-directory-card-copy"><strong>${escapeHtml(field)}</strong><small>${escapeHtml(status)}</small></span><span class="field-directory-card-arrow" aria-hidden="true">↗</span>
    </a>`;
  }).join('\n');
  const directoryPage = `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#050508"><meta name="description" content="${escapeHtml(directoryDescription)}">
  <meta property="og:title" content="Calculator fields | AuraCalc"><meta property="og:description" content="${escapeHtml(directoryDescription)}"><meta property="og:type" content="website">
  <title>Browse calculator fields | AuraCalc</title>
  <link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icon.svg" type="image/svg+xml"><link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/lenis.css"><link rel="stylesheet" href="/aura-theme.css">
  <script type="application/ld+json">${directorySchema}</script><script type="module" src="/field-directory-page.mjs"></script>
</head><body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><a class="brand" href="/" aria-label="AuraCalc home"><span class="brand-symbol" aria-hidden="true">A</span><span>AURACALC</span></a><nav class="desktop-nav page-navigation" id="fieldDirectoryNavigation" aria-label="Main navigation"><a href="/#explore">Explore tools</a><a href="/fields/" aria-current="page">Fields</a><a href="/converters/">Converters</a><a href="/measure/">Measure</a><a href="/#workflow">Workflows</a></nav><div class="header-tools"><button class="page-menu mobile-menu-button" id="fieldDirectoryMenu" type="button" aria-expanded="false" aria-controls="fieldDirectoryNavigation" aria-label="Open navigation menu">☰</button></div></header>
  <main class="section-shell field-directory-page" id="main">
    <nav class="breadcrumbs field-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">All fields</span></nav>
    <p class="field-directory-meta">${FIELD_DIRECTORY.length} RESEARCH FIELDS · ${populatedFields} WITH RELATED TOOLS</p>
    <section class="field-directory-hero"><p class="eyebrow">THE FIELD DIRECTORY / ${FIELD_DIRECTORY.length} RESEARCH GROUPS</p><h1>Choose a field.<br><span>See what’s available.</span></h1><p>Open a field to see its own calculator page and the complete set of tools currently tagged to it. A mapped field can still be waiting for its first released calculator.</p></section>
    <div class="field-directory-controls"><label for="field-directory-search">Find a field</label><input id="field-directory-search" type="search" autocomplete="off" placeholder="Search fields, such as civil, mining, or physics"><p id="field-directory-status" role="status" aria-live="polite">Showing all ${FIELD_DIRECTORY.length} fields.</p></div>
    <div class="field-directory-grid" id="field-directory-grid">${directoryCards}</div>
    <p class="field-directory-empty" id="field-directory-empty" hidden>No field matches that search. Try a broader term.</p>
    <div class="field-directory-footer"><p>Each field page distinguishes currently released calculators from research scope. Related general-purpose tools are labeled; specialist methods appear as they are developed and reviewed.</p><a href="/">Return to AuraCalc home ↗</a></div>
  </main>
  <footer class="site-footer compact-footer"><a class="brand" href="/" aria-label="AuraCalc home"><span class="brand-symbol" aria-hidden="true">A</span><span>AURACALC</span></a><small>Documented methods. Visible limits. Traceable results.</small></footer>
</body></html>`;
  await writeFile(resolve(outputRoot, 'index.html'), directoryPage, 'utf8');
  return FIELD_DIRECTORY.length;
}
