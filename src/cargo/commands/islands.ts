import { join, parseArgs, walk } from "../deps.ts";
import { createManifestDirectroy } from "./manifest.ts";

type Island = [string, string];

async function command(args: string[]) {
  const options = parseArgs(args);

  try {
    const cache: Island[] = [];
    let i = 0;

    for await (
      const entry of walk(options.path || "src", {
        includeDirs: false,
        match: [/(.+\$\.tsx)$/],
      })
    ) {
      cache.push([entry.path, `$I${i}`]);
      i++;
    }
    return await write(cache);
  } catch (e) {
    console.error(e.message);
    return 'Error occured while creating ".islands.ts" manifest.';
  }
}

async function write(islands: Island[]) {
  const content =
    `// This file is automatically generated by the Cargo Parcel "islands" command for Cargo Load. Do not edit it manually.
${imports(islands)}
${exports(islands)}`;

  await createManifestDirectroy();
  await Deno.writeTextFile(join(".manifest", ".islands.ts"), content);

  return `Manifest ".islands.ts" sucessfully created!`;
}

function imports(islands: Island[]) {
  return islands.map((island) =>
    `import ${island[1]} from "../${island[0]}";\n`
  )
    .join("");
}

function exports(islands: Island[]) {
  return `export default {
${islands.map((island) => `  "${island[0]}": ${island[1]},\n`).join("")}}`;
}

export function islands() {
  return {
    names: ["i", "islands"],
    description: 'Generate ".islands.ts" file',
    command,
  };
}