import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = body?.apiKey ?? body?.api_key;

    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return NextResponse.json({ valid: false, error: "API key is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("api_keys")
      .select("id")
      .eq("api_key", apiKey.trim())
      .maybeSingle();

    if (error) {
      return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ valid: !!data });
  } catch (err) {
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}
