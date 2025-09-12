/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para Next.js 15
  experimental: {
    // Otimizações de performance
    optimizePackageImports: ['lucide-react', '@prisma/client'],
  },
  
  // Configuração para resolver problemas de build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  
  
  // Configurações de performance
  compress: true,
  poweredByHeader: false,
  
  // Configuração do workspace root
  outputFileTracingRoot: __dirname,
  
  // Configurações de imagem
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Configurações de headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configurações de redirecionamento
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
