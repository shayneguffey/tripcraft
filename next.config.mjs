/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Old share links -> new Pocket Guide route. Permanent = 308 so old
      // URLs shared over SMS/iMessage still work.
      { source: "/share/:token", destination: "/guide/:token", permanent: true },
    ];
  },
};

export default nextConfig;
