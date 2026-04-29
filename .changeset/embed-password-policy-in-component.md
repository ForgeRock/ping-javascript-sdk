---
'@forgerock/davinci-client': minor
---

Add `ValidatedPasswordCollector` alongside `PasswordCollector`. The reducer routes by `field.type`: `PASSWORD` always produces a `PasswordCollector`, `PASSWORD_VERIFY` always produces a `ValidatedPasswordCollector`. `ValidatedPasswordCollector.output.passwordPolicy` carries the embedded policy from the field; when the field has no policy, an empty policy object is emitted and the validator treats it as no rules. Consumers can render password requirements directly from the collector.

Both collectors now expose a `verify: boolean` on `output` (defaults to `false`), propagated from the field when the server sends `verify: true`.

`store.validate(collector)` accepts a `ValidatedPasswordCollector` and returns a validator that enforces the policy's length, unique-character, repeated-character, and per-charset minimum rules. Passing a `PasswordCollector` returns the standard "cannot be validated" error.
