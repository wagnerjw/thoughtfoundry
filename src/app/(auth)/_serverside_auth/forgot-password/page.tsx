import { SubmitButton } from '@/app/(private)/[username]/components/submit-button';
import {
  FormMessage,
  Message,
} from '@/components/prebuilt/supabase/form-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordAction } from './actions';

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <form className="items-center justify-center space-y-3 h-screen flex flex-col justified-center min-w-64 max-w-64 mx-auto">
        <div>
          <h1 className="text-2xl font-medium">Reset Password</h1>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Enter Your Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton
            formAction={forgotPasswordAction}
            className="text-white bg-gray-900 hover:bg-gray-300 hover:text-gray-900"
          >
            Reset Password
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
