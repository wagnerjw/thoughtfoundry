import HeaderAuth from '@/app/(private)/[username]/components/header-auth';
import '@/app/globals.css';
import { jbmono } from '@/fonts/JetbrainsMono';
import type { Metadata } from 'next';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'AI Starter Template',
  description: 'All The Things You Need To Get Started With AI',
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jbmono.className}>
        <main className="items-center flex flex-col min-h-screen">
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
              <HeaderAuth />
            </div>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
