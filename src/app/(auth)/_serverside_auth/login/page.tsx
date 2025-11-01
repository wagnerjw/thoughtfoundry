import { SubmitButton } from '@/app/(private)/[username]/components/submit-button';
import {
  FormMessage,
  Message,
} from '@/components/prebuilt/supabase/form-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { signInAction } from './actions';

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
        <h1 className="text-2xl font-medium">Sign In</h1>
        <p className="text-sm text text-foreground">
          Forgot Your Password?{' '}
          <Link
            className="text-primary font-medium underline"
            href="/forgot-password"
          >
            Click Here
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <SubmitButton
            formAction={signInAction}
            pendingText="Signing in..."
            className="text-white bg-gray-900 hover:bg-gray-400 hover:text-gray-900"
          >
            Sign in
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
