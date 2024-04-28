import { Await } from "@remix-run/react";
import { Suspense } from "react";

import { useSources } from "~/routes/app/use-sources";

export default function Index() {
  return (
    <div>
      <h2>Editor</h2>
      <Editor />
    </div>
  );
}

function Editor() {
  // const clientLoaderData =
  //   useRouteLoaderData<AppLayoutClientLoader>("routes/app");
  const sources = useSources();

  return (
    <Suspense fallback={<span>Waiting app layout</span>}>
      <Await resolve={sources}>
        <nav>
          <button>Save</button>
          <button>New</button>
        </nav>
      </Await>
    </Suspense>
  );
}
