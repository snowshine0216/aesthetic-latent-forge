import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  transpilePackages: ['@repo/ui', '@repo/supabase', '@repo/ai-utils'],
}

export default nextConfig
