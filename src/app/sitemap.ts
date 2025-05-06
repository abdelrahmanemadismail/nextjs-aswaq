import { MetadataRoute } from 'next';
// import { Languages } from '@/constants/enums';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aswaq.online';
  
  // Define your main routes
  const routes = [
    '',
    'about',
    'contact',
    'terms',
    'privacy',
  ];

  // Generate sitemap entries for main routes in each language
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  // Add entries for English
  routes.forEach(route => {
    sitemapEntries.push({
      url: `${baseUrl}/en${route ? `/${route}` : ''}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1.0 : 0.8,
    });
  });
  
  // Add entries for Arabic
  routes.forEach(route => {
    sitemapEntries.push({
      url: `${baseUrl}/ar${route ? `/${route}` : ''}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1.0 : 0.8,
    });
  });
  
  // You can add dynamic routes from your database here
  // For example, if you have product pages:
  /*
  const products = await getProducts();
  products.forEach(product => {
    Languages.forEach(lang => {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}/product/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  });
  */

  return sitemapEntries;
}