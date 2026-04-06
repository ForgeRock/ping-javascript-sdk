<script lang="ts">
  import type { PackageEntry, ExportEntry, CoverageEntry } from './types.js';
  import { buildHref } from './router.js';

  let {
    packages,
    packageId,
    moduleName,
  }: {
    packages: readonly PackageEntry[];
    packageId: string;
    moduleName: string;
  } = $props();

  const pkg = $derived(packages.find((p) => p.path.endsWith(packageId)) ?? null);

  const mod = $derived(pkg?.modules.find((m) => m.name === moduleName) ?? null);

  function coverageLabel(entry: CoverageEntry | null): string {
    if (!entry) return 'Not tracked';
    return entry.covered ? 'Covered' : 'Not covered';
  }

  function coverageClass(entry: CoverageEntry | null): string {
    if (!entry) return 'na';
    return entry.covered ? 'covered' : 'uncovered';
  }

  function isType(exp: ExportEntry): boolean {
    return exp.kind === 'type';
  }

  const packageHref = $derived(buildHref({ view: 'package', packageId }));
</script>

{#if !pkg}
  <p class="error">Package not found: {packageId}</p>
{:else if !mod}
  <p class="error">Module not found: {moduleName}</p>
{:else}
  <nav class="breadcrumb">
    <a href="#/">Overview</a>
    <span class="sep">›</span>
    <a href={packageHref}>{pkg.name}</a>
    <span class="sep">›</span>
    <span>{mod.name}</span>
  </nav>

  <section class="module-header">
    <h2>{mod.name}</h2>
    <p class="path">{mod.path}</p>
    <p class="count">{mod.exports.length} exports</p>
  </section>

  <section class="exports">
    <h3>Exports</h3>
    <div class="cards">
      {#each mod.exports as exp (exp.name)}
        <div class="card" class:dimmed={isType(exp)}>
          <div class="card-header">
            <span class="export-name">{exp.name}</span>
            <span class="export-kind">{exp.kind}</span>
          </div>

          {#if isType(exp)}
            <p class="type-note">Type exports are not tracked for coverage.</p>
          {:else}
            <div class="coverage-grid">
              <div class="coverage-item">
                <span class="coverage-label">Unit</span>
                <span class="coverage-status {coverageClass(exp.coverage.unit)}">
                  {coverageLabel(exp.coverage.unit)}
                  {#if exp.coverage.unit?.covered}
                    <span class="source-badge source-{exp.coverage.unit.source}">{exp.coverage.unit.source}</span>
                  {/if}
                </span>
                {#if exp.coverage.unit?.testFiles && exp.coverage.unit.testFiles.length > 0}
                  <div class="file-list">
                    <p class="file-list-title">Test files:</p>
                    <ul>
                      {#each exp.coverage.unit.testFiles as file (file)}
                        <li><code>{file}</code></li>
                      {/each}
                    </ul>
                  </div>
                {/if}
                {#if exp.coverage.unit?.testSuites && exp.coverage.unit.testSuites.length > 0}
                  <div class="file-list">
                    <p class="file-list-title">Suites:</p>
                    <ul>
                      {#each exp.coverage.unit.testSuites as suite (suite)}
                        <li><code>{suite}</code></li>
                      {/each}
                    </ul>
                  </div>
                {/if}
              </div>

              <div class="coverage-item">
                <span class="coverage-label">E2E</span>
                <span class="coverage-status {coverageClass(exp.coverage.e2e)}">
                  {coverageLabel(exp.coverage.e2e)}
                  {#if exp.coverage.e2e?.covered}
                    <span class="source-badge source-{exp.coverage.e2e.source}">{exp.coverage.e2e.source}</span>
                  {/if}
                </span>
                {#if exp.coverage.e2e?.testFiles && exp.coverage.e2e.testFiles.length > 0}
                  <div class="file-list">
                    <p class="file-list-title">Test files:</p>
                    <ul>
                      {#each exp.coverage.e2e.testFiles as file (file)}
                        <li><code>{file}</code></li>
                      {/each}
                    </ul>
                  </div>
                {/if}
                {#if exp.coverage.e2e?.testSuites && exp.coverage.e2e.testSuites.length > 0}
                  <div class="file-list">
                    <p class="file-list-title">Suites:</p>
                    <ul>
                      {#each exp.coverage.e2e.testSuites as suite (suite)}
                        <li><code>{suite}</code></li>
                      {/each}
                    </ul>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
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

  .module-header {
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
    font-family: monospace;
    margin-bottom: 0.25rem;
  }

  .count {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
  }

  .card {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1rem;
    background: var(--color-surface);
  }

  .card.dimmed {
    opacity: 0.6;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .export-name {
    font-weight: 600;
    font-family: monospace;
    font-size: 0.9375rem;
  }

  .export-kind {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-family: monospace;
    background: var(--color-bg);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
  }

  .type-note {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .coverage-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .coverage-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .coverage-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
  }

  .coverage-status {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .covered {
    color: var(--color-covered);
  }

  .uncovered {
    color: var(--color-uncovered);
  }

  .na {
    color: var(--color-text-muted);
  }

  .file-list {
    margin-top: 0.375rem;
  }

  .file-list-title {
    font-size: 0.6875rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .file-list ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .file-list code {
    font-size: 0.6875rem;
    color: var(--color-text-muted);
    word-break: break-all;
  }

  .source-badge {
    display: inline-block;
    font-size: 0.625rem;
    font-weight: 500;
    padding: 0.0625rem 0.3125rem;
    border-radius: 0.25rem;
    margin-left: 0.375rem;
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
