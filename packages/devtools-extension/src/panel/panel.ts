import { Schema } from 'effect';
import { FlowExportSchema } from '@forgerock/devtools-types';
import type { FlowExport } from '@forgerock/devtools-types';
import { redactFlowState } from '../export/redact.js';
import { renderFlowMarkdown } from '../export/markdown.js';
import { runDiagnosis } from '../background/diagnosis-engine.js';
import { formatUnixTime, parseJwt } from './jwt.js';

declare const Elm: {
  Main: {
    init: (opts: { node: HTMLElement | null; flags: null }) => {
      ports: {
        receiveEvent: { send: (event: unknown) => void };
        receiveDiagnosis: { send: (diagnosis: unknown) => void };
        receiveImportMeta: { send: (meta: unknown) => void };
        receiveImportError: { send: (error: unknown) => void };
        exportJson: { subscribe: (cb: () => void) => void };
        exportMarkdown: { subscribe: (cb: () => void) => void };
        submitImportPaste: { subscribe: (cb: (text: string) => void) => void };
        clearFlow: { subscribe: (cb: () => void) => void };
        saveSnapshot: { subscribe: (cb: () => void) => void };
        requestSnapshots: { subscribe: (cb: () => void) => void };
        receiveSnapshots: { send: (snapshots: unknown[]) => void };
        loadSnapshot: { subscribe: (cb: (id: string) => void) => void };
        deleteSnapshot: { subscribe: (cb: (id: string) => void) => void };
        copyToClipboard: { subscribe: (cb: (text: string) => void) => void };
      };
    };
  };
};

// ── Panel resize ─────────────────────────────────────────────────────────────

const MIN_GRAPH_W = 120;
const MAX_GRAPH_W = 480;
const MIN_INSP_H = 80;
const MAX_INSP_H = 600;

const root = document.documentElement;

function setGraphW(px: number) {
  const clamped = Math.min(MAX_GRAPH_W, Math.max(MIN_GRAPH_W, px));
  root.style.setProperty('--graph-w', `${clamped}px`);
}

function setInspH(px: number) {
  const clamped = Math.min(MAX_INSP_H, Math.max(MIN_INSP_H, px));
  root.style.setProperty('--insp-h', `${clamped}px`);
}

function makeResizeHandle(cls: 'resize-handle-v' | 'resize-handle-h'): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `resize-handle ${cls}`;
  document.body.appendChild(el);
  return el;
}

function initResizeHandles() {
  const vHandle = makeResizeHandle('resize-handle-v');
  const hHandle = makeResizeHandle('resize-handle-h');

  // ── vertical (graph width) ──────────────────────────────────────
  vHandle.addEventListener('mousedown', (e: MouseEvent) => {
    e.preventDefault();
    vHandle.classList.add('dragging');
    document.body.classList.add('resizing');
    const startX = e.clientX;
    const startW = parseInt(getComputedStyle(root).getPropertyValue('--graph-w'), 10);

    function onMove(ev: MouseEvent) {
      setGraphW(startW + (ev.clientX - startX));
    }
    function onUp() {
      vHandle.classList.remove('dragging');
      document.body.classList.remove('resizing');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  // ── horizontal (inspector height) ──────────────────────────────
  hHandle.addEventListener('mousedown', (e: MouseEvent) => {
    e.preventDefault();
    hHandle.classList.add('dragging');
    document.body.classList.add('resizing');
    const startY = e.clientY;
    const startH = parseInt(getComputedStyle(root).getPropertyValue('--insp-h'), 10);

    function onMove(ev: MouseEvent) {
      // dragging up = larger inspector (bottom - cursor moves up)
      setInspH(startH - (ev.clientY - startY));
    }
    function onUp() {
      hHandle.classList.remove('dragging');
      document.body.classList.remove('resizing');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
}

// ── JWT Decoder ───────────────────────────────────────────────────────────────

function makeEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  classes: string[],
  textContent?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  el.className = classes.join(' ');
  if (textContent !== undefined) el.textContent = textContent;
  return el;
}

function buildJwtValueNodes(key: string, val: unknown): Node[] {
  const nodes: Node[] = [];
  const isTimestamp = (key === 'exp' || key === 'iat' || key === 'nbf') && typeof val === 'number';

  if (val === null) {
    nodes.push(makeEl('span', ['jwt-v', 'jwt-v-null'], 'null'));
  } else if (typeof val === 'boolean') {
    nodes.push(makeEl('span', ['jwt-v', 'jwt-v-bool'], String(val)));
  } else if (typeof val === 'number') {
    nodes.push(makeEl('span', ['jwt-v', 'jwt-v-num'], String(val)));
    if (isTimestamp) {
      nodes.push(makeEl('span', ['jwt-v-date'], `(${formatUnixTime(val)})`));
    }
    if (key === 'exp' && val * 1000 < Date.now()) {
      nodes.push(makeEl('span', ['jwt-expired'], '⚠ EXPIRED'));
    }
  } else if (typeof val === 'string') {
    nodes.push(makeEl('span', ['jwt-v'], `"${val}"`));
  } else {
    nodes.push(makeEl('span', ['jwt-v'], JSON.stringify(val)));
  }

  return nodes;
}

function buildJwtSection(title: string, obj: Record<string, unknown>): DocumentFragment {
  const frag = document.createDocumentFragment();

  frag.appendChild(makeEl('div', ['jwt-section-hdr'], title));

  for (const [k, v] of Object.entries(obj)) {
    const row = makeEl('div', ['jwt-kv']);
    row.appendChild(makeEl('span', ['jwt-k'], k));
    for (const node of buildJwtValueNodes(k, v)) {
      row.appendChild(node);
    }
    frag.appendChild(row);
  }

  return frag;
}

function buildJwtBody(jwt: string): HTMLElement {
  const body = makeEl('div', ['jwt-body']);

  try {
    const { header, payload, signaturePreview } = parseJwt(jwt);

    body.appendChild(buildJwtSection('Header', header));
    body.appendChild(buildJwtSection('Claims', payload));
    body.appendChild(makeEl('div', ['jwt-section-hdr'], 'Signature'));
    body.appendChild(makeEl('span', ['jwt-sig'], `${signaturePreview} (not verified)`));
  } catch (err) {
    body.appendChild(makeEl('span', ['jwt-err'], `Could not decode JWT: ${String(err)}`));
  }

  return body;
}

function initJwtObserver(appRoot: HTMLElement) {
  function processAll() {
    appRoot.querySelectorAll<HTMLElement>('.jwt-pending[data-jwt]').forEach((el) => {
      const jwt = el.getAttribute('data-jwt')!;
      el.removeAttribute('data-jwt');
      el.classList.remove('jwt-pending');
      el.appendChild(buildJwtBody(jwt));
    });
  }

  const observer = new MutationObserver(processAll);
  observer.observe(appRoot, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['data-jwt'],
  });

  // Process any JWTs already in the DOM at init time
  processAll();
}

// ── App init ──────────────────────────────────────────────────────────────────

const app = Elm.Main.init({ node: document.getElementById('app'), flags: null });

initResizeHandles();

function copyToClipboard(text: string): void {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text: string): void {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

const appRoot = document.getElementById('app');
if (appRoot) {
  initJwtObserver(appRoot);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'PANEL_EVENT') {
    app.ports.receiveEvent.send(message.payload);
    if (message.diagnosis) {
      app.ports.receiveDiagnosis.send(message.diagnosis);
    }
  }
});

chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
  if (state?.events) {
    state.events.forEach((event: unknown) => app.ports.receiveEvent.send(event));
  }
});

app.ports.exportJson?.subscribe(() => {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
    if (!state) return;
    const redacted = redactFlowState(state);
    const envelope: FlowExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      redacted: true,
      flow: redacted,
    };
    copyToClipboard(JSON.stringify(envelope, null, 2));
  });
});

app.ports.exportMarkdown?.subscribe(() => {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
    if (!state) return;
    const redacted = redactFlowState(state);
    const diagnosis = runDiagnosis(redacted.events);
    const md = renderFlowMarkdown(redacted, diagnosis);
    copyToClipboard(md);
  });
});

app.ports.submitImportPaste?.subscribe((text: string) => {
  try {
    const parsed = JSON.parse(text);
    const decoded = Schema.decodeUnknownSync(FlowExportSchema)(parsed);

    chrome.runtime.sendMessage({ type: 'CLEAR' });

    for (const event of decoded.flow.events) {
      app.ports.receiveEvent.send(event);
    }

    const diagnosis = runDiagnosis(decoded.flow.events);
    app.ports.receiveDiagnosis.send({
      ...diagnosis,
      annotatedEvents: Object.fromEntries(diagnosis.annotatedEvents),
    });

    app.ports.receiveImportMeta.send({
      flowId: decoded.flow.flowId,
      capturedAt: decoded.flow.capturedAt,
      redacted: decoded.redacted,
    });
  } catch (e) {
    app.ports.receiveImportError.send({
      message: e instanceof Error ? e.message : 'Invalid export format',
    });
  }
});

app.ports.copyToClipboard?.subscribe((text: string) => {
  copyToClipboard(text);
});

app.ports.clearFlow?.subscribe(() => {
  chrome.runtime.sendMessage({ type: 'CLEAR' });
});

const SNAPSHOTS_KEY = 'ping:auth-flow:snapshots';
const MAX_SNAPSHOTS = 5;

app.ports.saveSnapshot?.subscribe(() => {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
    if (!state) return;
    chrome.storage.local.get(SNAPSHOTS_KEY, (result) => {
      const existing: unknown[] = Array.isArray(result[SNAPSHOTS_KEY]) ? result[SNAPSHOTS_KEY] : [];
      const snapshot = {
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
        flowState: state,
      };
      const updated = [...existing, snapshot].slice(-MAX_SNAPSHOTS);
      chrome.storage.local.set({ [SNAPSHOTS_KEY]: updated });
    });
  });
});

app.ports.requestSnapshots?.subscribe(() => {
  chrome.storage.local.get(SNAPSHOTS_KEY, (result) => {
    const snapshots: unknown[] = Array.isArray(result[SNAPSHOTS_KEY]) ? result[SNAPSHOTS_KEY] : [];
    const metas = (
      snapshots as Array<{
        id: string;
        savedAt: string;
        flowState: { flowId?: string | null; events?: unknown[] };
      }>
    ).map((s) => ({
      id: s.id,
      savedAt: s.savedAt,
      flowId: s.flowState?.flowId ?? null,
      eventCount: s.flowState?.events?.length ?? 0,
    }));
    app.ports.receiveSnapshots.send(metas);
  });
});

app.ports.loadSnapshot?.subscribe((snapshotId: string) => {
  chrome.storage.local.get(SNAPSHOTS_KEY, (result) => {
    const snapshots = Array.isArray(result[SNAPSHOTS_KEY]) ? result[SNAPSHOTS_KEY] : [];
    const snapshot = snapshots.find((s: { id: string }) => s.id === snapshotId);
    if (!snapshot) return;

    chrome.runtime.sendMessage({ type: 'CLEAR' });
    const state = snapshot.flowState;

    for (const event of state.events) {
      app.ports.receiveEvent.send(event);
    }

    const diagnosis = runDiagnosis(state.events);
    app.ports.receiveDiagnosis.send({
      ...diagnosis,
      annotatedEvents: Object.fromEntries(diagnosis.annotatedEvents),
    });

    app.ports.receiveImportMeta.send({
      flowId: state.flowId ?? null,
      capturedAt: snapshot.savedAt,
      redacted: false,
    });
  });
});

app.ports.deleteSnapshot?.subscribe((snapshotId: string) => {
  chrome.storage.local.get(SNAPSHOTS_KEY, (result) => {
    const snapshots = Array.isArray(result[SNAPSHOTS_KEY]) ? result[SNAPSHOTS_KEY] : [];
    const updated = snapshots.filter((s: { id: string }) => s.id !== snapshotId);
    chrome.storage.local.set({ [SNAPSHOTS_KEY]: updated });
  });
});
