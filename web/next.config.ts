import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep tracing inside web/ even if a lockfile exists higher up the tree.
  outputFileTracingRoot: path.resolve(process.cwd()),
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
