import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: false,
  /**
   * Development-only: allows the dev server to be reached from the host that
   * fronts this workspace. It has no effect on a production build.
   */
  allowedDevOrigins: ['194.163.151.162'],
};

export default nextConfig;
