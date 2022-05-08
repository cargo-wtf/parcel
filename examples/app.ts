import { bootstrap } from "https://deno.land/x/cargo@0.1.31/mod.ts";

import { StaticPage } from "./deps.ts";
import { Root } from "./deps.ts";

await StaticPage(
  "pages/index.tsx",
  Root,
);

StaticPage(
  "pages/home.tsx",
  Root,
);

(await bootstrap()).run();
