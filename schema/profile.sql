-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create roles table
create table public.roles (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique check (name in ('admin', 'personal', 'business')),
    description text,
    listing_limit integer not null default 10,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table
create table public.profiles (
    id uuid references auth.users primary key,
    full_name text not null,
    avatar_url text,
    date_of_birth date,
    verification_status text check (verification_status in ('unverified', 'pending', 'verified')) default 'unverified',
    is_banned boolean default false,
    join_date timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_roles junction table
create table public.user_roles (
    id uuid primary key references public.profiles,
    role_id uuid references public.roles not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(id, role_id)
);

-- Create business_profiles table
create table public.business_profiles (
    id uuid primary key references public.profiles,
    business_name text not null,
    company_logo text,
    trade_license_number text unique not null,
    trade_license_expiry date not null,
    trade_license_verified boolean default false,
    company_address text not null,
    company_phone text not null,
    company_email text not null,
    tax_registration_number text,
    business_category text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at function and trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Create triggers for updated_at
create trigger handle_updated_at
    before update on public.roles
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.profiles
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.user_roles
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.business_profiles
    for each row
    execute procedure public.handle_updated_at();

-- Create function to handle new user registration
-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        full_name,
        avatar_url
    )
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.email),
        coalesce(new.raw_user_meta_data->>'avatar_url', null)
    );

    -- Assign default 'personal' role
    insert into public.user_roles (id, role_id)
    select new.id, r.id
    from public.roles r
    where r.name = 'personal';

    return new;
end;
$$;

-- Create trigger for new user registration
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Helper function to check if user is admin
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
    select exists (
        select 1 
        from public.user_roles ur 
        join public.roles r on r.id = ur.role_id 
        where ur.id = user_id 
        and r.name = 'admin'
    );
$$;

-- Helper function to get user's listing limit
create or replace function public.get_user_listing_limit(user_id uuid)
returns integer
language sql
security definer
set search_path = ''
as $$
    select max(r.listing_limit)
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.id = user_id;
$$;

-- Set up Row Level Security (RLS)
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.business_profiles enable row level security;

-- Roles policies
create policy "Roles are viewable by admin only"
    on public.roles for select
    to authenticated
    using (public.is_admin(auth.uid()));

create policy "Roles are insertable by admin only"
    on public.roles for insert
    to authenticated
    with check (public.is_admin(auth.uid()));

create policy "Roles are updatable by admin only"
    on public.roles for update
    to authenticated
    using (public.is_admin(auth.uid()));

create policy "Roles are deletable by admin only"
    on public.roles for delete
    to authenticated
    using (public.is_admin(auth.uid()));

-- User roles policies
create policy "User roles are viewable by admin only"
    on public.user_roles for select
    to authenticated
    using (public.is_admin(auth.uid()));

create policy "User roles are insertable by admin only"
    on public.user_roles for insert
    to authenticated
    with check (public.is_admin(auth.uid()));

create policy "User roles are updatable by admin only"
    on public.user_roles for update
    to authenticated
    using (public.is_admin(auth.uid()));

create policy "User roles are deletable by admin only"
    on public.user_roles for delete
    to authenticated
    using (public.is_admin(auth.uid()));

-- Profiles policies
create policy "Profiles are viewable by everyone"
    on public.profiles for select
    using (true);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Business profiles policies
create policy "Business profiles are viewable by everyone"
    on public.business_profiles for select
    using (true);

create policy "Users can update own business profile"
    on public.business_profiles for update
    using (auth.uid() = id);

create policy "Users can insert own business profile"
    on public.business_profiles for insert
    with check (auth.uid() = id);

-- Insert default roles with different listing limits
insert into public.roles (name, description, listing_limit)
values 
    ('admin', 'Administrator with full system access', -1),
    ('personal', 'Regular user account', 10),
    ('business', 'Business account with additional features', 50)
on conflict (name) do update
set listing_limit = excluded.listing_limit,
    description = excluded.description;

-- Set up Storage buckets
insert into storage.buckets (id, name, public)
values 
    ('avatars', 'avatars', true),
    ('logos', 'logos', true)
on conflict (id) do nothing;

-- Storage policies for avatars
create policy "Avatar images are publicly accessible"
    on storage.objects for select
    using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
    on storage.objects for insert
    with check (
        bucket_id = 'avatars' 
        and (storage.foldername(name))[1] = auth.uid()::text
    );

create policy "Users can update their own avatar"
    on storage.objects for update
    using (
        bucket_id = 'avatars' 
        and (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage policies for company logos
create policy "Company logos are publicly accessible"
    on storage.objects for select
    using (bucket_id = 'logos');

create policy "Users can upload their business logo"
    on storage.objects for insert
    with check (
        bucket_id = 'logos'
        and auth.uid() in (
            select bp.id
            from public.business_profiles bp
            where bp.id = auth.uid()
        )
    );

create policy "Users can update their business logo"
    on storage.objects for update
    using (
        bucket_id = 'logos'
        and auth.uid() in (
            select bp.id
            from public.business_profiles bp
            where bp.id = auth.uid()
        )
    );