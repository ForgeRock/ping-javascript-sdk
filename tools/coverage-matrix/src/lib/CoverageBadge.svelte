<script lang="ts">
  let { percentage }: { percentage: number } = $props();

  const color = $derived(
    percentage > 80
      ? 'var(--color-covered)'
      : percentage > 40
        ? 'var(--color-partial)'
        : 'var(--color-uncovered)',
  );
</script>

<span class="badge" style:--badge-color={color}>
  {percentage}%
</span>

<style>
  .badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-bg);
    background: var(--badge-color);
  }
</style>
