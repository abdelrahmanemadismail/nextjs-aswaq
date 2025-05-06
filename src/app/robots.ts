// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth/signin', '/account/settings'],
    },
    sitemap: 'https://aswaq.online/sitemap.xml',
  };
}