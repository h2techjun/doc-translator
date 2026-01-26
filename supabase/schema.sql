-- Enable RLS
alter table auth.users enable row level security;

-- 1. Users Table (Updated)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  credit_balance int default 0,
  subscription_tier text default 'free', 
  status text default 'active', -- 'active', 'banned', 'muted'
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile" on public.users for select using ( auth.uid() = id );
create policy "Admins can view all profiles" on public.users for select using ( auth.uid() in (select id from public.users where subscription_tier = 'admin') ); -- Simplified Admin Check

-- 2. Transactions Table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  amount int not null, 
  type text not null, -- 'charge', 'deduct', 'reward', 'manual_adjustment'
  description text,
  status text default 'completed',
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;
create policy "Users can view own transactions" on public.transactions for select using ( auth.uid() = user_id );

-- 3. Documents Table
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  original_name text not null,
  file_size bigint,
  page_count int,
  status text default 'pending', 
  download_url text,
  created_at timestamptz default now()
);

alter table public.documents enable row level security;
create policy "Users can view own documents" on public.documents for select using ( auth.uid() = user_id );

-- 4. Community System (NEW)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.users(id) on delete set null,
  category text not null, -- 'free', 'inquiry', 'notice'
  title text not null,
  content text not null,
  view_count int default 0,
  is_hidden boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.posts enable row level security;
create policy "Public can view posts" on public.posts for select using ( is_hidden = false );
create policy "Users can create posts" on public.posts for insert using ( auth.uid() is not null );
create policy "Authors can update posts" on public.posts for update using ( auth.uid() = author_id );
create policy "Admins can manage posts" on public.posts for all using ( exists (select 1 from public.users where id = auth.uid() and subscription_tier = 'admin') );

create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  author_id uuid references public.users(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;
create policy "Public can view comments" on public.comments for select using ( true );
create policy "Users can create comments" on public.comments for insert using ( auth.uid() is not null );

-- 5. Admin Logs
create table public.admin_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null, -- 'ban_user', 'grant_points', 'delete_post'
  details jsonb,
  admin_id uuid references public.users(id),
  created_at timestamptz default now()
);

alter table public.admin_logs enable row level security;
