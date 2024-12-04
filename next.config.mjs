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

    return config;
  },
};

export default nextConfig;
