<script>
  let { children } = $props();
</script>

<main>
  {@render children()}
</main>

<style>
  main {
    max-width: 480px;
    margin: 2rem auto;
    font-family: system-ui, sans-serif;
  }
</style>
