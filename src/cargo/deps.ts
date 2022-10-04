export {
  dirname,
  join,
  parse,
} from "https://deno.land/std@0.153.0/path/mod.ts";
export { walk } from "https://deno.land/std@0.153.0/fs/mod.ts";
export { parse as parseArgs } from "https://deno.land/std@0.153.0/flags/mod.ts";
export { vNodeToString } from "../platform/server/mod.ts";
export {
  AST,
  tag,
  type VComponent,
  type VElement,
  type VNode,
} from "../mod.ts";
import * as esbuildNative from "https://deno.land/x/esbuild@v0.15.6/mod.js";
import * as esbuildWasm from "https://deno.land/x/esbuild@v0.15.6/wasm.js";
export { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts";

const esbuild = Deno.run === undefined ? esbuildWasm : esbuildNative;

export { esbuild };