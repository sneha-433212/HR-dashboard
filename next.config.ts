import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   typescript: {
//     ignoreBuildErrors: true, 
//   },
//   eslint: {
//     ignoreDuringBuilds: true, 
//   },
// };

// module.exports = nextConfig;