export interface GreetOptions {
  readonly prefix: string;
}

export const DEFAULT_NAME = 'World';

export function greet(name: string, options?: GreetOptions): string {
  const prefix = options?.prefix ?? 'Hello';
  return `${prefix}, ${name}!`;
}

export class Greeter {
  constructor(private readonly name: string) {}
  greet(): string {
    return `Hello, ${this.name}!`;
  }
}
