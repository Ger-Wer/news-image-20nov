import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Entry program: copy the pre-drawn image to the output directory.
// Deterministic: the same entry.png bytes are copied on every run.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(outDir, { recursive: true });
const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
if (!existsSync(src)) throw new Error("entry.png missing next to main.ts");
const dest = join(outDir, "entry.png");
copyFileSync(src, dest);
console.log("wrote", dest);
