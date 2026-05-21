/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    trailingSlash: true,
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
};

export default nextConfig;
