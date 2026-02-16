import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json();
    const { name, key } = body;

    const supabase = createServerClient();

    const updates: Record<string, unknown> = {};
    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (typeof key === "string" && key.trim()) updates.api_key = key.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("api_keys")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
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
    const message = err instanceof Error ? err.message : "Failed to update API key";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createServerClient();
    const { error } = await supabase.from("api_keys").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete API key";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
