import { journey } from '@forgerock/journey-client';
import { callbackType } from '@forgerock/sdk-types';
import type { NameCallback, PasswordCallback } from '@forgerock/journey-client';

async function authenticateUser() {
  const client = await journey({
    config: {
      serverConfig: { baseUrl: 'https://your-am-instance.com' },
      realmPath: 'root',
      tree: 'Login',
    },
  });

  try {
    // Start the journey
    let step = await client.start();

    // Handle NameCallback
    if (step.getCallbacksOfType(callbackType.NameCallback).length > 0) {
      const nameCallback = step.getCallbackOfType<NameCallback>(callbackType.NameCallback);
      console.log('Prompt for username:', nameCallback.getPrompt());
      nameCallback.setName('demo'); // Set the username
      step = await client.next({ step: step.payload }); // Submit the step
    }

    // Handle PasswordCallback
    if (step.getCallbacksOfType(callbackType.PasswordCallback).length > 0) {
      const passwordCallback = step.getCallbackOfType<PasswordCallback>(
        callbackType.PasswordCallback,
      );
      console.log('Prompt for password:', passwordCallback.getPrompt());
      passwordCallback.setPassword('password'); // Set the password
      step = await client.next({ step: step.payload }); // Submit the step
    }

    // Check for success or failure
    if (step.type === 'LoginSuccess') {
      console.log('Login successful!', step.getSessionToken());
    } else if (step.type === 'LoginFailure') {
      console.error('Login failed:', step.getMessage());
    } else {
      console.log('Next step requires further interaction:', step);
      // Further logic to handle other callback types
    }
  } catch (error) {
    console.error('An error occurred during the authentication journey:', error);
  }
}

authenticateUser();
