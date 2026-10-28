import type { NextConfig } from "next";
import path from "node:path";

// `STATIC_EXPORT=1 npm run build` writes a plain static site to out/ for offline demos.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // Keep tracing inside web/ even if a lockfile exists higher up the tree.
  outputFileTracingRoot: path.resolve(process.cwd()),
  // Cache Components / PPR cannot be combined with output: "export".
  ...(staticExport
    ? { output: "export", trailingSlash: true, distDir: ".next-export" }
    : { cacheComponents: true, partialPrefetching: true }),
};

export default nextConfig;
