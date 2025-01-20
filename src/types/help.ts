import { Database } from "./database.types"

type DbFAQCategory = Database["public"]["Tables"]["faq_categories"]["Row"]
type DbFAQArticle = Database["public"]["Tables"]["faq_articles"]["Row"]

/**
 * Represents a FAQ category
 */
export interface FAQCategory extends Omit<DbFAQCategory, "created_at" | "updated_at"> {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    display_order: number;
    is_active: boolean;
}

/**
 * Represents a FAQ article
 */
export interface FAQArticle extends Omit<DbFAQArticle, "frontmatter" | "created_at" | "last_updated_by"> {
    id: string;
    category_id: string;
    title: string;
    slug: string;
    content: string;
    frontmatter: Record<string, unknown>;
    tags: string[];
    view_count: number;
    is_published: boolean;
    display_order: number;
    version: number;
    updated_at: string;
}

/**
 * Represents FAQ article data with category information
 */
export interface ArticleData {
    title: string;
    content: string;
    frontmatter: Record<string, unknown>;
    category_name: string;
    category_slug: string;
    updated_at: string;
}

/**
 * Represents a category with its associated articles
 */
export interface CategoryWithArticles {
    category_name: string;
    category_description: string;
    articles: FAQArticle[];
}

/**
 * Input type for creating a FAQ article
 */
export interface CreateFAQArticleInput {
    category_id: string;
    title: string;
    slug: string;
    content: string;
    frontmatter?: Record<string, unknown>;
    tags?: string[];
    display_order?: number;
    is_published?: boolean;
}

/**
 * Input type for updating a FAQ article
 */
export interface UpdateFAQArticleInput extends Partial<CreateFAQArticleInput> {
    id: string;
}

/**
 * Input type for creating a FAQ category
 */
export interface CreateFAQCategoryInput {
    name: string;
    slug: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
}

/**
 * Input type for updating a FAQ category
 */
export interface UpdateFAQCategoryInput extends Partial<CreateFAQCategoryInput> {
    id: string;
}

/**
 * Type guard to check if content has frontmatter
 */
export function hasFrontmatter(content: FAQArticle | ArticleData): content is FAQArticle & { frontmatter: Record<string, unknown> } {
    return 'frontmatter' in content && !!content.frontmatter;
}

/**
 * Type guard to check if a category is active
 */
export function isActiveCategory(category: FAQCategory): boolean {
    return category.is_active;
}

/**
 * Type guard to check if an article is published
 */
export function isPublishedArticle(article: FAQArticle): boolean {
    return article.is_published;
}