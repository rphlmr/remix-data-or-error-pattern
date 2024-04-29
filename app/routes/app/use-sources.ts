import { useRouteLoaderData } from "@remix-run/react";
import type { clientLoader } from "~/routes/app/route";

export function useSources() {
  const layoutLoaderData =
    useRouteLoaderData<typeof clientLoader>("routes/app");

  console.log("useSources", layoutLoaderData?.data.allSources);

  return layoutLoaderData?.data.allSources;
}
