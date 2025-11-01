import Hero from '@/app/(public)/(home)/components/hero';
import Dotbackground from '@/components/ui/dotbackground';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    console.log(error);
  }

  const username = data?.user?.user_metadata?.username ?? null;

  return (
    <main className="h-screen flex items-center justify-center">
      <Hero username={username} />
      <Dotbackground />
    </main>
  );
}
