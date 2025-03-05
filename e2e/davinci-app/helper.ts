export function dotToCamelCase(str: string) {
  return str
    .split('.')
    .map((part: string, index: number) =>
      index === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join('');
}
