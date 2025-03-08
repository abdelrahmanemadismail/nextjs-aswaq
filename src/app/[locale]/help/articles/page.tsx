import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFAQArticles, getFaqCategories } from '@/actions/help-actions';
import { headers } from 'next/headers';
import { Locale } from '@/i18n.config';
import getTrans from '@/utils/translation';
import { ChevronRightIcon, ChevronLeftIcon, ChevronRightIcon as ChevronNextIcon } from "lucide-react";

export const metadata: Metadata = {
  title: 'Help Articles - Aswaq',
  description: 'Browse all help articles on Aswaq',
}

const ARTICLES_PER_PAGE = 10;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const url = (await headers()).get('x-url');
  const locale = url?.split('/')[3] as Locale;
  const t = await getTrans(locale);
  
  // Get current page from URL parameters
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page) : 1;
  
  // Fetch all articles
  const allArticles = await getFAQArticles();
  
  // Filter only published articles
  const publishedArticles = allArticles.filter(article => article.is_published);
  
  // Sort articles by display_order
  const sortedArticles = [...publishedArticles].sort((a, b) => a.display_order - b.display_order);
  
  // Calculate pagination
  const totalArticles = sortedArticles.length;
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
  
  // Get articles for current page
  const pageArticles = sortedArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );
  
  // Fetch all categories for the sidebar
  const categories = await getFaqCategories();
  
  // Sort categories by display_order
  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="container max-w-7xl py-6">
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.help.articles?.title || 'Help Articles'}</h1>
            <p className="text-muted-foreground mt-2">
              {t.help.articles?.description || 'Find answers to your questions with our help articles'}
            </p>
          </div>

          {/* Articles List */}
          <div className="space-y-4">
            {pageArticles.length > 0 ? (
              pageArticles.map((article) => (
                <Link 
                  key={article.id} 
                  href={`/${locale}/help/articles/${article.slug}`}
                  className="block"
                >
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold hover:text-primary">
                        {locale === 'ar' && article.title_ar ? article.title_ar : article.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {/* Display truncated content as preview */}
                        {locale === 'ar' && article.content_ar 
                          ? article.content_ar.replace(/#{2,}/g, '').slice(0, 150) 
                          : article.content.replace(/#{2,}/g, '').slice(0, 150)}
                        {(article.content.length > 150 || (article.content_ar && article.content_ar.length > 150)) && '...'}
                      </p>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.updated_at).toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <Button variant="link" size="sm" className="p-0">
                          {t.help.articles?.readMore || 'Read more'} →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">
                  {t.help.articles?.noArticles || 'No articles found'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                asChild={currentPage > 1}
              >
                {currentPage > 1 ? (
                  <Link href={`/${locale}/help/articles?page=${currentPage - 1}`}>
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    {t.help.articles?.previous || 'Previous'}
                  </Link>
                ) : (
                  <>
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    {t.help.articles?.previous || 'Previous'}
                  </>
                )}
              </Button>
              
              <div className="text-sm">
                {t.help.articles?.page || 'Page'} {currentPage} {t.help.articles?.of || 'of'} {totalPages}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                asChild={currentPage < totalPages}
              >
                {currentPage < totalPages ? (
                  <Link href={`/${locale}/help/articles?page=${currentPage + 1}`}>
                    {t.help.articles?.next || 'Next'}
                    <ChevronNextIcon className="h-4 w-4 ml-1" />
                  </Link>
                ) : (
                  <>
                    {t.help.articles?.next || 'Next'}
                    <ChevronNextIcon className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Side Content */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t.help.articles?.categories || 'Categories'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {sortedCategories.map((category) => (
                  <Link 
                    key={category.id} 
                    href={`/${locale}/help/categories/${category.slug}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <span>
                      {locale === 'ar' && category.name_ar ? category.name_ar : category.name}
                    </span>
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t.help.needToGetInTouch}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t.help.needToGetInTouchDesc}
              </p>
              <Button className="w-full">{t.help.contactUs}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}