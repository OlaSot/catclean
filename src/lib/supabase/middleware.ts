import { devLog } from "@/lib/dev-log";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const { url, anonKey } = getSupabasePublicEnv();

  if (!url || !anonKey) {
    console.error(
      "[middleware] Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel."
    );
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("[middleware] getUser error:", error.message);
    }

    if (request.nextUrl.pathname.startsWith("/app")) {
      devLog("[middleware] /app request", {
        path: request.nextUrl.pathname,
        hasUser: Boolean(user?.id),
      });
    }
  } catch (error) {
    console.error("[middleware] Session refresh failed:", error);
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
