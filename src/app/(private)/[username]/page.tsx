import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const now = new Date();
  const currentTime = now.toLocaleTimeString();

  return (
    <>
      <div className="flex flex-col items-center justify-center space-y-3 h-screen">
        <p>Username: {data.user.user_metadata.username}</p>
        <p>Most Recent Login Time: {currentTime}</p>
        <p>Last Login Time: {data.user.last_sign_in_at}</p>
        <p>Your Role Is: {data.user.role}</p>

        <Link href="/">
          <Button 
            variant={'default'}
            className="text-black hover:bg-black hover:text-white">
              Go Home
          </Button>
        </Link>
      </div>
    </>
  );
}
