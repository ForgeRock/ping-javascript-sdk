<script lang="ts">
  let { data } = $props();
</script>

<h1>OIDC Callback</h1>

{#if data.error}
  <div class="error">
    <h2>Error</h2>
    <p><strong>{data.error.error}:</strong> {data.error.message}</p>
    <a href="/">Back to login</a>
  </div>
{:else if data.tokens}
  <div class="success">
    <h2>Tokens received!</h2>
    <dl>
      <dt>Access Token</dt>
      <dd>{data.tokens.accessToken.slice(0, 20)}...</dd>
      <dt>ID Token</dt>
      <dd>{data.tokens.idToken.slice(0, 20)}...</dd>
      {#if data.tokens.refreshToken}
        <dt>Refresh Token</dt>
        <dd>{data.tokens.refreshToken.slice(0, 20)}...</dd>
      {/if}
    </dl>
    <a href="/">Back to login</a>
  </div>
{:else}
  <p>Processing...</p>
{/if}

<style>
  .error {
    padding: 1rem;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
  }

  .success {
    padding: 1rem;
    background: #efe;
    border: 1px solid #cfc;
    border-radius: 4px;
  }

  dt {
    font-weight: bold;
    margin-top: 0.5rem;
  }

  dd {
    font-family: monospace;
    margin-left: 0;
    color: #666;
  }

  a {
    display: inline-block;
    margin-top: 1rem;
    color: #0066cc;
  }
</style>
