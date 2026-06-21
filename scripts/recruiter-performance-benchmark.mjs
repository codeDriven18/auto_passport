/**
 * Recruiter portal performance benchmark.
 * Measures frontend render time + API/db/storage breakdown via X-SwipeJobs-Perf headers.
 *
 * Prerequisites: API (SWIPEJOBS_PERF=1) + Vite dev server running, Postgres with demo seed.
 */
import { chromium } from 'playwright';
import { createWriteStream } from 'node:fs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = process.env.API_URL ?? 'http://localhost:5123/api';
const WEB = process.env.WEB_URL ?? 'http://localhost:5173';
const EMAIL = process.env.BENCH_EMAIL ?? 'employer@pixelforge.demo';
const PASSWORD = process.env.BENCH_PASSWORD ?? 'Pipeline123!';

/** @typedef {{ apiMs: number, dbMs: number, storageMs: number, appMs: number, path: string }} PerfHeader */
/** @typedef {{ label: string, path: string, apiMs: number, dbMs: number, storageMs: number, appMs: number }} ApiSample */

/** @type {Map<string, ApiSample[]>} */
const apiSamples = new Map();

function parsePerfHeader(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function recordApi(label, perf) {
  if (!perf) return;
  const list = apiSamples.get(label) ?? [];
  list.push({
    label,
    path: perf.path ?? '',
    apiMs: perf.apiMs ?? 0,
    dbMs: perf.dbMs ?? 0,
    storageMs: perf.storageMs ?? 0,
    appMs: perf.appMs ?? 0,
  });
  apiSamples.set(label, list);
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function aggregateApiSamples(samples) {
  if (!samples?.length) {
    return { apiMs: 0, dbMs: 0, storageMs: 0, appMs: 0, count: 0 };
  }
  return {
    apiMs: median(samples.map((s) => s.apiMs)),
    dbMs: median(samples.map((s) => s.dbMs)),
    storageMs: median(samples.map((s) => s.storageMs)),
    appMs: median(samples.map((s) => s.appMs)),
    count: samples.length,
  };
}

function slowestLayer({ apiMs, dbMs, storageMs, appMs, frontendMs }) {
  const entries = [
    ['Frontend render', frontendMs],
    ['App processing', appMs],
    ['Database', dbMs],
    ['External storage', storageMs],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

async function waitForRender(page, selector, timeout = 30000) {
  const start = Date.now();
  await page.waitForSelector(selector, { state: 'visible', timeout });
  return Date.now() - start;
}

async function loginViaApi() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, rememberMe: false }),
  });
  if (!res.ok) throw new Error(`Login API failed: ${res.status} ${await res.text()}`);
  const perf = parsePerfHeader(res.headers.get('x-swipejobs-perf'));
  recordApi('login', perf);
  return res.json();
}

async function fetchWithAuth(path, token, label) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const perf = parsePerfHeader(res.headers.get('x-swipejobs-perf'));
  recordApi(label, perf);
  if (!res.ok) throw new Error(`${label} failed: ${res.status}`);
  return res;
}

function tinyPngBuffer() {
  // 1x1 PNG
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
}

async function run() {
  console.log('Benchmark config:', { API, WEB, EMAIL });

  const loginBody = await loginViaApi();
  const token = loginBody.accessToken;

  // Warm API data for IDs
  const appsRes = await fetchWithAuth('/portal/applications', token, 'pipeline:applications');
  const applications = await appsRes.json();
  const convRes = await fetchWithAuth('/portal/conversations', token, 'chat:list');
  const conversations = await convRes.json();

  const appWithResume = applications.find((a) => a.hasResume) ?? applications[0];
  const conversation = conversations[0];

  if (!appWithResume) throw new Error('No applications in demo data — enable Seed:DemoData');
  if (!conversation) throw new Error('No conversations in demo data');

  // Direct API benchmarks (3 runs each for stability)
  for (let i = 0; i < 3; i++) {
    await fetchWithAuth('/portal/stats', token, 'dashboard:stats');
    await fetchWithAuth('/portal/company', token, 'dashboard:company');
    await fetchWithAuth('/portal/applications', token, 'dashboard:applications');
    await fetchWithAuth('/portal/jobs', token, 'dashboard:jobs');
    await fetchWithAuth('/portal/conversations', token, 'dashboard:conversations');
    await fetchWithAuth(`/portal/applications/${appWithResume.id}`, token, 'candidate:detail');
    await fetchWithAuth('/portal/recruiter-tags', token, 'candidate:tags');
    await fetchWithAuth('/portal/applications', token, 'pipeline:applications');
    await fetchWithAuth(`/portal/conversations/${conversation.id}`, token, 'chat:conversation');
    await fetchWithAuth(`/portal/conversations/${conversation.id}/messages`, token, 'chat:messages');
    await fetch(`${API}/portal/applications/${appWithResume.id}/resume`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (res) => {
      recordApi('download:resume', parsePerfHeader(res.headers.get('x-swipejobs-perf')));
      await res.arrayBuffer();
    });

    const form = new FormData();
    form.append('file', new Blob([tinyPngBuffer()], { type: 'image/png' }), 'bench-logo.png');
    await fetch(`${API}/portal/company/logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then(async (res) => {
      recordApi('upload:logo', parsePerfHeader(res.headers.get('x-swipejobs-perf')));
      if (!res.ok) throw new Error(`upload failed ${res.status}`);
    });
  }

  // Frontend render benchmarks via Playwright
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  /** @type {Record<string, number>} */
  const frontendTimes = {};

  page.on('response', (response) => {
    const url = response.url();
    if (!url.includes('/api/')) return;
    const perf = parsePerfHeader(response.headers()['x-swipejobs-perf']);
    if (!perf) return;
    if (url.includes('/auth/login')) recordApi('login:browser', perf);
  });

  // Seed auth in localStorage
  await page.goto(`${WEB}/login`);
  await page.fill('#email', EMAIL);
  await page.fill('#password', PASSWORD);

  const loginStart = Date.now();
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/portal/, { timeout: 30000 });
  frontendTimes.login = Date.now() - loginStart;

  // Dashboard
  await page.goto(`${WEB}/portal`);
  frontendTimes.dashboard = await waitForRender(page, 'main, [class*="pageFrame"], h1, h2');

  // Pipeline
  await page.goto(`${WEB}/portal/pipeline`);
  frontendTimes.pipeline = await waitForRender(page, '[class*="pipeline"], [class*="Pipeline"], main');

  // Candidate profile
  await page.goto(`${WEB}/portal/applications/${appWithResume.id}`);
  frontendTimes.candidateProfile = await waitForRender(page, '[class*="candidateHero"], [class*="candidate"], main');

  // Chat
  await page.goto(`${WEB}/portal/messages/${conversation.id}`);
  frontendTimes.chat = await waitForRender(page, '[class*="msgPane"], [class*="chat"], textarea, main');

  // File download via UI not measured separately — API direct above

  await browser.close();

  // Aggregate dashboard as sum of parallel API calls (worst-case critical path ≈ max)
  function dashboardApi() {
    const keys = ['dashboard:stats', 'dashboard:company', 'dashboard:applications', 'dashboard:jobs', 'dashboard:conversations'];
    const aggs = keys.map((k) => aggregateApiSamples(apiSamples.get(k)));
    return {
      apiMs: Math.max(...aggs.map((a) => a.apiMs), 0),
      dbMs: Math.max(...aggs.map((a) => a.dbMs), 0),
      storageMs: Math.max(...aggs.map((a) => a.storageMs), 0),
      appMs: Math.max(...aggs.map((a) => a.appMs), 0),
    };
  }

  function candidateApi() {
    const detail = aggregateApiSamples(apiSamples.get('candidate:detail'));
    const tags = aggregateApiSamples(apiSamples.get('candidate:tags'));
    return {
      apiMs: detail.apiMs + tags.apiMs,
      dbMs: detail.dbMs + tags.dbMs,
      storageMs: detail.storageMs + tags.storageMs,
      appMs: detail.appMs + tags.appMs,
    };
  }

  function chatApi() {
    const conv = aggregateApiSamples(apiSamples.get('chat:conversation'));
    const msgs = aggregateApiSamples(apiSamples.get('chat:messages'));
    return {
      apiMs: conv.apiMs + msgs.apiMs,
      dbMs: conv.dbMs + msgs.dbMs,
      storageMs: conv.storageMs + msgs.storageMs,
      appMs: conv.appMs + msgs.appMs,
    };
  }

  const scenarios = [
    {
      action: 'Login',
      frontendMs: frontendTimes.login ?? 0,
      ...aggregateApiSamples(apiSamples.get('login')),
    },
    {
      action: 'Dashboard load',
      frontendMs: frontendTimes.dashboard ?? 0,
      ...dashboardApi(),
    },
    {
      action: 'Candidate profile load',
      frontendMs: frontendTimes.candidateProfile ?? 0,
      ...candidateApi(),
    },
    {
      action: 'Pipeline load',
      frontendMs: frontendTimes.pipeline ?? 0,
      ...aggregateApiSamples(apiSamples.get('pipeline:applications')),
    },
    {
      action: 'Chat open',
      frontendMs: frontendTimes.chat ?? 0,
      ...chatApi(),
    },
    {
      action: 'File upload (company logo)',
      frontendMs: 0,
      ...aggregateApiSamples(apiSamples.get('upload:logo')),
    },
    {
      action: 'File download (resume)',
      frontendMs: 0,
      ...aggregateApiSamples(apiSamples.get('download:resume')),
    },
  ];

  const report = scenarios.map((s) => ({
    ...s,
    slowestLayer: slowestLayer(s),
  }));

  console.log('\n=== SwipeJobs Recruiter Performance Report ===\n');
  console.table(report.map((r) => ({
    Action: r.action,
    'Frontend render (ms)': Math.round(r.frontendMs),
    'API response (ms)': Math.round(r.apiMs),
    'DB query (ms)': Math.round(r.dbMs),
    'Storage I/O (ms)': Math.round(r.storageMs),
    'App processing (ms)': Math.round(r.appMs),
    'Slowest layer': r.slowestLayer,
  })));

  const outPath = join(__dirname, 'recruiter-performance-report.json');
  await import('node:fs/promises').then((fs) =>
    fs.writeFile(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), scenarios: report }, null, 2)),
  );
  console.log(`\nFull report: ${outPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
