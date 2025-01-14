import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getFaqArticle } from '@/actions/help-actions'
import PageComponents from '@/components/mdx/PageComponents'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getFaqArticle(params.slug)

  if (!article) {
    return {
      title: 'Article Not Found - Help Center',
    }
  }

  return {
    title: `${article.title} - Help Center`,
    description: article.frontmatter.description as string || undefined,
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getFaqArticle(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="container max-w-7xl py-6">
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        {/* Main Content */}
        <div className="space-y-6">
          <MDXRemote 
            source={article.content} 
            components={PageComponents}
            />
        </div>

        {/* Side Content */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Need to get in touch?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Lorem ipsum dolor sit amet consectetur. Vel orci nibh vitae blandit tortor vestibulum enim neque suspendisse. Neque malesuada purus commodo arcu ante facilisis orci.
              </p>
              <Button className="w-full">Contact us</Button>
            </CardContent>
          </Card>

          {/* Was this helpful card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Was this article helpful?</h3>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Yes</Button>
                <Button variant="outline" className="flex-1">No</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}