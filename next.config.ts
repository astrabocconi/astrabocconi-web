import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "jsuzhbspinevkzmhibop.supabase.co",
      pathname: "/storage/v1/object/public/**",
      search: "",
    }],
    // Nothing on the site renders wider than a ~320px card or the 119px logo,
    // so the default 16 widths only bloated every srcset (144KB of the home
    // page HTML) and split the optimiser cache into variants that are each
    // transformed cold on first request. Seven widths cover 1x to 3x screens.
    imageSizes: [128, 256, 384],
    deviceSizes: [640, 828, 1080, 1920],
  },
};

export default nextConfig;
