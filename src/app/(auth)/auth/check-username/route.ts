import { createClient } from "@/lib/supabase/client"; // or server if you prefer
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "No username provided" }, { status: 400 });
  }

  // Query your `user_profiles` (or similar) table
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("username", username);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If data is non-empty, it means the username is taken
  const isTaken = data && data.length > 0;
  return NextResponse.json({ available: !isTaken });
}
