/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Aumentar limite para 10MB
    },
  },
};

module.exports = nextConfig;
