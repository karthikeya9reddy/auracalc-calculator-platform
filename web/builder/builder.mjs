import { parseFormula, evaluateFormula } from '../builder-core.mjs';
import { parseLocalizedNumber } from '/src/calculation-core/index.mjs';
import { saveHistoryRecord } from '../storage.mjs';

const $ = selector => document.querySelector(selector);
const formula = $('#builder-formula'), name = $('#builder-name'), form = $('#builder-inputs'), output = $('#builder-result'), status = $('#builder-status'), saved = $('#builder-saved');
let compiled = null;
let lastResult = null;
let locale = 'en-US';
try { const value = localStorage.getItem('nexora.locale.v1'); if (['en-US','en-GB','de-DE','fr-FR','hi-IN'].includes(value)) locale = value; } catch {}
const key = 'auracalc.personal-formulas.v1';
$('#builderMenu').addEventListener('click', event => { const open = event.currentTarget.getAttribute('aria-expanded') !== 'true'; event.currentTarget.setAttribute('aria-expanded', String(open)); event.currentTarget.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu'); $('#builderNavigation').classList.toggle('open', open); });
function readSaved() { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value.filter(item => typeof item?.name === 'string' && typeof item?.expression === 'string').slice(0, 20) : []; } catch { return []; } }
function prepare() {
  lastResult = null; $('#builder-history').disabled = true;
  try {
    compiled = parseFormula(formula.value); form.replaceChildren(); output.textContent = '—';
    for (const variable of compiled.variables) { const label = document.createElement('label'); label.textContent = variable; const input = document.createElement('input'); input.type = 'text'; input.inputMode = 'decimal'; input.name = variable; input.placeholder = `Enter ${variable}`; input.addEventListener('input', () => { lastResult = null; $('#builder-history').disabled = true; output.textContent = '—'; status.textContent = 'Inputs changed. Calculate again.'; }); label.append(input); form.append(label); }
    status.textContent = compiled.variables.length ? `Enter ${compiled.variables.length} ${compiled.variables.length === 1 ? 'value' : 'values'} using ${locale} format.` : 'This formula has no inputs. Choose Calculate.';
    return true;
  } catch (error) { compiled = null; form.replaceChildren(); output.textContent = '—'; status.textContent = error.message; return false; }
}
function renderSaved() {
  saved.replaceChildren(); const records = readSaved();
  if (!records.length) { saved.textContent = 'No personal calculators saved yet.'; return; }
  records.forEach((record, index) => {
    const item = document.createElement('div'); item.className = 'builder-saved-item';
    const heading = document.createElement('strong'); heading.textContent = record.name;
    const expression = document.createElement('code'); expression.textContent = record.expression;
    const load = document.createElement('button'); load.type = 'button'; load.className = 'button button-secondary'; load.textContent = 'Open'; load.addEventListener('click', () => { name.value = record.name; formula.value = record.expression; prepare(); });
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'button button-quiet'; remove.textContent = 'Delete'; remove.addEventListener('click', () => { const latest = readSaved(); latest.splice(index, 1); try { localStorage.setItem(key, JSON.stringify(latest)); renderSaved(); } catch { status.textContent = 'This browser could not update your saved calculators.'; } });
    item.append(heading, expression, load, remove); saved.append(item);
  });
}
$('#builder-prepare').addEventListener('click', prepare);
formula.addEventListener('input', () => { compiled = null; lastResult = null; $('#builder-history').disabled = true; form.replaceChildren(); output.textContent = '—'; status.textContent = 'Formula changed. Set up inputs again.'; });
$('#builder-run').addEventListener('click', () => {
  if (!compiled) { prepare(); return; }
  try { const values = Object.create(null); for (const variable of compiled.variables) values[variable] = parseLocalizedNumber(form.elements.namedItem(variable).value, locale); const value = evaluateFormula(compiled.tree, values); lastResult = { values, value, expression: formula.value }; $('#builder-history').disabled = false; output.textContent = new Intl.NumberFormat(locale, { maximumSignificantDigits: 12 }).format(value); status.textContent = `Calculated from: ${formula.value}`; } catch (error) { lastResult = null; $('#builder-history').disabled = true; output.textContent = '—'; status.textContent = error.message; }
});
form.addEventListener('submit', event => { event.preventDefault(); $('#builder-run').click(); });
$('#builder-history').addEventListener('click', () => {
  if (!lastResult) return;
  const title = name.value.trim() || 'Personal formula';
  const rawInputs = Object.fromEntries(Object.entries(lastResult.values).map(([key, value]) => [key, { value, unit: '1' }]));
  const record = { id: globalThis.crypto?.randomUUID?.() || `formula-${Date.now()}-${Math.random().toString(36).slice(2)}`, kind: 'personal-formula', calculatorId: 'personal-formula', calculatorTitle: title, formula: lastResult.expression, methodVersion: 'Personal formula', calculatedAt: new Date().toISOString(), rawInputs, result: { outputs: { result: { value: lastResult.value, unit: '1' } } }, summary: `${lastResult.expression} = ${lastResult.value}`, route: '/builder/' };
  const outcome = saveHistoryRecord(record); status.textContent = outcome.saved ? 'Result saved to this device’s history.' : outcome.reason === 'paused' ? 'History saving is paused.' : 'Could not save history on this device.';
});
$('#builder-save').addEventListener('click', () => {
  if (!name.value.trim()) { status.textContent = 'Give your calculator a name before saving.'; name.focus(); return; }
  try { parseFormula(formula.value); const records = readSaved(); const item = { name: name.value.trim(), expression: formula.value.trim() }; const existing = records.findIndex(record => record.name.toLocaleLowerCase() === item.name.toLocaleLowerCase()); if (existing >= 0) records[existing] = item; else { if (records.length >= 20) throw new Error('You can save up to 20 personal calculators on this device.'); records.push(item); } localStorage.setItem(key, JSON.stringify(records)); renderSaved(); status.textContent = 'Calculator saved on this device.'; } catch (error) { status.textContent = error.message || 'This browser could not save your calculator.'; }
});
let restoration = null;
try { const pending = JSON.parse(sessionStorage.getItem('nexora.restore.v1') || 'null'); if (pending?.kind === 'personal-formula') { restoration = pending; sessionStorage.removeItem('nexora.restore.v1'); name.value = String(pending.title || '').slice(0, 80); formula.value = String(pending.formula || '').slice(0, 400); } } catch {}
prepare();
if (restoration && compiled) { for (const variable of compiled.variables) { const value = restoration.rawInputs?.[variable]?.value; if (typeof value === 'number' && Number.isFinite(value)) form.elements.namedItem(variable).value = new Intl.NumberFormat(locale, { useGrouping: false, maximumSignificantDigits: 17 }).format(value); } status.textContent = 'Saved inputs restored. Calculate again to produce a new result.'; }
renderSaved();
