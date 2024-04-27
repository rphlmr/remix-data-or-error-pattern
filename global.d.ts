import type {
  ActionFunctionArgs as RRActionFunctionArgs,
  LoaderFunctionArgs as RRLoaderFunctionArgs,
} from "@remix-run/router/dist/utils";
import type { AppLoadContext } from "@remix-run/server-runtime/dist/data";
import { ResponseStub } from "@remix-run/server-runtime/dist/routeModules";

export global {
  import "@remix-run/react/future/single-fetch.d.ts";

  export type LoaderFunctionArgs = RRLoaderFunctionArgs<AppLoadContext> & {
    context: AppLoadContext;
    response: ResponseStub;
  };

  export type ActionFunctionArgs = RRActionFunctionArgs<AppLoadContext> & {
    context: AppLoadContext;
    response: ResponseStub;
  };
}
