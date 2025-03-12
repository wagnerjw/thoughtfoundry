import Link from 'next/link';
import { Button } from '../ui/button';
import FastAPILogo from './logos/fastapi-logo';
import GitHubLogo from './logos/github-logo';
import NextLogo from './logos/next-logo';
import SupabaseLogo from './logos/supabase-logo';

export default function Hero() {
  return (
    <div className="flex flex-col items-center">
      <p className="text-black">a simple</p>
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
      <p className="text-black">starter template</p>
      <div className="p-20 space-x-6">
        <Link href="/login">
          <Button className="text-green-600 bg-gray-300 hover:text-black hover:bg-green-300">
            Log In
          </Button>
        </Link>

        <Link href="https://github.com/wagnerjw/iteration_zero">
          <Button className="text-green-600 bg-gray-300 hover:text-black hover:bg-green-300">
            GitHub <GitHubLogo />
          </Button>
        </Link>
      </div>
      <Link href="/account">
        <Button className="text-green-600 bg-gray-300 hover:text-black hover:bg-green-300">
          Go To Account Page
        </Button>
      </Link>
    </div>
  );
}
