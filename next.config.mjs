/** @type {import('next').NextConfig} */
const extraImageHosts = [];
const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME?.trim();
if (imageHost) {
  const hostname = imageHost.replace(/^https?:\/\//, "").split("/")[0].trim();
  if (hostname) {
    extraImageHosts.push({ protocol: "https", hostname, pathname: "/**" });
  }
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "http", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "fastly.picsum.photos", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      ...extraImageHosts,
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
