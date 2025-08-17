/** @type {import('next').NextConfig} */
const nextConfig = {
  // 优化chunk加载
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      // 设置chunk加载超时时间
      config.output.chunkLoadTimeout = 60000; // 60秒
      
      // 优化chunk分割
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
            maxSize: 250000, // 250KB
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            maxSize: 250000, // 250KB
          },
        },
      };
    }
    
    return config;
  },
  
  // 优化图片配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'wweiaejnhpdimbwncvxv.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // 添加构建ID来避免缓存问题
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  // URL参数规范化配置
  async redirects() {
    return [
      // 处理参数页面的规范化重定向 - 搜索参数
      {
        source: '/:path*',
        has: [
          {
            type: 'query',
            key: 'search',
          }
        ],
        destination: '/:path*',
        permanent: true,
      },
      // 处理参数页面的规范化重定向 - 标签参数
      {
        source: '/:path*',
        has: [
          {
            type: 'query',
            key: 'tab',
          }
        ],
        destination: '/:path*',
        permanent: true,
      }
    ];
  },
}

module.exports = nextConfig 