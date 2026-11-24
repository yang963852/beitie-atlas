#!/usr/bin/env node
/**
 * Card C measurement harness: cold-load timings for the reader paths
 * (home, timeline, object detail, records search, collection map).
 *
 * Research tool, not part of the build. It serves `dist/` with gzip, drives a
 * local Chrome over the DevTools protocol, and records, per run: first
 * contentful paint, largest contentful paint, the moment a named part of the
 * page is readable, the bytes actually transferred, and the resource split.
 *
 *   node scripts/perf/measure.mjs --tag baseline --runs 3
 *   node scripts/perf/measure.mjs --tag no-three --runs 3 --block-three
 *   node scripts/perf/measure.mjs --tag fast3g --runs 3 --throttle fast3g
 *
 * Node >= 22 (built-in WebSocket, fetch). No new dependencies.
 */
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(ROOT, 'dist');
const OUT_DIR = join(ROOT, '.private', 'tmp', 'card-c');
const PROFILE = join(ROOT, '.private', 'browser', 'perf');

// ---------------------------------------------------------------- arguments

function arg(name, fallback) {
  const index = process.argv.findIndex((value) => value === `--${name}` || value.startsWith(`--${name}=`));
  if (index === -1) return fallback;
  const [flag] = [process.argv[index]];
  if (flag.includes('=')) return flag.slice(flag.indexOf('=') + 1);
  const next = process.argv[index + 1];
  return next && !next.startsWith('--') ? next : 'true';
}
const has = (name) => process.argv.includes(`--${name}`);

const TAG = arg('tag', 'run');
const RUNS = Number(arg('runs', '3'));
const THROTTLE = arg('throttle', 'none');
const BLOCK_THREE = has('block-three');
const REDUCED = has('reduced');
const DESKTOP = has('desktop');
const GPU = has('gpu');
const ONLY = arg('paths', 'home,timeline,object,search,map').split(',').filter(Boolean);
const PORT = Number(arg('port', '4173'));
const CDP_PORT = Number(arg('cdp-port', '9333'));

// ------------------------------------------------------------------ fixture

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};
const COMPRESS = new Set(['.html', '.js', '.css', '.svg', '.json']);

function startServer() {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('dist/index.html is missing. Run `npm run build` first.');
  }
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = join(DIST, pathname === '/' ? 'index.html' : pathname);
    if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) {
      file = join(DIST, 'index.html');
    }
    const ext = extname(file).toLowerCase();
    const type = MIME[ext] ?? 'application/octet-stream';
    const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
    let body = readFileSync(file);
    const headers = { 'Content-Type': type, 'Cache-Control': 'no-store' };
    if (acceptsGzip && COMPRESS.has(ext)) {
      body = gzipSync(body, { level: 6 });
      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';
    }
    headers['Content-Length'] = body.length;
    res.writeHead(200, headers);
    res.end(body);
  });
  return new Promise((ok) => server.listen(PORT, '127.0.0.1', () => ok(server)));
}

// ------------------------------------------------------------ chrome driver

function chromeBinary() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error('No Chrome/Edge found. Set CHROME_PATH.');
  return found;
}

async function waitForCdp(timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (response.ok) return response.json();
    } catch {}
    await new Promise((ok) => setTimeout(ok, 250));
  }
  throw new Error('Chrome DevTools endpoint did not start.');
}

function launchChrome() {
  mkdirSync(PROFILE, { recursive: true });
  const child = spawn(chromeBinary(), [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    ...(GPU ? ['--use-angle=d3d11', '--enable-gpu'] : ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']),
    `--user-data-dir=${PROFILE}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--hide-scrollbars',
    '--mute-audio',
    'about:blank',
  ], { stdio: 'ignore' });
  return child;
}

async function openTarget() {
  const response = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' });
  return response.json();
}

async function closeTarget(id) {
  try {
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${id}`);
  } catch {}
}

function connect(url) {
  const socket = new WebSocket(url);
  let counter = 0;
  const pending = new Map();
  const handlers = new Map();
  const ready = new Promise((ok, fail) => {
    socket.addEventListener('open', ok, { once: true });
    socket.addEventListener('error', fail, { once: true });
  });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    } else if (message.method) {
      for (const handler of handlers.get(message.method) ?? []) handler(message.params);
    }
  });
  return {
    ready,
    send(method, params = {}) {
      return new Promise((ok) => {
        const id = ++counter;
        pending.set(id, ok);
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    on(method, handler) {
      const list = handlers.get(method) ?? [];
      list.push(handler);
      handlers.set(method, list);
    },
    close() { socket.close(); },
  };
}

// ------------------------------------------------------------------ reading

const READABLE = {
  home: "() => { const a = document.querySelector('#opening-title a'); if (!a) return false; const r = a.getBoundingClientRect(); return r.width > 0 && r.height > 0; }",
  timeline: "() => { const first = document.querySelector('.atlas-card'); if (!first) return false; const r = first.getBoundingClientRect(); return r.width > 0 && r.height > 0; }",
  object: "() => { const h = document.querySelector('#detail-title'); if (!h) return false; const r = h.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (h.textContent ?? '').trim().length > 0; }",
  search: "() => { const list = document.querySelector('.results__list'); if (!list) return false; const r = list.getBoundingClientRect(); return r.width > 0 && r.height > 0; }",
  map: "() => !!document.querySelector('.map--live, .map--fallback')",
};

const URLS = {
  home: '/',
  timeline: '/#catalogue',
  object: '/#/object/witness-jizhi',
  search: '/#/catalogue',
  map: '/#/collections',
};

function observer(expression) {
  return `(() => {
    const m = window.__perf = { readableAt: null, readableText: '', fcp: 0, lcp: 0, longTaskMs: 0, longTasks: 0 };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (entry.name === 'first-contentful-paint') m.fcp = entry.startTime;
      }).observe({ type: 'paint', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => { for (const entry of list.getEntries()) m.lcp = entry.startTime; })
        .observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) { m.longTaskMs += entry.duration; m.longTasks += 1; }
      }).observe({ type: 'longtask', buffered: true });
    } catch {}
    let settled = false;
    const tick = () => {
      if (settled) return;
      let ok = false;
      try { ok = (${expression})(); } catch { ok = false; }
      if (ok) {
        settled = true;
        m.readableAt = performance.now();
        const node = document.querySelector('#detail-title, #opening-title a, .atlas-card, .map--live, .map--fallback');
        m.readableText = (node?.textContent ?? '').replace(/\\s+/g, ' ').trim().slice(0, 90);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })();`;
}

const COLLECT = `(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  const resources = performance.getEntriesByType('resource').map((entry) => ({
    name: entry.name,
    type: entry.initiatorType,
    transfer: entry.transferSize,
    encoded: entry.encodedBodySize,
    decoded: entry.decodedBodySize,
    end: Math.round(entry.responseEnd),
  }));
  return {
    perf: window.__perf ?? null,
    nav: nav ? {
      ttfb: Math.round(nav.responseStart),
      dcl: Math.round(nav.domContentLoadedEventEnd),
      load: Math.round(nav.loadEventEnd),
    } : null,
    resources,
    title: document.title,
    href: location.href,
    hash: location.hash,
    mainClass: document.querySelector('main')?.className ?? '',
    cardCount: document.querySelectorAll('.atlas-card').length,
    heading: (document.querySelector('h1, h2')?.textContent ?? '').replace(/\\s+/g, ' ').trim().slice(0, 80),
  };
})()`;

const SEARCH_EXPR = `(async () => {
  const input = document.querySelector('#record-search, input[type=search]');
  const count = () => (document.querySelector('.results__count')?.textContent ?? '').trim();
  if (!input) return { error: 'no search input' };
  const before = count();
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  const start = performance.now();
  setter.call(input, '兰亭');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  for (let i = 0; i < 600; i += 1) {
    await new Promise((ok) => requestAnimationFrame(ok));
    if (count() !== before) {
      return {
        ms: Math.round(performance.now() - start),
        before,
        after: count(),
        rows: document.querySelectorAll('.results__list li').length,
      };
    }
  }
  return { ms: -1, before, after: count() };
})()`;

const MAP_STATE = `(() => {
  const live = document.querySelector('.map--live');
  const fallback = document.querySelector('.map--fallback');
  const canvasHost = document.querySelector('.map__canvas');
  const overlay = document.querySelector('.map__overlay');
  return {
    live: Boolean(live),
    fallback: Boolean(fallback),
    overlay: Boolean(overlay),
    canvases: canvasHost ? canvasHost.querySelectorAll('canvas').length : 0,
    images: canvasHost ? canvasHost.querySelectorAll('img').length : 0,
    imagesLoaded: canvasHost ? [...canvasHost.querySelectorAll('img')].filter((img) => img.complete && img.naturalWidth > 0).length : 0,
    notice: (document.querySelector('.map__notice')?.textContent ?? '').replace(/\\s+/g, ' ').trim().slice(0, 120),
  };
})()`;

// --------------------------------------------------------------------- runs

async function runOnce(path, index) {
  const target = await openTarget();
  const page = connect(target.webSocketDebuggerUrl);
  await page.ready;

  const netBytes = new Map();
  const requestType = new Map();
  let lastNetAt = Date.now();
  const errors = [];
  page.on('Log.entryAdded', (params) => {
    if (params.entry?.level === 'error') errors.push(String(params.entry.text).slice(0, 200));
  });
  page.on('Network.responseReceived', (params) => requestType.set(params.requestId, params.type));
  page.on('Network.loadingFinished', (params) => {
    const type = requestType.get(params.requestId) ?? 'Other';
    netBytes.set(type, (netBytes.get(type) ?? 0) + params.encodedDataLength);
    lastNetAt = Date.now();
  });
  const transferSoFar = () => [...netBytes.values()].reduce((sum, bytes) => sum + bytes, 0);

  await page.send('Page.enable');
  await page.send('Network.enable');
  await page.send('Runtime.enable');
  await page.send('Log.enable');
  await page.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.send('Emulation.setDeviceMetricsOverride', DESKTOP
    ? { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }
    : { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  if (!DESKTOP) await page.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  if (REDUCED) {
    await page.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
  }
  if (THROTTLE === 'fast3g') {
    await page.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      connectionType: 'cellular3g',
    });
  }
  if (BLOCK_THREE) {
    await page.send('Network.setBlockedURLs', { urls: ['*three.module*.js'] });
  }

  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: observer(READABLE[path]) });

  const started = Date.now();
  let loadTransfer = null;
  let loadTimedOut = false;
  const loadPromise = new Promise((ok) => {
    const timer = setTimeout(() => {
      loadTimedOut = true;
      ok();
    }, 45000);
    page.on('Page.loadEventFired', () => {
      // Snapshot inside the load event, before any later readable-time reads.
      loadTransfer = transferSoFar();
      clearTimeout(timer);
      ok();
    });
  });
  await page.send('Page.navigate', { url: `http://127.0.0.1:${PORT}${URLS[path]}` });

  let readable = -1;
  let readableTransfer = null;
  for (let i = 0; i < 900; i += 1) {
    const probe = await page.send('Runtime.evaluate', { expression: 'window.__perf?.readableAt ?? null', returnByValue: true });
    if (typeof probe.result?.result?.value === 'number') {
      readable = probe.result.result.value;
      // Sample here, not after `load`: the metric is the bytes already
      // transferred when the target became readable, not the final page total.
      readableTransfer = transferSoFar();
      break;
    }
    if (Date.now() - started > 45000) break;
    await new Promise((ok) => setTimeout(ok, 50));
  }
  await loadPromise;

  const result = { path, run: index + 1, readable: Math.round(readable), wall: Date.now() - started };
  result.transferAtReadable = readableTransfer;
  result.transferAtLoad = loadTransfer;
  result.loadTimedOut = loadTimedOut;

  if (path === 'home' && !REDUCED && !BLOCK_THREE) {
    const sceneStart = Date.now();
    let phase = 'poster';
    for (let i = 0; i < 150; i += 1) {
      const probe = await page.send('Runtime.evaluate', {
        expression: "document.querySelector('.desk')?.dataset.scene ?? 'none'",
        returnByValue: true,
      });
      phase = probe.result?.result?.value ?? 'none';
      if (phase === 'desk') break;
      if (Date.now() - sceneStart > 15000) break;
      await new Promise((ok) => setTimeout(ok, 100));
    }
    result.sceneMs = phase === 'desk' ? Date.now() - sceneStart : -1;
    result.scenePhase = phase;
  }

  for (let i = 0; i < 150; i += 1) {
    if (Date.now() - lastNetAt > 1000) break;
    await new Promise((ok) => setTimeout(ok, 100));
  }
  result.settledWall = Date.now() - started;

  if (path === 'home') {
    const enter = await page.send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        const link = document.querySelector('#opening-title a');
        const start = performance.now();
        link.click();
        for (let i = 0; i < 1200; i += 1) {
          const card = document.querySelector('.atlas-card');
          if (card) {
            const box = card.getBoundingClientRect();
            if (box.width > 0 && box.height > 0) return Math.round(performance.now() - start);
          }
          await new Promise((ok) => requestAnimationFrame(ok));
        }
        return -1;
      })()`,
    });
    result.enterMs = enter.result?.result?.value ?? -1;
  }
  if (path === 'search') {
    const search = await page.send('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: SEARCH_EXPR });
    result.search = search.result?.result?.value ?? null;
  }
  if (path === 'map') {
    await new Promise((ok) => setTimeout(ok, 4000));
    const state = await page.send('Runtime.evaluate', { returnByValue: true, expression: MAP_STATE });
    result.map = state.result?.result?.value ?? null;
  }

  const collected = await page.send('Runtime.evaluate', { returnByValue: true, expression: COLLECT });
  const value = collected.result?.result?.value ?? {};
  result.perf = value.perf;
  result.nav = value.nav;
  result.title = value.title;
  result.href = value.href;
  result.mainClass = value.mainClass;
  result.cardCount = value.cardCount;
  result.rows = result.search?.rows ?? -1;
  result.heading = value.heading;
  result.resources = (value.resources ?? []).map((entry) => ({
    name: entry.name.replace(`http://127.0.0.1:${PORT}`, ''),
    type: entry.type,
    end: entry.end,
    kb: Math.round((entry.transfer || 0) / 1024),
  }));
  result.consoleErrors = errors.slice(0, 8);
  result.requests = value.resources?.length ?? 0;
  result.documentBytes = netBytes.get('Document') ?? 0;
  result.scriptBytes = netBytes.get('Script') ?? 0;
  result.styleBytes = netBytes.get('Stylesheet') ?? 0;
  result.imageBytes = netBytes.get('Image') ?? 0;
  result.fontBytes = netBytes.get('Font') ?? 0;
  result.otherBytes = [...netBytes.entries()]
    .filter(([type]) => !['Document', 'Script', 'Stylesheet', 'Image', 'Font'].includes(type))
    .reduce((sum, [, bytes]) => sum + bytes, 0);
  result.transferTotal = [...netBytes.values()].reduce((sum, bytes) => sum + bytes, 0);
  result.pageTransfer = (value.resources ?? []).reduce((sum, entry) => sum + (entry.transfer || 0), 0);
  result.slowest = (value.resources ?? [])
    .slice()
    .sort((a, b) => (b.end ?? 0) - (a.end ?? 0))
    .slice(0, 6)
    .map((entry) => ({
      name: entry.name.replace(`http://127.0.0.1:${PORT}`, '').slice(0, 70),
      type: entry.type,
      end: entry.end,
      kb: Math.round((entry.transfer || 0) / 1024),
    }));

  page.close();
  await closeTarget(target.id);
  return result;
}

function median(values) {
  const numbers = values.filter((value) => typeof value === 'number' && value >= 0).sort((a, b) => a - b);
  if (!numbers.length) return null;
  const middle = Math.floor(numbers.length / 2);
  return numbers.length % 2 ? numbers[middle] : Math.round((numbers[middle - 1] + numbers[middle]) / 2);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const server = await startServer();
  const chrome = launchChrome();
  const version = await waitForCdp();
  const runs = [];
  try {
    for (const path of ONLY) {
      for (let index = 0; index < RUNS; index += 1) {
        try {
          const result = await runOnce(path, index);
          runs.push(result);
          process.stdout.write(`  ${path} #${index + 1} readable=${result.readable}ms transfer=${Math.round(result.transferTotal / 1024)}kB first=${Math.round(result.transferAtReadable / 1024)}kB scene=${result.sceneMs ?? '-'}${result.scenePhase ? `/${result.scenePhase}` : ''}\n`);
        } catch (error) {
          runs.push({ path, run: index + 1, error: String(error) });
          process.stdout.write(`  ${path} #${index + 1} failed: ${error}\n`);
        }
      }
    }
  } finally {
    chrome.kill();
    server.close();
  }

  const summary = {};
  for (const path of ONLY) {
    const items = runs.filter((run) => run.path === path && !run.error);
    summary[path] = {
      runs: items.length,
      readableMs: median(items.map((run) => run.readable)),
      fcpMs: median(items.map((run) => Math.round(run.perf?.fcp ?? -1))),
      lcpMs: median(items.map((run) => Math.round(run.perf?.lcp ?? -1))),
      dclMs: median(items.map((run) => run.nav?.dcl ?? -1)),
      loadMs: median(items.map((run) => run.nav?.load ?? -1)),
      transferKb: median(items.map((run) => Math.round(run.transferTotal / 1024))),
      firstScreenKb: median(items.map((run) => (run.transferAtReadable == null ? -1 : Math.round(run.transferAtReadable / 1024)))),
      loadTransferKb: median(items.map((run) => (run.transferAtLoad == null ? -1 : Math.round(run.transferAtLoad / 1024)))),
      loadTimedOutRuns: items.filter((run) => run.loadTimedOut).length,
      sceneMs: median(items.map((run) => run.sceneMs ?? -1)),
      settledMs: median(items.map((run) => run.settledWall ?? -1)),
      scriptKb: median(items.map((run) => Math.round(run.scriptBytes / 1024))),
      styleKb: median(items.map((run) => Math.round(run.styleBytes / 1024))),
      imageKb: median(items.map((run) => Math.round(run.imageBytes / 1024))),
      requests: median(items.map((run) => run.requests)),
      longTaskMs: median(items.map((run) => Math.round(run.perf?.longTaskMs ?? -1))),
      enterMs: median(items.map((run) => run.enterMs ?? -1)),
      searchMs: median(items.map((run) => run.search?.ms ?? -1)),
      searchAfter: median(items.map((run) => run.search?.after ?? -1)),
      rows: median(items.map((run) => run.rows ?? -1)),
      mapLive: items[0]?.map?.live ?? null,
      mapTiles: median(items.map((run) => run.map?.imagesLoaded ?? -1)),
    };
  }

  const payload = {
    tag: TAG,
    measuredAt: new Date().toISOString(),
    revision: readRevision(),
    chrome: version['Browser'],
    device: DESKTOP
      ? { viewport: '1440x900', dpr: 1, mobile: false, cpuThrottle: 1 }
      : { viewport: '390x844', dpr: 2, mobile: true, cpuThrottle: 4 },
    throttle: THROTTLE,
    blocked: BLOCK_THREE ? ['three.module'] : [],
    reducedMotion: REDUCED,
    server: { port: PORT, gzip: true, cacheControl: 'no-store' },
    runs,
    summary,
  };
  const file = join(OUT_DIR, `${TAG}.json`);
  writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
  process.stdout.write(`\n${JSON.stringify(summary, null, 2)}\n`);
  process.stdout.write(`\nwrote ${file}\n`);
}

function readRevision() {
  try {
    const head = readFileSync(join(ROOT, '.git', 'HEAD'), 'utf8').trim();
    if (!head.startsWith('ref:')) return head.slice(0, 7);
    const ref = head.replace('ref:', '').trim();
    const direct = join(ROOT, '.git', ref);
    if (existsSync(direct)) return readFileSync(direct, 'utf8').trim().slice(0, 7);
    const packed = join(ROOT, '.git', 'packed-refs');
    if (existsSync(packed)) {
      for (const line of readFileSync(packed, 'utf8').split('\n')) {
        const [sha, name] = line.trim().split(/\s+/);
        if (name === ref) return sha.slice(0, 7);
      }
    }
  } catch {}
  return 'unknown';
}

await main();
