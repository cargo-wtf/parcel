import { AST, parse, tag, VComponent, vNodeToString } from "./deps.ts";
import { htmlAttributes } from "./html.ts";
import { getHead, Head, head } from "./head.ts";
import { bodyAttributes } from "./body.ts";
import { Footer, footer, getFooter } from "./footer.ts";
import { findIslands, type Island } from "./islands.ts";

export const cleanup: Array<() => void> = [];

export interface Integration {
  getStyles(...args: any[]): string;
  getConfig(): any;
}

interface PageProps {
  component: JSX.Component;
  cssIntegration?: Integration;
  islands?: Record<string, JSX.Component>;
}

export function page(props: PageProps) {
  let islands: Island[] = [];

  const vNode = <VComponent<unknown>> AST.create(
    tag(props.component, null, []),
  );

  if (props.islands) {
    islands = findIslands(vNode, props.islands);
  }

  if (islands.length) {
    footer({
      script: [`<script type="module">import { launch } from "/main.js";
${
        islands.map((island) =>
          `import ${
            parse(island.path).name.replaceAll("-", "")
          } from "/island-${parse(island.path).name}.js";\n`
        ).join("")
      }
launch([${
        islands.map((island) => {
          return `{ class: "${island.class}", node: ${
            parse(island.path).name.replaceAll("-", "")
          }}`;
        }).join()
      }]);</script>`],
    });
  }

  if (props.cssIntegration) {
    head({ link: [props.cssIntegration?.getStyles()] });
  }

  return html({
    body: vNodeToString(vNode),
    head: getHead(),
    htmlAttributes: htmlAttributes(),
    bodyAttributes: bodyAttributes(),
    footer: getFooter(),
  });
}

interface HtmlProps {
  body: string;
  head?: Head;
  htmlAttributes?: string[];
  bodyAttributes?: string[];
  footer?: Footer;
}

function html(props: HtmlProps) {
  return `<!DOCTYPE html><html ${props.htmlAttributes?.join(" ")}><head>${
    props.head?.base || ""
  }<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${
    props.head?.meta?.join("") || ""
  }${props.head?.link?.join("") || ""}${props.head?.style?.join("") || ""}${
    props.head?.script?.join("") || ""
  }${props.head?.noscript?.join("") || ""}${
    props.head?.title || ""
  }</head><body ${props.bodyAttributes?.join(" ") || ""}>${props.body}${
    props.footer?.script?.join("") || ""
  }${props.footer?.noscript?.join("") || ""}</body></html>`;
}