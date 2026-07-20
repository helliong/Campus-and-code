import type { NextConfig } from "next";

const remoteImagePatterns: {
  protocol: "http" | "https";
  hostname: string;
  port: string;
  pathname: string;
}[] = [];

const s3PublicUrl = process.env.S3_PUBLIC_URL?.trim();
if (s3PublicUrl) {
  try {
    const url = new URL(s3PublicUrl);
    remoteImagePatterns.push({
      protocol: url.protocol === "http:" ? "http" : "https",
      hostname: url.hostname,
      port: url.port,
      pathname: `${url.pathname.replace(/\/$/, "")}/**`,
    });
  } catch {
    // Некорректный S3_PUBLIC_URL будет обработан в коде загрузки файлов.
  }
}

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: remoteImagePatterns,
  },
};

export default nextConfig;
