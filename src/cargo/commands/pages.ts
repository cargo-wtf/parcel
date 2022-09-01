import { dirname, parse, parseArgs, walk } from "../deps.ts";

interface Page {
  path: string;
  name: string;
  fileName: string;
}

async function command(
  args: string[],
): Promise<string> {
  const options = parseArgs(args);
  const path = options.path || "pages";
  const pages = await scan(path);

  await write(path, pages);

  return `File ".pages.ts" sucessfully created!`;
}

async function scan(path: string): Promise<Page[]> {
  const cache: Page[] = [];

  try {
    for await (
      const entry of walk(path, {
        includeDirs: false,
        match: [/(.+\.tsx)$/],
      })
    ) {
      cache.push({
        path: dirname(entry.path),
        name: parse(entry.name).name,
        fileName: entry.name,
      });
    }
  } catch (e) {
    console.log(`Not able to load files from the "${path}" directory.`);
    console.log(`Error occured: ${e.message}`);
  }

  return cache;
}

async function write(path: string, pages: Page[]) {
  const content =
    `// This file is automatically generated by the Cargo Parcel "pages" command. Do not edit it manually.
    
${imports(pages)}

export const pages = {
  ${exports(path, pages)}
}`;

  await Deno.writeTextFile(".pages.ts", content);
}

function imports(pages: Page[]): string {
  return pages.map((route, index) => {
    return `import * as P${index} from "./${route.path}/${route.fileName}";`;
  }).join("\n");
}

function exports(path: string, pages: Page[]): string {
  return pages.map((route, index) => {
    return `"${route.path.replace(path, "")}/${route.name}": P${index},`;
  }).join("\n  ");
}

export function pages() {
  return {
    names: ["pa", "pages"],
    description: `Generate ".pages.ts" file`,
    task: command,
  };
}
