<script lang="ts">
  import { onMount } from 'svelte';
  import { parseHash, type Route } from './lib/router.js';
  import type { CoverageMatrix } from './lib/types.js';
  import Overview from './lib/Overview.svelte';
  import PackageDetail from './lib/PackageDetail.svelte';
  import ExportDetail from './lib/ExportDetail.svelte';

  let route: Route = $state(parseHash(window.location.hash));
  let matrix: CoverageMatrix | null = $state(null);
  let error: string | null = $state(null);

  $effect(() => {
    const onHashChange = () => {
      route = parseHash(window.location.hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  });

  onMount(async () => {
    try {
      const response = await fetch('./data/coverage-matrix.json');
      if (!response.ok) {
        error = `Failed to load: HTTP ${response.status}`;
        return;
      }
      matrix = await response.json();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
    }
  });
</script>

<main>
  <header>
    <h1><a href="#/">Coverage Matrix</a></h1>
    {#if matrix}
      <p class="meta">
        Generated {new Date(matrix.generatedAt).toLocaleString()} &middot; Source: {matrix.source}
      </p>
    {/if}
  </header>

  {#if error}
    <p class="error">Failed to load coverage data: {error}</p>
  {:else if !matrix}
    <p>Loading coverage data...</p>
  {:else if route.view === 'overview'}
    <Overview packages={matrix.packages} />
    <section class="methodology">
      <h2>How coverage is measured</h2>

      <h3>Unit Files</h3>
      <p>
        Vitest's V8 coverage provider tracks which source files have at least one
        statement executed during unit tests. This counts all <code>.ts</code> files
        in the package's <code>src/</code> directory — a file-level metric that
        shows how much of the internal implementation is tested, not just public exports.
      </p>

      <h3>Unit Exports</h3>
      <p>
        Each public export (function, class, constant) is matched to its source file.
        If V8 confirms the source file was executed during unit tests, the export is
        marked covered (<strong>runtime</strong>). If no V8 data exists, we fall back
        to static import tracing — checking whether any <code>.test.ts</code> file
        imports the export by name (<strong>static</strong>).
      </p>

      <h3>E2E %</h3>
      <p>
        Playwright's built-in <code>page.coverage</code> API uses Chrome DevTools
        Protocol to collect V8 function-level coverage from each e2e test. No
        instrumented builds or Vite plugins are needed — the browser itself tracks
        which functions executed at runtime.
      </p>
      <p>
        An export is marked e2e-covered when its source file has
        <strong>more than one function invoked</strong> during any e2e test. This
        filters out modules that are merely <em>loaded</em> by the bundler
        (module wrapper execution) without any of their functions being actually called.
      </p>
      <p>
        <strong>Limitation:</strong> For class-based exports, V8 reports constructor
        calls in the <em>calling</em> module's scope, not the defining module. This
        means callback classes instantiated via a factory pattern may show as uncovered
        even if they were used during the test. Top-level function exports
        (<code>journey()</code>, <code>oidc()</code>, <code>protect()</code>) have the
        highest accuracy.
      </p>

      <h3>Uncovered</h3>
      <p>
        Exports with neither unit nor e2e coverage from any source. Type-only exports
        are excluded from all runtime metrics.
      </p>
    </section>
  {:else if route.view === 'package'}
    <PackageDetail packages={matrix.packages} packageId={route.packageId} />
  {:else if route.view === 'module'}
    <ExportDetail packages={matrix.packages} packageId={route.packageId} moduleName={route.moduleName} />
  {/if}
</main>

<style>
  header {
    margin-bottom: 2rem;
  }
  header h1 a {
    color: inherit;
    text-decoration: none;
  }
  .meta {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }
  .error {
    color: var(--color-uncovered);
  }
  .methodology {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
    max-width: 720px;
  }
  .methodology h2 {
    font-size: 1.125rem;
    margin-bottom: 1.25rem;
  }
  .methodology h3 {
    font-size: 0.9375rem;
    margin-top: 1.25rem;
    margin-bottom: 0.375rem;
  }
  .methodology p {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }
  .methodology code {
    font-size: 0.75rem;
    background: var(--color-surface);
    padding: 0.125rem 0.3125rem;
    border-radius: 0.1875rem;
  }
  .methodology strong {
    color: var(--color-text);
  }
  .methodology em {
    font-style: italic;
  }
</style>
