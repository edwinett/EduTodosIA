/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // El linting se ejecuta en CI aparte; no bloquea el build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
