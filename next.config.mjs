/** @type {import('next').NextConfig} */
const nextConfig = {
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  serverExternalPackages: ["pg", "@azure/app-configuration", "oracledb"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "app.hamming.ai",
      },
      {
        protocol: "https",
        hostname: "avatarx.blob.core.windows.net"
      }
    ],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // Add externals only for the client-side bundle
      config.externals = {
        sqlite3: "sqlite3",
        mysql2: "mysql2",
        mariasql: "mariasql",
        oracle: "oracle",
        oracledb: "oracledb",
        "strong-oracle": "strong-oracle",
        oracledb: "oracledb",
        pg: "pg",
        "pg-query-stream": "pg-query-stream",
        "@azure/app-configuration": "@azure/app-configuration",
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      fs: false, // Disable 'fs' for browser builds
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      util: false, // Prevents Next.js from bundling Node.js `util`
    };

    return config;
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
