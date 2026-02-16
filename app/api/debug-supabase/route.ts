import { NextResponse } from "next/server";

export async function GET() {
  const result: Record<string, unknown> = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "(set)" : "(missing)",
  };

  try {
    const { createServerClient } = await import("@/lib/supabase/server");
    const supabase = createServerClient();
    const { data, error } = await supabase.from("api_keys").select("id").limit(1);

    if (error) {
      result.success = false;
      result.supabaseError = error.message;
      result.supabaseCode = error.code;
      result.supabaseDetails = error.details;
    } else {
      result.success = true;
      result.rowCount = data?.length ?? 0;
    }
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    result.success = false;
    result.error = e.message;
    result.cause = e.cause instanceof Error ? e.cause.message : String(e.cause ?? "");
  }

  return NextResponse.json(result);
}
