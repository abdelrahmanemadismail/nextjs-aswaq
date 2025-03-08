import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getFaqArticle } from '@/actions/help-actions'
import PageComponents from '@/components/mdx/PageComponents'
import { headers } from 'next/headers'
import { Locale } from '@/i18n.config'
import getTrans from '@/utils/translation'

type tParams = Promise<{ slug: string }>;

export async function generateMetadata(props: { params: tParams }): Promise<Metadata> {
  const { slug } = await props.params
  const article = await getFaqArticle(slug)

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

export default async function ArticlePage(props: { params: tParams }) {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  const t = await getTrans(locale);
  
  const { slug } = await props.params
  const article = await getFaqArticle(slug, locale)

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
              <CardTitle>{t.help.needToGetInTouch}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t.help.needToGetInTouchDesc}
              </p>
              <Button className="w-full">{t.help.contactUs}</Button>
            </CardContent>
          </Card>

          {/* Was this helpful card */}
          {/* <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">{t.help.wasArticleHelpful}</h3>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">{t.common.yes}</Button>
                <Button variant="outline" className="flex-1">{t.common.no}</Button>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  )
}