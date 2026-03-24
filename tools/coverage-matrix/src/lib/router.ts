export type Route =
  | { view: 'overview' }
  | { view: 'package'; packageId: string }
  | { view: 'module'; packageId: string; moduleName: string };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');
  if (!path) return { view: 'overview' };

  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'package' && segments.length === 2) {
    return { view: 'package', packageId: decodeURIComponent(segments[1]) };
  }

  if (segments[0] === 'package' && segments.length >= 3) {
    return {
      view: 'module',
      packageId: decodeURIComponent(segments[1]),
      moduleName: decodeURIComponent(segments.slice(2).join('/')),
    };
  }

  return { view: 'overview' };
}

export function buildHref(route: Route): string {
  switch (route.view) {
    case 'overview':
      return '#/';
    case 'package':
      return `#/package/${encodeURIComponent(route.packageId)}`;
    case 'module':
      return `#/package/${encodeURIComponent(route.packageId)}/${encodeURIComponent(route.moduleName)}`;
  }
}
