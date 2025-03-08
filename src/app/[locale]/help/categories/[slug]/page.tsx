import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getFaqsByCategory } from '@/actions/help-actions'
import { headers } from 'next/headers'
import { Locale } from '@/i18n.config'
import getTrans from '@/utils/translation'

type tParams = Promise<{ slug: string }>;



export async function generateMetadata(props: { params: tParams }): Promise<Metadata> {
  const { slug } = await props.params
  
  const category = await getFaqsByCategory(slug)
  
  if (!category) {
    return {
      title: 'Category Not Found - Help Center',
    }
  }

  return {
    title: `${category.category_name} - Help Center`,
    description: category.category_description || undefined,
  }
}

export default async function CategoryPage(props: { params: tParams }) {
  const url = (await headers()).get('x-url')
  const locale = url?.split('/')[3] as Locale
  
  const t = await getTrans(locale);
  const { slug } = await props.params

  const category = await getFaqsByCategory(slug, locale)
  console.log(category)

  if (!category) {
    return <>test</>
  }

  return (
    <div className="container max-w-7xl py-6">
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{category.category_name}</h1>
            <p className="text-muted-foreground mt-2">{category.category_description}</p>
          </div>

          {/* Articles List */}
          <div className="space-y-4">
            {category.articles && category.articles.map((article) => (
              <Link 
                key={article.id} 
                href={`/${locale}/help/articles/${article.slug}`}
                className="block"
              >
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold hover:text-primary">
                      {article.title}
                    </h2>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Side Content */}
        <div>
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
        </div>
      </div>
    </div>
  )
}