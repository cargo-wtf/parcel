import { type VElement, VType } from "./deps.ts";
import type { ChangeSet } from "./mod.ts";

export interface CreateElementPayload {
  parentVNode: VElement<Node>;
  vNode: VElement<Node>;
}

export interface AttachElementPayload {
  parentVNode: VElement<Node>;
  vNode: VElement<Node>;
}

export interface ReplaceElementPayload {
  vNode: VElement<Node>;
}

export interface UpdateElementPayload {
  parentVNode: VElement<Node>;
  node: Node;
  vNode: VElement<Node>;
}

export interface DeleteElementPayload {
  parentVNode: VElement<Node>;
  vNode: VElement<Node>;
}

export interface ElementChangeSet extends
  ChangeSet<
    | CreateElementPayload
    | AttachElementPayload
    | ReplaceElementPayload
    | UpdateElementPayload
    | DeleteElementPayload
  > {
  type: "element";
  action: "create" | "attach" | "replace" | "update" | "delete";
}

export function element(change: ElementChangeSet): void {
  // Create an new element in the dom
  if (change.action === "create") {
    return create(<CreateElementPayload> change.payload);
  }

  if (change.action === "attach") {
    return attach(<AttachElementPayload> change.payload);
  }

  if (change.action === "replace") {
    return replace(<ReplaceElementPayload> change.payload);
  }

  if (change.action === "update") {
    return update(<UpdateElementPayload> change.payload);
  }

  if (change.action === "delete") {
    return remove(<DeleteElementPayload> change.payload);
  }
  console.error(
    `Change action not supported: ${change.action}`,
    change.payload,
  );
}

function create(payload: CreateElementPayload): void {
  if (!payload.vNode && !payload.parentVNode.nodeRef) return;
  payload.vNode.nodeRef = createElement(
    payload.vNode,
    <Node> payload.parentVNode.nodeRef,
  );
}

function attach(payload: AttachElementPayload): void {
  if (payload.vNode.type === VType.ELEMENT && payload.vNode.nodeRef) {
    (<Node> payload.parentVNode.nodeRef)?.appendChild(payload.vNode.nodeRef);
  }
  // Run lifecycle "onMount" hooks associated with this element.
  payload.vNode.hooks?.onMount?.forEach((hook) => {
    const onDestroy = hook();
    if (typeof onDestroy === "function" && payload.vNode.hooks) {
      if (Array.isArray(payload.vNode.hooks.onDestroy)) {
        payload.vNode.hooks.onDestroy.push(onDestroy);
        return;
      }
      payload.vNode.hooks.onDestroy = [onDestroy];
    }
  });
}

function replace(payload: ReplaceElementPayload): void {
  if (payload.vNode.type === VType.ELEMENT) {
    const node = createElement(
      payload.vNode,
      <Node> (<Node> payload.vNode.nodeRef).parentNode,
    );

    payload.vNode.nodeRef?.parentNode?.replaceChild(
      node,
      payload.vNode.nodeRef,
    );

    payload.vNode.nodeRef = node;
  }
}

function update(
  payload: UpdateElementPayload,
): void {
  (<Node> payload.parentVNode.nodeRef).replaceChild(
    <Node> payload.vNode.nodeRef,
    payload.node,
  );
}

function remove(payload: DeleteElementPayload): void {
  (<Node> payload.parentVNode.nodeRef).removeChild(
    <Node> payload.vNode.nodeRef,
  );
  // Run lifecycle "onDestroy" hooks associated with this element.
  payload.vNode.hooks?.onDestroy?.forEach((hook) => {
    hook();
  });
}

function createElement(vNode: VElement<Node>, parentNode: Node): Node {
  return isSVG(vNode.tag, parentNode)
    ? document.createElementNS("http://www.w3.org/2000/svg", vNode.tag)
    : document.createElement(vNode.tag);
}

function isSVG(tag: string, parentNode: Node): boolean {
  if (
    tag === "svg" ||
    typeof (<SVGElement> parentNode).ownerSVGElement !==
      "undefined"
  ) {
    return true;
  }
  return false;
}
