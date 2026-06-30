<script lang="ts">
  import type { PackageEntry, ModuleEntry, ExportEntry, CoverageEntry } from './types.js';
  import CoverageBar from './CoverageBar.svelte';
  import { buildHref } from './router.js';

  let {
    packages,
    packageId,
  }: {
    packages: readonly PackageEntry[];
    packageId: string;
  } = $props();

  const pkg = $derived(packages.find((p) => p.path.endsWith(packageId)) ?? null);

  function coverageIcon(entry: CoverageEntry | null): string {
    if (!entry) return '–';
    return entry.covered ? '✓' : '✗';
  }

  function coverageClass(entry: CoverageEntry | null): string {
    if (!entry) return 'na';
    return entry.covered ? 'covered' : 'uncovered';
  }

  function sourceLabel(entry: CoverageEntry | null): string | null {
    if (!entry || !entry.covered) return null;
    return entry.source === 'runtime' ? 'runtime' : 'static';
  }

  function isType(exp: ExportEntry): boolean {
    return exp.kind === 'type';
  }

  function moduleHref(mod: ModuleEntry): string {
    return buildHref({ view: 'module', packageId, moduleName: mod.name });
  }
</script>

{#if !pkg}
  <p class="error">Package not found: {packageId}</p>
{:else}
  <nav class="breadcrumb">
    <a href="#/">Overview</a>
    <span class="sep">›</span>
    <span>{pkg.name}</span>
  </nav>

  <section class="package-header">
    <h2>{pkg.name}</h2>
    <p class="path">{pkg.path}</p>

    <div class="summary-bars">
      <CoverageBar
        covered={pkg.summary.unitCovered}
        total={pkg.summary.totalExports}
        label="Unit"
      />
      <CoverageBar
        covered={pkg.summary.e2eCovered}
        total={pkg.summary.totalExports}
        label="E2E"
      />
    </div>

    <dl class="summary-stats">
      <div>
        <dt>Total Exports</dt>
        <dd>{pkg.summary.totalExports}</dd>
      </div>
      <div>
        <dt>Unit Covered</dt>
        <dd>{pkg.summary.unitCovered}</dd>
      </div>
      <div>
        <dt>E2E Covered</dt>
        <dd>{pkg.summary.e2eCovered}</dd>
      </div>
      <div>
        <dt>Uncovered</dt>
        <dd class:high={pkg.summary.uncovered > 0}>{pkg.summary.uncovered}</dd>
      </div>
    </dl>
  </section>

  <section class="modules">
    <h3>Modules</h3>
    {#each pkg.modules as mod (mod.name)}
      <details open>
        <summary>
          <a href={moduleHref(mod)}>{mod.name}</a>
          <span class="module-path">{mod.path}</span>
          <span class="export-count">{mod.exports.length} exports</span>
        </summary>

        <table>
          <thead>
            <tr>
              <th>Export</th>
              <th>Kind</th>
              <th>Unit</th>
              <th>E2E</th>
              <th>Type Test</th>
            </tr>
          </thead>
          <tbody>
            {#each mod.exports as exp (exp.name)}
              <tr class:dimmed={isType(exp)}>
                <td>
                  {#if !isType(exp)}
                    <a href={moduleHref(mod)}>{exp.name}</a>
                  {:else}
                    {exp.name}
                  {/if}
                </td>
                <td class="kind">{exp.kind}</td>
                {#if isType(exp)}
                  <td class="na">–</td>
                  <td class="na">–</td>
                  <td class={coverageClass(exp.coverage.typeTest ?? null)}>
                    {coverageIcon(exp.coverage.typeTest ?? null)}
                  </td>
                {:else}
                  <td class={coverageClass(exp.coverage.unit ?? null)}>
                    {coverageIcon(exp.coverage.unit ?? null)}
                    {#if sourceLabel(exp.coverage.unit ?? null)}
                      <span class="source-badge source-{sourceLabel(exp.coverage.unit ?? null)}">{sourceLabel(exp.coverage.unit ?? null)}</span>
                    {/if}
                  </td>
                  <td class={coverageClass(exp.coverage.e2e ?? null)}>
                    {coverageIcon(exp.coverage.e2e ?? null)}
                    {#if sourceLabel(exp.coverage.e2e ?? null)}
                      <span class="source-badge source-{sourceLabel(exp.coverage.e2e ?? null)}">{sourceLabel(exp.coverage.e2e ?? null)}</span>
                    {/if}
                  </td>
                  <td class="na">–</td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </details>
    {/each}
  </section>
{/if}

<style>
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .sep {
    color: var(--color-border);
  }

  .package-header {
    margin-bottom: 2rem;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }

  h3 {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }

  .path {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 1rem;
    font-family: monospace;
  }

  .summary-bars {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    max-width: 400px;
  }

  .summary-stats {
    display: flex;
    gap: 2rem;
  }

  .summary-stats div {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  dt {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  dd {
    font-size: 1.125rem;
    font-weight: 600;
  }

  dd.high {
    color: var(--color-uncovered);
  }

  .modules {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  details {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: var(--color-surface);
    cursor: pointer;
    list-style: none;
    user-select: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::before {
    content: '▶';
    font-size: 0.625rem;
    color: var(--color-text-muted);
    transition: transform 0.2s ease;
  }

  details[open] summary::before {
    transform: rotate(90deg);
  }

  .module-path {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-family: monospace;
    flex: 1;
  }

  .export-count {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .dimmed {
    opacity: 0.5;
  }

  .kind {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-family: monospace;
  }

  .covered {
    color: var(--color-covered);
    font-weight: 600;
  }

  .uncovered {
    color: var(--color-uncovered);
    font-weight: 600;
  }

  .na {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .source-badge {
    display: inline-block;
    font-size: 0.625rem;
    font-weight: 500;
    padding: 0.0625rem 0.3125rem;
    border-radius: 0.25rem;
    margin-left: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    vertical-align: middle;
  }

  .source-runtime {
    background: #d1fae5;
    color: #065f46;
  }

  .source-static {
    background: #e0e7ff;
    color: #3730a3;
  }

  .error {
    color: var(--color-uncovered);
  }
</style>
