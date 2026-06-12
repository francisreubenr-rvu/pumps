import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/pumps",
  images: {
    unoptimized: true,
  },
}

export default nextConfig
