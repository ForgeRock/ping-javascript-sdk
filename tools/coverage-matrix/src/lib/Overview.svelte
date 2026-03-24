<script lang="ts">
  import type { PackageEntry } from './types.js';
  import CoverageBadge from './CoverageBadge.svelte';

  let { packages }: { packages: readonly PackageEntry[] } = $props();

  type SortKey = 'name' | 'exportPaths' | 'unitPct' | 'e2ePct' | 'filePct' | 'uncovered';

  let sortKey: SortKey = $state('name');
  let sortAsc: boolean = $state(true);

  function unitPct(pkg: PackageEntry): number {
    return pkg.summary.totalExports > 0
      ? Math.round((pkg.summary.unitCovered / pkg.summary.totalExports) * 100)
      : 0;
  }

  function e2ePct(pkg: PackageEntry): number {
    return pkg.summary.totalExports > 0
      ? Math.round((pkg.summary.e2eCovered / pkg.summary.totalExports) * 100)
      : 0;
  }

  function filePct(pkg: PackageEntry): number {
    return pkg.summary.totalSourceFiles > 0
      ? Math.round((pkg.summary.unitTestedFiles / pkg.summary.totalSourceFiles) * 100)
      : 0;
  }

  function dirName(path: string): string {
    return path.split('/').filter(Boolean).at(-1) ?? path;
  }

  const sorted = $derived.by(() => {
    const list = [...packages];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'exportPaths':
          cmp = a.modules.length - b.modules.length;
          break;
        case 'unitPct':
          cmp = unitPct(a) - unitPct(b);
          break;
        case 'e2ePct':
          cmp = e2ePct(a) - e2ePct(b);
          break;
        case 'filePct':
          cmp = filePct(a) - filePct(b);
          break;
        case 'uncovered':
          cmp = a.summary.uncovered - b.summary.uncovered;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  });

  function toggleSort(key: SortKey): void {
    if (sortKey === key) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = true;
    }
  }

  function sortIndicator(key: SortKey): string {
    if (sortKey !== key) return '';
    return sortAsc ? ' ↑' : ' ↓';
  }
</script>

<section>
  <h2>Packages</h2>
  <table>
    <thead>
      <tr>
        <th>
          <button class="sort-btn" onclick={() => toggleSort('name')}>
            Package{sortIndicator('name')}
          </button>
        </th>
        <th>
          <button class="sort-btn" onclick={() => toggleSort('exportPaths')}>
            Export Paths{sortIndicator('exportPaths')}
          </button>
        </th>
        <th>
          <button class="sort-btn" onclick={() => toggleSort('filePct')}>
            Unit Files{sortIndicator('filePct')}
          </button>
        </th>
        <th>
          <button class="sort-btn" onclick={() => toggleSort('unitPct')}>
            Unit Exports{sortIndicator('unitPct')}
          </button>
        </th>
        <th>
          <button class="sort-btn" onclick={() => toggleSort('e2ePct')}>
            E2E %{sortIndicator('e2ePct')}
          </button>
        </th>
        <th>
          <button class="sort-btn" onclick={() => toggleSort('uncovered')}>
            Uncovered{sortIndicator('uncovered')}
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each sorted as pkg (pkg.path)}
        <tr>
          <td>
            <a href="#/package/{encodeURIComponent(dirName(pkg.path))}">{pkg.name}</a>
          </td>
          <td>{pkg.modules.length}</td>
          <td>
            <CoverageBadge percentage={filePct(pkg)} />
            <span class="file-count">{pkg.summary.unitTestedFiles}/{pkg.summary.totalSourceFiles}</span>
          </td>
          <td><CoverageBadge percentage={unitPct(pkg)} /></td>
          <td><CoverageBadge percentage={e2ePct(pkg)} /></td>
          <td class:high-uncovered={pkg.summary.uncovered > 0}>{pkg.summary.uncovered}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  h2 {
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .sort-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;
  }

  .sort-btn:hover {
    color: var(--color-text);
  }

  .file-count {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-left: 0.375rem;
  }

  .high-uncovered {
    color: var(--color-uncovered);
    font-weight: 600;
  }

</style>
