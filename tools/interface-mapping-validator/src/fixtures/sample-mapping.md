# Interface Mapping: Legacy SDK → Ping SDK

## 0. Quick Reference

| Legacy Symbol | New Import                                                                              |
| ------------- | --------------------------------------------------------------------------------------- |
| `FRAuth`      | `import { journey } from '@forgerock/journey-client'` → factory returns `JourneyClient` |
| `Config`      | Removed — pass config to `journey()` / `oidc()` factory params                          |
| `FRStep`      | `import type { JourneyStep } from '@forgerock/journey-client/types'`                    |
| `HttpClient`  | Removed — use `fetch` + manual `Authorization` header                                   |

---

## 1. Package Mapping

| Legacy Import                                            | New Package                                                     | Purpose                          |
| -------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------- |
| `import { FRAuth } from '@forgerock/javascript-sdk'`     | `import { journey } from '@forgerock/journey-client'`           | Authentication tree/journey flow |
| `import { FRWebAuthn } from '@forgerock/javascript-sdk'` | `import { WebAuthn } from '@forgerock/journey-client/webauthn'` | WebAuthn integration             |

---

## 3. Authentication Flow

Some prose here that should not be parsed.

```typescript
const journeyClient = await journey({ config });
```

---

## 5. Callbacks

### Callback Type Mapping

| Legacy Import                                                  | New Import                                                           | Method Changes |
| -------------------------------------------------------------- | -------------------------------------------------------------------- | -------------- |
| `import { NameCallback } from '@forgerock/javascript-sdk'`     | `import { NameCallback } from '@forgerock/journey-client/types'`     | None           |
| `import { PasswordCallback } from '@forgerock/javascript-sdk'` | `import { PasswordCallback } from '@forgerock/journey-client/types'` | None           |
