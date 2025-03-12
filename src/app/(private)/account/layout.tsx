import '@/app/globals.css';
import HeaderAuth from '@/components/prebuilt/auth/header-auth';
import { EnvVarWarning } from '@/components/prebuilt/env/env-var-warning';
import { hasEnvVars } from '@/lib/supabase/check-env-vars';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'The Ultimate AI Starter Template',
  description: 'All The Things You Need To Get Started With AI',
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen flex flex-col items-center">
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
              {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
            </div>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
