import { signUpAction } from '@/app/(auth)/_serverside_auth/authActions';
import { SubmitButton } from '@/app/(private)/[username]/components/submit-button';
import {
  FormMessage,
  Message,
} from '@/components/prebuilt/supabase/form-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ('message' in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="items-center justify-center space-y-3 h-screen flex flex-col justified-center min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">Sign Up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{' '}
          <Link className="text-primary font-medium underline" href="/login">
            Sign In
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="username">Username</Label>
          <Input name="username" placeholder="enter a username" required />
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="enter a password"
            minLength={6}
            required
          />
          <SubmitButton
            formAction={signUpAction}
            pendingText="Signing up..."
            className="text-white bg-gray-900 hover:bg-gray-300 hover:text-gray-900"
          >
            Sign Up
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
