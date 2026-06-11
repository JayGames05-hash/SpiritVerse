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

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references accounts(id) on delete cascade,
  author_name text,
  title text not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  author_id uuid not null references accounts(id) on delete cascade,
  author_name text,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
