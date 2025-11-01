-- Ensure pgcrypto is available for UUID utilities if needed elsewhere
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user_profile table with user_id referencing auth.users(id)
CREATE TABLE IF NOT EXISTS public.user_profile (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  createdat timestamptz NOT NULL DEFAULT now()
);

-- Notes and recommendations:

-- The reference to auth.users requires that the auth schema and its users table exist and are visible to the role executing this DDL. If you get a permission error, run the statement as a database owner or via the Supabase SQL editor.
-- ON DELETE CASCADE will remove a profile when the corresponding auth user is deleted; change to ON DELETE SET NULL or remove cascade if you prefer a different behavior.
-- If you want RLS policies that restrict profiles to their owners, I can add those (recommended). Example policy would use auth.uid() to match user_id.
-- If your auth.users.id is of type text (some setups) instead of uuid, change user_id to match that type. If unsure, tell me and I can provide a safe variant that matches auth.users.id at runtime.