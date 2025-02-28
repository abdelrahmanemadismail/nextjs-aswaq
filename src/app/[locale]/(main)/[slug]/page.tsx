import { Metadata } from 'next'
import { getPageBySlug } from '@/actions/page-actions'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'
import PageComponents from '@/components/mdx/PageComponents'
import { Card, CardContent } from '@/components/ui/card'

// interface PageProps {
//   params: { slug: string }
// }
type tParams = Promise<{ slug: string }>;

export async function generateMetadata(props: { params: tParams }): Promise<Metadata> {
  const { slug }  = await props.params
  const page = await getPageBySlug(slug)

  if (!page) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: page.title,
    description: page.meta_description || undefined,
    keywords: page.meta_keywords || undefined,
  }
}

export default async function Page(props: { params: tParams }) {
  const { slug }  = await props.params
  const page = await getPageBySlug(slug)
  if (!page || !page.is_published) {
    notFound()
  }

  return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4 text-center">
            {page.title}
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Last updated: {new Date(page.updated_at).toLocaleDateString()}
          </p>
        <MDXRemote 
          source={page.content} 
          components={PageComponents} 
        />
        </CardContent>
      </Card>
  )
}