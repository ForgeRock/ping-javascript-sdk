<script lang="ts">
  let { covered, total, label = '' }: { covered: number; total: number; label?: string } = $props();

  const pct = $derived(total > 0 ? Math.round((covered / total) * 100) : 0);
  const color = $derived(
    pct > 80
      ? 'var(--color-covered)'
      : pct > 40
        ? 'var(--color-partial)'
        : 'var(--color-uncovered)',
  );
</script>

<div class="bar-container">
  {#if label}
    <span class="label">{label}</span>
  {/if}
  <div class="bar">
    <div class="fill" style:width="{pct}%" style:background={color}></div>
  </div>
  <span class="value">{covered}/{total}</span>
</div>

<style>
  .bar-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    min-width: 3rem;
  }
  .bar {
    flex: 1;
    height: 0.5rem;
    background: var(--color-surface);
    border-radius: 0.25rem;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    border-radius: 0.25rem;
    transition: width 0.3s ease;
  }
  .value {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    min-width: 3rem;
    text-align: right;
  }
</style>
