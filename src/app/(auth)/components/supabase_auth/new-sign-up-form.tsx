"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewSignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For client-side availability check
  const [isUsernameTaken, setIsUsernameTaken] = useState<boolean | null>(null);

  const router = useRouter();

  // 1) Client-side check to see if username is already taken
  async function checkUsernameAvailability(name: string) {
    if (!name.trim()) {
      setIsUsernameTaken(null);
      return;
    }
    try {
      const res = await fetch(`/auth/check-username?username=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.error) {
        // If there's some server error, you could handle it
        console.error(data.error);
        setIsUsernameTaken(null);
      } else {
        setIsUsernameTaken(!data.available);
        console.log(data)
      }
    } catch (err) {
      console.error(err);
      setIsUsernameTaken(null);
    }
  }

  // 2) Handle the sign-up flow
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // OPTIONAL: You might also want to ensure isUsernameTaken !== true
    if (isUsernameTaken) {
      setError("Username is already taken.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      // A) First create the user
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // By default, user_metadata goes here
          data: { username },
          emailRedirectTo: `${window.location.origin}/private/account`,
        },
      });
      if (authError) throw authError;

      // B) Insert into user_profiles (or whichever table)
      //    Assuming user_profiles has columns: id (uuid), username, email, etc.
      const user = signUpData.user;
      if (!user) {
        throw new Error("No user returned from signUp.");
      }

      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: user.id,
          username,
          email,
        });

      if (profileError) {
        // Could be a unique constraint violation if another user grabbed the username
        throw profileError;
      }

      // If everything worked, redirect or push to a success page
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              
              {/* EMAIL */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* USERNAME */}
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Pick a username"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    // reset availability state whenever they type
                    setIsUsernameTaken(null);
                  }}
                  onBlur={() => checkUsernameAvailability(username)}
                />
                {/* Show immediate feedback once we check */}
                {username && isUsernameTaken === false && (
                  <p className="text-sm text-green-500">Username is available!</p>
                )}
                {username && isUsernameTaken === true && (
                  <p className="text-sm text-red-500">Username is already taken</p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* REPEAT PASSWORD */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>

              {/* ERROR MESSAGE */}
              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* SUBMIT */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
