<script lang="ts">
  import { onMount } from 'svelte';
  import { journey, createJourneyObject, callbackType } from '@forgerock/journey-client';
  import { WELLKNOWN_URL } from '$lib/config.js';

  import type { JourneyClient } from '@forgerock/journey-client';
  import type { Step } from '@forgerock/journey-client/types';

  let { data } = $props();

  // Reactive state — initialized from server data, updated client-side
  let stepPayload = $state<Step | null>(data?.stepPayload ?? null);
  let serverError = $state(data?.error ?? null);
  let client = $state<JourneyClient | null>(null);
  let submitting = $state(false);
  let success = $state(false);
  let failure = $state<string | null>(null);

  /**
   * On mount, initialize the journey client with real browser storage.
   * This is where the browser-only setup happens — safe because onMount
   * only runs in the browser after hydration.
   */
  onMount(async () => {
    try {
      client = await journey({
        config: {
          serverConfig: { wellknown: WELLKNOWN_URL },
        },
      });
    } catch (e) {
      serverError = {
        error: 'client_init_failed',
        message: e instanceof Error ? e.message : 'Failed to initialize client',
      };
    }
  });

  function getPrompt(cb: Step['callbacks'][number]): string {
    const prompt = cb.output?.find((o) => o.name === 'prompt');
    return prompt?.value ?? cb.type;
  }

  function isTextInput(cb: Step['callbacks'][number]): boolean {
    return cb.type === callbackType.NameCallback || cb.type === callbackType.TextInputCallback;
  }

  function isPassword(cb: Step['callbacks'][number]): boolean {
    return cb.type === callbackType.PasswordCallback;
  }

  /**
   * Submit the current step. Reconstitutes the step with methods via
   * createJourneyObject, sets input values, and calls client.next().
   */
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!client || !stepPayload) return;

    submitting = true;
    failure = null;

    const formData = new FormData(event.target as HTMLFormElement);
    const step = createJourneyObject(stepPayload);

    if ('callbacks' in step && step.callbacks) {
      for (const cb of step.callbacks) {
        const inputName = `callback_${cb.payload._id}`;
        const value = formData.get(inputName);
        if (value !== null) {
          cb.setInputValue(String(value));
        }
      }
    }

    try {
      const result = await client.next(step);

      if ('payload' in result && result.type === 'Step') {
        stepPayload = result.payload;
      } else if ('type' in result && result.type === 'LoginSuccess') {
        success = true;
        stepPayload = null;
      } else if ('type' in result && result.type === 'LoginFailure') {
        failure = 'message' in result ? String(result.message) : 'Authentication failed';
        const restart = await client.start({});
        if ('payload' in restart) {
          stepPayload = restart.payload;
        }
      } else if ('error' in result) {
        failure = result.message ?? 'Unknown error';
      }
    } catch (e) {
      failure = e instanceof Error ? e.message : 'Submission failed';
    } finally {
      submitting = false;
    }
  }
</script>

<h1>Journey Client SSR PoC</h1>

{#if serverError}
  <div class="error">
    <p><strong>Error:</strong> {serverError.message}</p>
    <p><em>This is expected if the AM mock API is not running on port 9443.</em></p>
  </div>
{:else if success}
  <div class="success">
    <h2>Journey complete!</h2>
    <p>Authentication succeeded. Now exchange for tokens via server-side PKCE:</p>
    <form method="POST" action="?/authorize">
      <button type="submit">Get Tokens (Server-Side PKCE)</button>
    </form>
  </div>
{:else if failure}
  <div class="error">
    <p>{failure}</p>
  </div>
{/if}

{#if stepPayload?.callbacks}
  <form onsubmit={handleSubmit}>
    <h2>{stepPayload.header ?? 'Sign In'}</h2>
    {#if stepPayload.description}
      <p>{stepPayload.description}</p>
    {/if}

    {#each stepPayload.callbacks as cb (cb._id)}
      {#if isTextInput(cb)}
        <label>
          {getPrompt(cb)}
          <input
            type="text"
            name={`callback_${cb._id}`}
            value={cb.input?.[0]?.value ?? ''}
            required
          />
        </label>
      {:else if isPassword(cb)}
        <label>
          {getPrompt(cb)}
          <input
            type="password"
            name={`callback_${cb._id}`}
            value=""
            required
          />
        </label>
      {:else}
        <p class="unsupported">Unsupported callback: {cb.type}</p>
      {/if}
    {/each}

    <button type="submit" disabled={submitting || !client}>
      {#if submitting}
        Submitting...
      {:else if !client}
        Initializing...
      {:else}
        Next
      {/if}
    </button>
  </form>
{:else if !serverError && !success}
  <p>Loading...</p>
{/if}

<style>
  label {
    display: block;
    margin-bottom: 1rem;
  }

  input {
    display: block;
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  button {
    padding: 0.5rem 1.5rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    padding: 1rem;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .success {
    padding: 1rem;
    background: #efe;
    border: 1px solid #cfc;
    border-radius: 4px;
  }

  .unsupported {
    color: #999;
    font-style: italic;
  }
</style>
