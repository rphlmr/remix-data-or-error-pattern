import { data } from "~/utils";
import {Await, useLoaderData} from "@remix-run/react";
import {Suspense} from "react";


export async function loader() {
  return data({
    sync: new Date(),
    longAsync: new Promise<Date>((resolve) => {
      setTimeout(() => {
        resolve(new Date());
      }, 2_000);
    }),
  });
}

export default function Stream() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div>
      <p>now: {loaderData.data.sync.toUTCString()}</p>
      <p>
        longAsync:{" "}
        <Suspense fallback={<span>Loading...</span>}>
          <Await resolve={loaderData.data.longAsync}>
            {(longAsync) => longAsync.toUTCString()}
          </Await>
        </Suspense>
      </p>
    </div>
  );
}

