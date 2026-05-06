// Imports Option via the subpath: effect/Option
// Tests whether Rollup tree-shakes to only fromNullable + match
import * as Option from 'effect/Option';
import { pipe } from 'effect/Function';

const result = pipe(
  Option.fromNullable(Math.random() > 0.5 ? 'hello' : null),
  Option.match({
    onNone: () => 'none',
    onSome: (v) => v.toUpperCase(),
  }),
);

console.log(result);
