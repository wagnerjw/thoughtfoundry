import Link from 'next/link';
import { Button } from '../../../../components/ui/button';
import FastAPILogo from './logos/fastapi-logo';
import GitHubLogo from './logos/github-logo';
import NextLogo from './logos/next-logo';
import SupabaseLogo from './logos/supabase-logo';

// (your existing Hero component code, updated to accept username prop)
interface HeroProps {
  username: string | null;
}

export default function Hero({ username }: HeroProps) {
  return (
    <div className="flex flex-col items-center rounded-xl p-10  backdrop-blur-sm">
      <p className="text-black text-2xl">a simple</p>
      <div className="flex gap-8 justify-center items-center">
        <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
          <NextLogo />
        </a>
        <span className="border-1 rotate-45 h-6" />
        <div className="flex items-center justify-between font-semibold">
          <a
            href="https://fastapi.tiangolo.com/"
            target="_blank"
            rel="noreferrer"
          >
            <FastAPILogo />
          </a>
          <Link href="https://fastapi.tiangolo.com/">
            <p className="text-lg">FastAPI</p>
          </Link>
        </div>
        <span className="border-1 rotate-45 h-6" />
        <a
          href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
          target="_blank"
          rel="noreferrer"
        >
          <SupabaseLogo />
        </a>
      </div>
      <p className="text-black text-2xl">starter template</p>
      <div className="p-20 space-x-6">
        <Link href="/login">
          <Button className="hover:text-white hover:bg-black">Log In</Button>
        </Link>

        <Link href="https://github.com/wagnerjw/iteration_zero">
          <Button className="hover:text-white hover:bg-black">
            GitHub <GitHubLogo />
          </Button>
        </Link>
      </div>
      {username ? (
        <Link href={`/${username}`}>
          <Button className="hover:text-white hover:bg-black">
            Go To Account
          </Button>
        </Link>
      ) : (
        <Button
          disabled
          className="bg-gray-200 text-gray-900 cursor-not-allowed"
        >
          Go To Account
        </Button>
      )}
    </div>
  );
}
