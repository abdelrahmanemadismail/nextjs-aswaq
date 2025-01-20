-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create pages table with MDX content
create table public.pages (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
    -- MDX content with basic validation
    -- MDX combines Markdown with JSX components
    -- Allows embedding React components within markdown
    content text not null check (
        content != '' and  -- Not empty
        content ~ '[\s\S]*'  -- Allow multiline content
    ),
    -- Store frontmatter metadata for MDX content
    meta_description text,
    meta_keywords text,
    -- Publication status
    is_published boolean not null default false,
    -- Audit fields
    last_updated_by uuid references public.profiles(id),
    published_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for slug lookups
create index pages_slug_idx on public.pages(slug);

-- Create index for publication status
create index pages_publication_idx on public.pages(is_published);

-- Create updated_at trigger
create or replace function public.handle_pages_updated_at()
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

-- Create trigger for updated_at
create trigger handle_updated_at
    before update on public.pages
    for each row
    execute procedure public.handle_pages_updated_at();

-- Set up Row Level Security (RLS)
alter table public.pages enable row level security;

-- Policies for viewing pages
create policy "Pages are viewable by everyone when published"
    on public.pages for select
    using (is_published = true);

-- Policies for admins
create policy "Admins have full access to pages"
    on public.pages for all
    to authenticated
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));

-- Function to get active page by slug
create or replace function public.get_active_page(slug_param text)
returns public.pages
language sql
security definer
set search_path = public
as $$
    select *
    from public.pages
    where slug = slug_param
    and is_published = true
    limit 1;
$$;

-- Insert initial pages with MDX content
insert into public.pages (
    title,
    slug,
    content,
    meta_description,
    is_published
)
values 
    (
        'Terms & Conditions',
        'terms',
        '# Terms & Conditions

Welcome to our platform. By using our services, you agree to these terms.

<Alert>
  This document was last updated on January 1, 2024.
</Alert>

## 1. Account Registration

You must provide accurate information when registering...

<TOC />

## 2. User Responsibilities

Users must comply with all applicable laws...

<Notice type="warning">
  Violation of these terms may result in account suspension.
</Notice>',
        'Terms and conditions for using our platform',
        true
    ),
    (
        'Privacy Policy',
        'privacy',
        '# Privacy Policy

<Alert>
  We take your privacy seriously. This policy explains how we handle your data.
</Alert>

## Data Collection

We collect the following types of information:

<DataCollectionList />

## Data Usage

Your data is used for:

- Improving our services
- Personalizing your experience
- Communication about updates

<PrivacyContact />',
        'Our privacy policy and data handling practices',
        true
    ),
    (
        'About Us',
        'about',
        '# About ASWAQ

<Hero
  title="The Premier Marketplace in Dubai"
  description="Connecting buyers and sellers since 2024"
/>

## Our Mission

<Mission />

## Why Choose Us

<Features />

<Stats />

## Contact Us

<ContactForm />',
        'Learn more about our platform and mission',
        true
    )
on conflict (slug) do nothing;