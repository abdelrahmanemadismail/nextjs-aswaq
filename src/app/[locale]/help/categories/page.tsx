import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { getFaqCategories } from '@/actions/help-actions';
import { User, ListTodo, CreditCard, ImageIcon, ShieldCheck, FileText } from "lucide-react";
import { headers } from 'next/headers';
import { Locale } from '@/i18n.config';
import getTrans from '@/utils/translation';

export const metadata: Metadata = {
  title: 'Help Categories - Aswaq',
  description: 'Browse all help categories on Aswaq',
}

// Helper function to map category slug to appropriate icon
const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'accounts':
      return <User className="h-8 w-8 text-primary" />;
    case 'listing-services':
      return <ListTodo className="h-8 w-8 text-primary" />;
    case 'payments-purchases':
      return <CreditCard className="h-8 w-8 text-primary" />;
    case 'advertising':
      return <ImageIcon className="h-8 w-8 text-primary" />;
    case 'paid-listing':
      return <FileText className="h-8 w-8 text-primary" />;
    case 'safety-security':
      return <ShieldCheck className="h-8 w-8 text-primary" />;
    default:
      return <ListTodo className="h-8 w-8 text-primary" />;
  }
};

export default async function CategoriesPage() {
  const url = (await headers()).get('x-url');
  const locale = url?.split('/')[3] as Locale;
  const t = await getTrans(locale);
  
  // Fetch all categories
  const categories = await getFaqCategories();
  
  // Sort categories by display_order
  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="container max-w-7xl py-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-center">{t.help.categories.title || 'Help Categories'}</h1>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          {t.help.categories.description || 'Browse all categories to find the help you need'}
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCategories.map((category) => (
          <Link key={category.id} href={`/${locale}/help/categories/${category.slug}`}>
            <Card className="h-full hover:bg-muted/50 transition-colors">
              <CardContent className="p-6 flex gap-4">
                <div className="p-2 bg-primary/10 rounded-lg h-fit">
                  {getCategoryIcon(category.slug)}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {locale === 'ar' && category.name_ar ? category.name_ar : category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar' && category.description_ar ? category.description_ar : category.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}