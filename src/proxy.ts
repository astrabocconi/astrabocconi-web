import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE } from "@/i18n/config";

// Public site: English is the default and has no prefix, Italian lives under
// /it. Unprefixed paths are rewritten to /en internally; a "lang=it" cookie
// (set by the language switch) sends returning Italian visitors to /it.
function localise(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  if (pathname === "/it" || pathname.startsWith("/it/")) return NextResponse.next();

  // /en is not a public URL: fold it into the bare path.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url);
  }

  if (request.cookies.get(LOCALE_COOKIE)?.value === "it") {
    url.pathname = `/it${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) return localise(request);

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser revalidates the token with Supabase; getSession only reads the
  // cookie and can be spoofed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isGate = pathname === "/admin";

  if (pathname.startsWith("/admin") && !isGate && !user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
