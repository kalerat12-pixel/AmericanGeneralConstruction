-- Lifting4Gains — initial schema
-- Run with: supabase db push   (or paste into the Supabase SQL editor)
--
-- Design notes:
--  * Products/flavors are mirrored here so the storefront can be driven from
--    the database in production while still running from the bundled TypeScript
--    catalog with zero configuration in development.
--  * RLS is on for every table. Public reads are allowed for catalog content
--    only; orders and partner leads are never publicly readable.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table if not exists public.flavors (
  slug            text primary key,
  name            text not null,
  collab          text,
  line            text not null check (line in ('energy','hydration')),
  family          text not null check (family in ('sour','candy','fruit','citrus','creamy','soda')),
  caffeine_mg     integer not null default 0 check (caffeine_mg >= 0),
  calories        integer not null default 0,
  sugar_g         numeric(5,2) not null default 0,
  actives         text[] not null default '{}',
  notes           text[] not null default '{}',
  tasting_note    text not null,
  short_take      text not null,
  sweetness       smallint not null check (sweetness between 1 and 5),
  sourness        smallint not null check (sourness between 1 and 5),
  intensity       smallint not null check (intensity between 1 and 5),
  body            smallint not null check (body between 1 and 5),
  pairs_with      text[] not null default '{}',
  best_for        text not null,
  can_tone        text[] not null default '{}',
  release_year    integer,
  core_lineup     boolean not null default true,
  created_at      timestamptz not null default now()
);

create table if not exists public.products (
  id          text primary key,
  slug        text not null unique references public.flavors(slug) on delete cascade,
  title       text not null,
  line        text not null check (line in ('energy','hydration')),
  featured    boolean not null default false,
  badge       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.product_variants (
  id                            text primary key,
  product_slug                  text not null references public.products(slug) on delete cascade,
  pack_size                     integer not null check (pack_size > 0),
  label                         text not null,
  price_cents                   integer not null check (price_cents >= 0),
  compare_at_cents              integer,
  affiliate_url                 text,
  stripe_price_id               text,
  stripe_subscription_price_id  text,
  in_stock                      boolean not null default true
);

create index if not exists product_variants_product_slug_idx
  on public.product_variants(product_slug);

create table if not exists public.rankings (
  rank          integer primary key,
  flavor_slug   text not null unique references public.flavors(slug) on delete cascade,
  tier          text not null check (tier in ('S','A','B','C')),
  verdict       text not null,
  knock         text not null,
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Community
-- ---------------------------------------------------------------------------

create table if not exists public.reviews (
  id                 uuid primary key default gen_random_uuid(),
  product_slug       text not null references public.products(slug) on delete cascade,
  author             text not null,
  context            text not null default '',
  rating             smallint not null check (rating between 1 and 5),
  title              text not null,
  body               text not null,
  verified_purchase  boolean not null default false,
  helpful_count      integer not null default 0,
  -- Reviews land unapproved and are published by a human. Stops the product
  -- pages becoming a spam target the day the TikTok link goes live.
  approved           boolean not null default false,
  created_at         timestamptz not null default now()
);

create index if not exists reviews_product_slug_idx
  on public.reviews(product_slug) where approved;

create table if not exists public.newsletter_signups (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text not null default 'site',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Commerce
-- ---------------------------------------------------------------------------

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  reference           text not null unique,
  user_id             uuid references auth.users(id) on delete set null,
  email               text not null,
  status              text not null default 'pending'
                        check (status in ('pending','paid','fulfilled','cancelled')),
  subtotal_cents      integer not null default 0,
  discount_cents      integer not null default 0,
  shipping_cents      integer not null default 0,
  total_cents         integer not null default 0,
  is_subscription     boolean not null default false,
  commerce_mode       text not null default 'affiliate'
                        check (commerce_mode in ('affiliate','inventory')),
  stripe_session_id   text,
  referral_code       text,
  created_at          timestamptz not null default now()
);

create index if not exists orders_email_idx on public.orders(lower(email));
create index if not exists orders_user_id_idx on public.orders(user_id);

create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  product_slug     text not null,
  title            text not null,
  variant_label    text not null,
  quantity         integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  subscribe        boolean not null default false
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------------
-- Gym partners
-- ---------------------------------------------------------------------------

create table if not exists public.partner_leads (
  id                uuid primary key default gen_random_uuid(),
  gym_name          text not null,
  contact_name      text not null,
  email             text not null,
  phone             text,
  city              text not null,
  member_count      text not null,
  current_supplier  text,
  monthly_cases     text not null,
  message           text,
  referral_code     text,
  status            text not null default 'new'
                      check (status in ('new','contacted','quoted','won','lost')),
  created_at        timestamptz not null default now()
);

create index if not exists partner_leads_status_idx on public.partner_leads(status);

-- Referral codes handed to partner gyms. Members get a discount, the gym gets
-- credit against its next case order.
create table if not exists public.referral_codes (
  code              text primary key,
  gym_name          text not null,
  partner_lead_id   uuid references public.partner_leads(id) on delete set null,
  discount_percent  smallint not null default 10 check (discount_percent between 0 and 50),
  commission_percent smallint not null default 5 check (commission_percent between 0 and 50),
  active            boolean not null default true,
  uses              integer not null default 0,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.flavors            enable row level security;
alter table public.products           enable row level security;
alter table public.product_variants   enable row level security;
alter table public.rankings           enable row level security;
alter table public.reviews            enable row level security;
alter table public.newsletter_signups enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.partner_leads      enable row level security;
alter table public.referral_codes     enable row level security;

-- Catalog: readable by anyone, writable only by the service role.
drop policy if exists "catalog readable" on public.flavors;
create policy "catalog readable" on public.flavors for select using (true);

drop policy if exists "catalog readable" on public.products;
create policy "catalog readable" on public.products for select using (true);

drop policy if exists "catalog readable" on public.product_variants;
create policy "catalog readable" on public.product_variants for select using (true);

drop policy if exists "catalog readable" on public.rankings;
create policy "catalog readable" on public.rankings for select using (true);

-- Reviews: only approved ones are public. Anyone may submit one.
drop policy if exists "approved reviews readable" on public.reviews;
create policy "approved reviews readable" on public.reviews
  for select using (approved = true);

drop policy if exists "anyone may submit a review" on public.reviews;
create policy "anyone may submit a review" on public.reviews
  for insert with check (approved = false);

-- Signups and leads: write-only from the client, never readable.
drop policy if exists "anyone may sign up" on public.newsletter_signups;
create policy "anyone may sign up" on public.newsletter_signups
  for insert with check (true);

drop policy if exists "anyone may submit a lead" on public.partner_leads;
create policy "anyone may submit a lead" on public.partner_leads
  for insert with check (true);

-- Active referral codes are readable so the site can validate one at checkout.
drop policy if exists "active codes readable" on public.referral_codes;
create policy "active codes readable" on public.referral_codes
  for select using (active = true);

-- Orders: a signed-in customer sees only their own. Guest orders are reachable
-- only through the service role (order-lookup endpoint), never by anon select.
drop policy if exists "own orders readable" on public.orders;
create policy "own orders readable" on public.orders
  for select using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "own order items readable" on public.order_items;
create policy "own order items readable" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
        and auth.uid() is not null
    )
  );
