import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const apiKeys = (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      key: row.api_key ?? row.key,
      usage: row.usage ?? 0,
      usageLimit: row.usage_limit ?? undefined,
      createdAt: row.created_at,
    }));

    return NextResponse.json(apiKeys);
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const cause = e.cause instanceof Error ? e.cause.message : String(e.cause ?? "");
    const message = cause ? `${e.message} (${cause})` : e.message;
    console.error("[api-keys GET]", e.message, e.cause);
    return NextResponse.json({ error: message || "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, usageLimit } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const key = generateSecureKey();

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        name: name.trim(),
        api_key: key,
        usage: 0,
        usage_limit: usageLimit ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details,
      }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      key: data.api_key ?? data.key,
      usage: data.usage ?? 0,
      usageLimit: data.usage_limit ?? undefined,
      createdAt: data.created_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create API key";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateSecureKey() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return "dnd-" + Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
