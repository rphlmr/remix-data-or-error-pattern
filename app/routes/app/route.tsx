import { Await, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { data } from "~/utils";
import { Suspense } from "react";

export async function loader() {
  return data({
    version: "1.0.0",
    sources: new Promise<string[]>((resolve) => {
      setTimeout(() => {
        resolve(["source_1", "source_2"]);
      }, 4_000);
    }),
  });
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const serverData = await serverLoader<typeof loader>();
  // console.log("App layout client loader", serverData.data);

  // Do something long with serverData.data
  // await new Promise((resolve) => setTimeout(resolve, 2_000));
  async function getLocalSources() {
    const [serverSources, loacalSources] = await Promise.all([
      serverData.data.sources,
      new Promise<string[]>((resolve) => {
        setTimeout(() => {
          resolve(["source_1"]);
        }, 1_000);
      }),
    ]);

    return [...serverSources, ...loacalSources];
  }

  return data({
    version: serverData.data.version,
    allSources: getLocalSources(),
  });
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <span>Loading...</span>;
}

export default function AppLayout() {
  const clientLoaderData = useLoaderData<typeof clientLoader>();

  console.log("AppLayout", clientLoaderData.data.allSources);

  return (
    <main>
      <header>
        <h1>My App - version {clientLoaderData.data.version}</h1>
        <h2>
          Local sources:{" "}
          <Suspense fallback={<span>Loading...</span>}>
            <Await resolve={clientLoaderData.data.allSources}>
              {(sources) => sources.length}
            </Await>
          </Suspense>
        </h2>

        <nav>
          <NavLink to="/app" end>
            {({ isActive }) => <button disabled={isActive}>Editor</button>}
          </NavLink>
          <NavLink to="settings">
            {({ isActive }) => <button disabled={isActive}>Settings</button>}
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
