/* @jsx factory */

/// <reference lib="DOM" />
import "../jsx/types.ts";

interface Route {
  path: string;
  data: unknown;
}

const _routes: Route[] = [];

async function load(p: string): Promise<JSX.Element> {
  const c = await import(`/${p}.js`);
  return <JSX.Element> c[c];
}

async function resolve(path: string): Promise<JSX.Element> {
  const toResolve = _routes.find((route) => {
    console.log(route.path === path);
    return route.path === path;
  });
  if (toResolve) {
    return await load(toResolve.path);
  }
  throw new Error("No route found!");
}

function goto(path: string) {
  console.log(path);
  throw new Error("Not implemented yet!");
}

function routes(routes?: Route[]) {
  if (routes) {
    _routes.push(...routes);
  }
  return _routes;
}

export const Router = {
  resolve,
  goto,
  routes,
};
