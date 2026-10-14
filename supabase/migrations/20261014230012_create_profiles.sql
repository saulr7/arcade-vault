create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,16}$'),
  created_at timestamptz not null default now()
);

create unique index profiles_username_lower_key on public.profiles (lower(username));

alter table public.profiles enable row level security;

-- Usernames are public (future leaderboards will show them).
create policy "Profiles are readable by everyone"
  on public.profiles for select using (true);
-- No insert/update/delete policies: rows are created only by the trigger.

create function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
