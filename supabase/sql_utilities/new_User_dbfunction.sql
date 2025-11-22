create function public.handle_new_public_user()
returns trigger
language plpgsql
security definer set search_path = public,auth,extensions
as $$
begin
    if new.email_confirmed_at IS NOT NULL AND old.email_confirmed_at IS null then
        insert into public.user_profiles (user_id, username, confirmed_at)
        values (new.id, new.raw_user_meta_data ->> 'username', new.confirmed_at);
    end if;
    return new;
end;
$$; 