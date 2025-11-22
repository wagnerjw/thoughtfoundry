-- triggers on email verification
create trigger on_email_verified
after update on auth.users for each row execute procedure public.handle_new_public_user();