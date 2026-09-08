import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1 produces a fully static `out/` (used by the GitHub Pages workflow).
 * BASE_PATH="/repo-name" when hosted under a sub-path (GitHub project pages).
 * On Vercel, leave both unset.
 */
const isExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(isExport ? { output: "export", trailingSlash: true } : {}),
  basePath,
  images: { unoptimized: isExport },
};

export default nextConfig;
