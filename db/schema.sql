-- PostgreSQL schema for Coptic Daily Readings

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  saint_name text,
  full_name text,
  password_hash text not null,
  session_token text,
  session_expires_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  text text not null,
  author_id uuid references accounts(id),
  author_name text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  user_id uuid references accounts(id),
  type text not null,
  created_at timestamptz default now()
);
