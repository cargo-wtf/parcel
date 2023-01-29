import { dirname, join, parseArgs, toFileUrl, walk } from "../deps.ts";
import { createManifestDirectroy } from "./manifest.ts";

interface FileImport {
  id: string;
  path: string;
  fileName: string;
}

interface Page {
  page: FileImport;
  layouts: string[];
}

interface Manifest {
  pages: Page[];
  layouts: FileImport[];
}

async function command(
  args: string[],
): Promise<string> {
  const options = parseArgs(args);
  const basePath = options.path || "pages";

  try {
    const data = await scan(basePath);

    const pages = data.pages.map((page) => {
      const layouts = data.layouts.filter((layout) => {
        return page.path.startsWith(layout.path);
      }).map((layout) => {
        return layout.id;
      });
      return {
        page,
        layouts,
      };
    });

    const manifest = { pages, layouts: data.layouts };

    await write(basePath, manifest);
    return `Manifest ".pages.ts" sucessfully created!`;
  } catch (e) {
    console.log(`Error occured: ${e.message}`);
    return `Not able to load files from the "${basePath}" directory.`;
  }
}

/**
 * Scan a folder for page and layout files
 */
async function scan(
  basePath: string,
): Promise<{ pages: FileImport[]; layouts: FileImport[] }> {
  const pages: FileImport[] = [];
  const layouts: FileImport[] = [];
  let layoutIndex = 0;
  let pageIndex = 0;

  for await (
    const entry of walk(basePath, {
      match: [/(page\.tsx)$/, /(layout\.tsx)$/],
    })
  ) {
    if (/\/(layout\.tsx)$/.exec(entry.path)?.length) {
      layouts.push({
        id: `L${layoutIndex}`,
        path: dirname(entry.path),
        fileName: entry.name,
      });
      layoutIndex++;
    }
    if (/\/(page\.tsx)$/.exec(entry.path)?.length) {
      pages.push({
        id: `P${pageIndex}`,
        path: dirname(entry.path),
        fileName: entry.name,
      });
      pageIndex++;
    }
  }

  return {
    pages: sortRoutes(pages, basePath),
    layouts: sortRoutes(layouts, basePath),
  };
}

async function write(basePath: string, manifest: Manifest) {
  const content =
    `// This file is automatically generated by the Cargo Parcel "pages" command for Cargo Load. Do not edit it manually.

// Page imports
${imports(manifest.pages.map((page) => page.page))}

// Layout imports
${imports(manifest.layouts)}

export default {
  ${exports(basePath, manifest.pages)}
};
`;

  await createManifestDirectroy();
  await Deno.writeTextFile(join(".manifest", ".pages.ts"), content);
}

function imports(pages: FileImport[]): string {
  return pages.map((route) => {
    return `import * as ${route.id} from "../${route.path}/${route.fileName}";`;
  }).join("\n");
}

function exports(path: string, pages: Page[]): string {
  return pages.map((page) => {
    return `"${page.page.path.replace(path, "") || "/"}": {
    page: ${page.page.id},
    layouts: [${page.layouts.join()}],
  },`;
  }).join("\n  ");
}

export function pages() {
  return {
    names: ["pa", "pages"],
    description: `Generate ".pages.ts" file`,
    command,
  };
}

function sortRoutes(imports: FileImport[], basePath: string): FileImport[] {
  return imports.sort((a, b) => {
    const al = a.path.toLowerCase();
    const bl = b.path.toLowerCase();

    if (al === basePath) {
      return -1;
    }

    if (al > bl) {
      return -1;
    } else if (al == bl) {
      return 0;
    }
    return 1;
  });
}
