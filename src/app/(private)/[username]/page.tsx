import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function AccountPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  // Get the username from the URL
  const { username } = await params;

  // Get the user's actual username from their metadata
  const userUsername = data.user.user_metadata.username;

  // If the URL username doesn't match the user's username, return 404
  if (username !== userUsername) {
    notFound();
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
            className="text-black hover:bg-black hover:text-white"
          >
            Go Home
          </Button>
        </Link>
      </div>
    </>
  );
}
