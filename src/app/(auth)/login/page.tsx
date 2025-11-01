import { LoginForm } from '@/components/prebuilt/supabase/login-form';
import Dotbackground from '@/components/ui/dotbackground';

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
        <Dotbackground />
      </div>
    </div>
  );
}
