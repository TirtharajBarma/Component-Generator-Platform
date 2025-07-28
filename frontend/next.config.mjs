/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Enable the new JSX transform
    reactRemoveProperties: false,
  },
  experimental: {
    // Ensure modern JSX transform is used
    esmExternals: true,
  },
};

export default nextConfig;
