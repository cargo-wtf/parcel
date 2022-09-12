import { parse, VComponent, VElement, VNode } from "./deps.ts";

export interface Island {
  id: string;
  path: string;
}

export function findIslands(
  vNode: VNode<unknown>,
  islands: Record<string, JSX.Component>,
): Island[] {
  const cache: Island[] = [];
  if (vNode?.type === "text") return [];

  if (vNode?.type === "element") {
    vNode.children?.forEach((child) => {
      cache.push(...findIslands(child, islands));
    });
    return cache;
  }

  if (vNode?.type === "component") {
    const island = isIsland(vNode, islands);
    if (island) {
      (<VElement<unknown>> vNode.ast).props.id = island.id;
      return [island];
    }
    return [...findIslands(vNode.ast, islands)];
  }

  return cache;
}

function isIsland(
  vComponent: VComponent<unknown>,
  islands: Record<string, JSX.Component>,
): Island | undefined {
  for (const key in islands) {
    if (islands[key] === vComponent.fn) {
      return {
        id: crypto.randomUUID().slice(-5),
        path: parse(key).name.replaceAll("$", ""),
      };
    }
  }
  return undefined;
}
