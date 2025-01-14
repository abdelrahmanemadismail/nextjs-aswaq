-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create FAQ categories table
create table public.faq_categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
    description text,
    display_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(name)
);

-- Create FAQ articles table
create table public.faq_articles (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid references public.faq_categories(id) on delete cascade,
    title text not null,
    slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
    content text not null check (
        content != '' and  -- Not empty
        content ~ '[\s\S]*'  -- Allow multiline content with MDX syntax
    ),
    frontmatter jsonb default '{}'::jsonb,  -- Store MDX frontmatter metadata
    tags text[] default array[]::text[],
    view_count integer not null default 0,
    is_published boolean not null default false,
    display_order integer not null default 0,
    last_updated_by uuid references public.profiles(id),
    version integer not null default 1,
    published_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index faq_categories_slug_idx on public.faq_categories(slug);
create index faq_categories_display_order_idx on public.faq_categories(display_order);
create index faq_articles_category_id_idx on public.faq_articles(category_id);
create index faq_articles_slug_idx on public.faq_articles(slug);
create index faq_articles_display_order_idx on public.faq_articles(display_order);
create index faq_articles_tags_idx on public.faq_articles using gin(tags);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Create triggers for updated_at
create trigger handle_updated_at
    before update on public.faq_categories
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.faq_articles
    for each row
    execute procedure public.handle_updated_at();

-- Set up Row Level Security (RLS)
alter table public.faq_categories enable row level security;
alter table public.faq_articles enable row level security;

-- Policies for viewing FAQs (public access)
create policy "FAQ categories are viewable by everyone"
    on public.faq_categories for select
    using (is_active = true);

create policy "FAQ articles are viewable by everyone when published"
    on public.faq_articles for select
    using (is_published = true);

-- Policies for admin access
create policy "Admins have full access to FAQ categories"
    on public.faq_categories for all
    to authenticated
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));

create policy "Admins have full access to FAQ articles"
    on public.faq_articles for all
    to authenticated
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));

-- Helper function to get all FAQs by category
create or replace function public.get_faqs_by_category(category_slug text)
returns table (
    category_name text,
    category_description text,
    articles json
)
language sql
security definer
set search_path = public
as $$
    select 
        fc.name as category_name,
        fc.description as category_description,
        json_agg(
            json_build_object(
                'id', fa.id,
                'title', fa.title,
                'content', fa.content,
                'frontmatter', fa.frontmatter,
                'tags', fa.tags,
                'view_count', fa.view_count,
                'updated_at', fa.updated_at
            )
        ) as articles
    from faq_categories fc
    left join faq_articles fa on fa.category_id = fc.id
    where fc.slug = category_slug
    and fc.is_active = true
    and fa.is_published = true
    group by fc.id, fc.name, fc.description;
$$;

-- Helper function to get FAQ article with frontmatter
create or replace function public.get_faq_article(article_slug text)
returns table (
    title text,
    content text,
    frontmatter jsonb,
    category_name text,
    category_slug text,
    updated_at timestamp with time zone
)
language sql
security definer
set search_path = public
as $$
    select 
        fa.title,
        fa.content,
        fa.frontmatter,
        fc.name as category_name,
        fc.slug as category_slug,
        fa.updated_at
    from faq_articles fa
    join faq_categories fc on fa.category_id = fc.id
    where fa.slug = article_slug
    and fc.is_active = true
    and fa.is_published = true
    limit 1;
$$;

-- Insert the main FAQ categories
insert into public.faq_categories (name, slug, description, display_order) values
    ('Accounts', 'accounts', 'Account management, updates, security & login/registration', 1),
    ('Listing services', 'listing-services', 'Creating, managing & boosting listings including pricing rules & limits', 2),
    ('Payments & Purchases', 'payments-purchases', 'Transactions, payments, credits & vouchers', 3),
    ('Advertising', 'advertising', 'Sliders, Banner & other services', 4),
    ('New paid listing model', 'paid-listing', 'Features, benefits, paid listing visibility & more', 5),
    ('Safety & Security', 'safety-security', 'Transactions & account protection, avoid scams, reporting issues', 6)
on conflict (slug) do update
set 
    name = excluded.name,
    description = excluded.description,
    display_order = excluded.display_order;