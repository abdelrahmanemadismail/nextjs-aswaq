import { Metadata } from 'next'
import { getPageBySlug } from '@/actions/page-actions'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'
import PageComponents from '@/components/mdx/PageComponents'
import { Card, CardContent } from '@/components/ui/card'
import { Languages } from '@/constants/enums'

type tParams = Promise<{ slug: string; locale: string }>;

export async function generateMetadata(props: { params: tParams }): Promise<Metadata> {
  const { slug, locale } = await props.params
  const page = await getPageBySlug(slug)
  const isArabic = locale === Languages.ARABIC;

  if (!page) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: isArabic && page.title_ar ? page.title_ar : page.title,
    description: isArabic && page.meta_description_ar 
      ? page.meta_description_ar 
      : page.meta_description || undefined,
    keywords: isArabic && page.meta_keywords_ar 
      ? page.meta_keywords_ar 
      : page.meta_keywords || undefined,
  }
}

export default async function Page(props: { params: tParams }) {
  const { slug, locale } = await props.params
  const page = await getPageBySlug(slug)
  const isArabic = locale === Languages.ARABIC;
  
  if (!page || !page.is_published) {
    notFound()
  }

  // Determine which content to display based on locale
  const pageTitle = isArabic && page.title_ar ? page.title_ar : page.title;
  const pageContent = isArabic && page.content_ar ? page.content_ar : page.content;

  // Format date according to locale
  const lastUpdated = new Date(page.updated_at).toLocaleDateString(
    isArabic ? 'ar-AE' : 'en-US', 
    { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
  );

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4 text-center">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          {isArabic ? 'آخر تحديث: ' : 'Last updated: '}{lastUpdated}
        </p>
        <MDXRemote 
          source={pageContent} 
          components={PageComponents} 
        />
      </CardContent>
    </Card>
  )
}