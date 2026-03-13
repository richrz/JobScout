/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set to prevent auto-detection from picking up a stale/incorrect
  // outputFileTracingRoot (a Windows path from another project was leaking in
  // via node_modules and corrupting Turbopack's rootPath computation).
  outputFileTracingRoot: __dirname,
  // experimental: {
  //   typedRoutes: true,
  // },
};

module.exports = nextConfig;
