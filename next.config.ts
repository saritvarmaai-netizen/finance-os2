import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    '.space.z.ai',
    'preview-chat-664ff539-1185-4ef1-add6-fbba4468f1b9.space.z.ai',
  ],
};

export default nextConfig;
