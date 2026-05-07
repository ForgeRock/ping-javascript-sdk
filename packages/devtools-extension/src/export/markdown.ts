import type { AuthEvent, FlowState } from '@forgerock/devtools-types';
import type { DiagnosisResult, FlowIssue } from '../background/diagnosis-engine.js';

function formatRelativeTime(timestamp: number, baseTimestamp: number): string {
  return `+${Math.round(timestamp - baseTimestamp)}ms`;
}

function eventStatus(event: AuthEvent): string {
  switch (event.data._tag) {
    case 'network':
      return String(event.data.status);
    case 'sdk':
      return event.data.nodeStatus;
    case 'journey':
      return event.data.stepType;
    case 'oidc':
      return event.data.status;
    default:
      return '';
  }
}

function eventDetail(event: AuthEvent): string {
  switch (event.data._tag) {
    case 'network': {
      const path = extractPath(event.data.url);
      return `${event.data.method} ${path}`;
    }
    case 'sdk':
      return event.data.nodeName ?? '';
    case 'journey':
      return event.data.stage ?? '';
    case 'oidc':
      return event.data.phase;
    case 'session':
      return event.data.key;
    default:
      return '';
  }
}

function extractPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function renderIssue(issue: FlowIssue): string {
  const severity = issue.severity.toUpperCase();
  const steps = issue.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n');
  return `- **[${severity}] ${issue.title}** — ${issue.description}\n${steps}`;
}

export function renderFlowMarkdown(flow: FlowState, diagnosis: DiagnosisResult | null): string {
  const lines: string[] = [];

  const flowIdPrefix = flow.flowId ? flow.flowId.slice(0, 8) : 'unknown';
  const health = diagnosis?.flowHealth?.toUpperCase() ?? 'HEALTHY';
  lines.push(`## Flow: ${flowIdPrefix} — ${health}`);
  lines.push('');
  const eventCount = flow.events.length;
  const errorCount = flow.summary.errorCount;
  const durationSec = (flow.summary.duration / 1000).toFixed(1);
  lines.push(
    `Captured: ${flow.capturedAt} | ${eventCount} events | ${errorCount} errors | ${durationSec}s duration`,
  );

  if (diagnosis && diagnosis.flowHealth !== 'healthy' && diagnosis.issues.length > 0) {
    lines.push('');
    lines.push('### Diagnosis');
    lines.push('');
    for (const issue of diagnosis.issues) {
      lines.push(renderIssue(issue));
      lines.push('');
    }
  }

  lines.push('');
  lines.push('### Events');
  lines.push('');
  lines.push('| # | Time | Type | Status | Detail |');
  lines.push('|---|------|------|--------|--------|');

  const baseTimestamp = flow.events.length > 0 ? flow.events[0].timestamp : 0;
  flow.events.forEach((event, index) => {
    const time = formatRelativeTime(event.timestamp, baseTimestamp);
    const status = eventStatus(event);
    const detail = eventDetail(event);
    lines.push(`| ${index + 1} | ${time} | ${event.type} | ${status} | ${detail} |`);
  });

  lines.push('');
  return lines.join('\n');
}
