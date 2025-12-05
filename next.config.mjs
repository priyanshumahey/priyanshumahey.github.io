/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "api.microlink.io", // Microlink Image Preview
        },
      ],
    },
  };

export default nextConfig;
