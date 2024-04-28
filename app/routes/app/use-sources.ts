import { useRouteLoaderData } from "@remix-run/react";
import type { clientLoader } from "~/routes/app/route";

export function useSources() {
  const {
    data: { allSources },
  } = useRouteLoaderData<typeof clientLoader>("routes/app");

  return allSources;
}
