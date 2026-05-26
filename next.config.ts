import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Matikan saat dev agar tidak ribet cache
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // config lainnya jika ada
};

export default withPWA(nextConfig);