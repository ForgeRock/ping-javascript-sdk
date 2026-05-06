// Same usage but imports from the top-level 'effect' barrel instead of 'effect/Option'
// Tests whether the barrel import prevents tree-shaking vs the subpath
import { Option, pipe } from 'effect';

const result = pipe(
  Option.fromNullable(Math.random() > 0.5 ? 'hello' : null),
  Option.match({
    onNone: () => 'none',
    onSome: (v) => v.toUpperCase(),
  }),
);

console.log(result);
