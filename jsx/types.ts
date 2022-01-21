declare namespace JSX {
  type Element = {
    tag: string;
    [type: string]: unknown;
    elementId?: string;
    children: string[] | Element[];
  };

  interface IntrinsicElements {
    [key: string]: unknown;
  }

  /*
  type HtmlElementMap = {
    [K in keyof HTMLElementTagNameMap]: {
      [k: string]: unknown;
    };
  };

  type SvgElementMap = {
    [K in keyof SVGElementTagNameMap]: {
      [k: string]: unknown;
    };
  };
  */

  interface ComponentProps {
    children?: string[] | Element[];
    [type: string]: unknown;
  }

  interface Component {
    (props: ComponentProps): Element;
  }
}
