/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
  
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dn9rqnozy.cloudinary.com', 
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
