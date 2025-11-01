import { SignUpForm } from "@/components/prebuilt/supabase/sign-up-form";
import Dotbackground from "@/components/ui/dotbackground";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
        <Dotbackground />
      </div>
    </div>
  );
}
