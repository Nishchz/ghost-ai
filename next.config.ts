import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep these packages out of the Next.js bundle so they can be
  // required/imported at runtime on the server. @prisma/extension-accelerate
  // is an ESM package; pg contains native addons — both must stay external.
  serverExternalPackages: [
    "@prisma/extension-accelerate",
    "@prisma/adapter-pg",
    "@prisma/client",
    "pg",
  ],
};

export default nextConfig;
