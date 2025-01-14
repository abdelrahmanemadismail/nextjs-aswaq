import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getFaqsByCategory } from '@/actions/help-actions'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getFaqsByCategory(params.slug)
  
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getFaqsByCategory(params.slug)

  if (!category) {
    notFound()
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

          {/* Search */}
          <div className="relative">
            <Input 
              type="search" 
              placeholder="Search for any topic" 
              className="h-12 pl-4"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-0 top-0 h-12 w-12 rounded-l-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
          </div>

          {/* Articles List */}
          <div className="space-y-4">
            {category.articles.map((article) => (
              <Link 
                key={article.id} 
                href={`/help/articles/${article.slug}`}
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
              <CardTitle>Need to get in touch?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Lorem ipsum dolor sit amet consectetur. Vel orci nibh vitae blandit tortor vestibulum enim neque suspendisse. Neque malesuada purus commodo arcu ante facilisis orci.
              </p>
              <Button className="w-full">Contact us</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}