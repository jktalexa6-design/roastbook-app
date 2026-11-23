/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Jika di-deploy di Vercel, biarkan default Next.js serverless/edge.
  // Jika di-build lokal untuk export static / Android, gunakan 'export'.
  output: process.env.VERCEL ? undefined : 'export',
  images: { unoptimized: true },
};

module.exports = nextConfig;
