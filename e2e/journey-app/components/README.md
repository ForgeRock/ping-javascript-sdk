# Journey App Components

This directory contains UI components for rendering different types of journey callbacks in the e2e test application. Each component follows a consistent pattern and handles the specific requirements of its callback type.

## Available Components

### Input Components

- **`attribute-input.ts`** - `AttributeInputCallback` - Handles string, number, and boolean attribute inputs with appropriate input types
- **`choice.ts`** - `ChoiceCallback` - Renders a select dropdown with available choices
- **`confirmation.ts`** - `ConfirmationCallback` - Creates radio buttons for confirmation options
- **`kba-create.ts`** - `KbaCreateCallback` - Two-field form for creating security questions and answers
- **`password.ts`** - `PasswordCallback` - Password input field
- **`text-input.ts`** - `NameCallback`, `TextInputCallback` - Generic text input component
- **`validated-password.ts`** - `ValidatedCreatePasswordCallback` - Password input with validation
- **`validated-username.ts`** - `ValidatedCreateUsernameCallback` - Username input with validation

### Output Components

- **`text-output.ts`** - `TextOutputCallback` - Displays text messages
- **`suspended-text-output.ts`** - `SuspendedTextOutputCallback` - Styled suspension message display

### Interaction Components

- **`redirect.ts`** - `RedirectCallback` - Button to trigger external redirects
- **`select-idp.ts`** - `SelectIdPCallback` - Radio buttons for identity provider selection
- **`terms-and-conditions.ts`** - `TermsAndConditionsCallback` - Terms display with acceptance checkbox

### Security Components

- **`recaptcha.ts`** - `ReCaptchaCallback` - reCAPTCHA challenge placeholder
- **`recaptcha-enterprise.ts`** - `ReCaptchaEnterpriseCallback` - reCAPTCHA Enterprise placeholder
- **`ping-protect-evaluation.ts`** - `PingOneProtectEvaluationCallback` - Risk assessment display
- **`ping-protect-initialize.ts`** - `PingOneProtectInitializeCallback` - Protection initialization

### Utility Components

- **`device-profile.ts`** - `DeviceProfileCallback` - Device profiling indicator
- **`hidden-value.ts`** - `HiddenValueCallback` - Hidden input field
- **`metadata.ts`** - `MetadataCallback` - Hidden metadata storage
- **`polling-wait.ts`** - `PollingWaitCallback` - Loading spinner with wait message

## Component Pattern

All components follow this consistent pattern:

```typescript
export default function componentName(
  journeyEl: HTMLDivElement,
  callback: CallbackType,
  idx: number,
) {
  // Create DOM elements
  // Set up event listeners
  // Append to journeyEl
}
```

### Parameters

- **`journeyEl`** - The container element to append the component to
- **`callback`** - The callback instance with data and methods
- **`idx`** - Index for generating unique IDs

### Usage Example

```typescript
import { choiceComponent } from './components/index.js';

// Render a choice callback
choiceComponent(containerDiv, choiceCallback, 0);
```

## Implementation Notes

- All components handle their own styling via inline CSS or style attributes
- Event listeners are set up to call appropriate callback methods
- Components generate unique IDs using the callback's input name or a fallback
- Error handling is implemented where appropriate
- Console logging is used for debugging and demonstration

## Component States

Some components like reCAPTCHA and PingOne Protect include simulation timeouts for demonstration purposes in the e2e testing environment. In production, these would integrate with actual third-party services.
