import type {
  ActionFunctionArgs as ActionFunctionArgs_PREV,
  LoaderFunctionArgs as LoaderFunctionArgs_PREV,
} from "@remix-run/node";
import type { AppLoadContext } from "@remix-run/server-runtime/dist/data";
import { ResponseStub } from "@remix-run/server-runtime/dist/routeModules";
import type {
  FetcherWithComponents,
  useFetcher as useFetcherRR,
} from "react-router-dom";
import type {
  ClientActionFunctionArgs as ClientActionFunctionArgs_PREV,
  ClientLoaderFunctionArgs as ClientLoaderFunctionArgs_PREV,
} from "@remix-run/react";
import type {
  SerializeFrom,
  TypedDeferredData,
  TypedResponse,
} from "@remix-run/server-runtime";
import type { AppData } from "@remix-run/react/dist/data";

declare global {
  export type LoaderFunctionArgs = Omit<
    LoaderFunctionArgs_PREV<AppLoadContext>,
    "response"
  > & {
    context: AppLoadContext;
    response: ResponseStub;
  };

  export type ActionFunctionArgs = Omit<
    ActionFunctionArgs_PREV<AppLoadContext>,
    "response"
  > & {
    context: AppLoadContext;
    response: ResponseStub;
  };

  export type ClientLoaderFunctionArgs = Omit<
    ClientLoaderFunctionArgs_PREV,
    "serverLoader"
  > & {
    serverLoader: <T = AppData>() => ReturnType<T>;
  };

  export type ClientActionFunctionArgs = Omit<
    ClientActionFunctionArgs_PREV,
    "serverLoader"
  > & {
    serverLoader: <T = AppData>() => ReturnType<T>;
  };
}

// Backwards-compatible type for Remix v2 where json/defer still use the old types,
// and only non-json/defer returns use the new types.  This allows for incremental
// migration of loaders to return naked objects.  In the next major version,
// json/defer will be removed so everything will use the new simplified typings.
// prettier-ignore
type SingleFetchSerialize_V2<T> =
    Awaited<ReturnType<T>> extends TypedDeferredData<infer D> ? D :
        Awaited<ReturnType<T>> extends TypedResponse<Record<string, unknown>> ? SerializeFrom<T> :
            Awaited<ReturnType<T>>;

declare module "@remix-run/react" {
  export function useLoaderData<T>(): SingleFetchSerialize_V2<T>;

  export function useActionData<T>(): SingleFetchSerialize_V2<T>;

  export function useRouteLoaderData<T>(
    routeId: string,
  ): SingleFetchSerialize_V2<T> | undefined;

  export function useFetcher<TData = unknown>(
    opts?: Parameters<typeof useFetcherRR>[0],
  ): FetcherWithComponents<SingleFetchSerialize_V2<TData>>;
}
