# Testing

## Testing Types

You can test types using vitest. It's important to note that testing types does not actually _run_ a test file.

When you test types, these are statically analyzed by the compiler.

Vitest defaults state that all files matching `*.test-d.ts` are considered type-tests

From the vitest docs:

```
Under the hood Vitest calls tsc or vue-tsc, depending on your config, and parses results. Vitest will also print out type errors in your source code, if it finds any. You can disable it with typecheck.ignoreSourceErrors config option.

Keep in mind that Vitest doesn't run these files, they are only statically analyzed by the compiler. Meaning, that if you use a dynamic name or test.each or test.for, the test name will not be evaluated - it will be displayed as is.
```
