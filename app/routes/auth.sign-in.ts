import { createServerClient, parse, serialize } from "@supabase/ssr";
import { ResponseStub } from "@remix-run/server-runtime/dist/routeModules";

export async function loader({ request, response }: LoaderFunctionArgs) {
  const authSession = await requireAuthSession(request, response);

  // Now we have a valid session, we can do whatever we want with it

  return {};
}

// utils.server.ts

function supabaseServerClient(request: Request, response: ResponseStub) {
  const cookies = parse(request.headers.get("Cookie") ?? "");

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key) {
          return cookies[key];
        },
        set(key, value, options) {
          response.headers.append("Set-Cookie", serialize(key, value, options));
        },
        remove(key, options) {
          response.headers.append("Set-Cookie", serialize(key, "", options));
        },
      },
    },
  );
}

async function requireAuthSession(request: Request, response: ResponseStub) {
  const supabase = supabaseServerClient(request, response);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    response.status = 302;
    response.headers.set("Location", "/auth/sign-in");
    throw response;
  }

  return session;
}
