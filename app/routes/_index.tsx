import type { MetaFunction } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { data, error, isErrorResponse, makeAppError } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

declare function getPostsIds(): Promise<{ postsIds: number[] }>;
declare function createNewPost(formData: FormData): Promise<{ postsId: number, createdAt: Date }>;

export async function loader({ response }: LoaderFunctionArgs) {
  try {
    // 👇 { data: T, error: null }
    return data({ postsIds: await getPostsIds() });
  } catch (cause) { // 👈 cause can be my AppError (including status) thrown by my services or a regular Error
    // 💡On a route with UI, I throw (ErrorBoundary), on a resource route I return
    // 👇 { data: null, error: typeof ReturnType<typeof error> }
    throw error(makeAppError(cause), response); // 👈 Set response.status = cause.status (or default to 500)
    //            👆Make a safe to use error response for my ErrorBoundary
  }
}

export async function action({ request, response }: ActionFunctionArgs) {
  try {
    const payload = await request.formData();
    // Zod formData validation ...

    // 👇 { data: T, error: null }
    return data(await createNewPost(payload));
  } catch (cause) { // 👈 cause can be my AppError (including status) thrown by my services or a regular Error
    // 👇 { data: null, error: typeof ReturnType<typeof error> }
    return error(makeAppError(cause), response); // 👈 Set response.status = cause.status (or default to 500)
    //            👆Make a safe to use error response for my useActionData
  }
}

export default function Index() {
  // 👇 { data: { postsIds: number[] }, error: null }
  const loaderData = useLoaderData<typeof loader>();
  console.log(loaderData.data.postsIds);

  // 👇 { data: T, error: null } | { data: null, error: MySanitizedError }
  const actionData = useActionData<typeof action>();

  if (actionData?.data) {
    // actionData.data is { newPostId: number, createdAt: Date }
    const data = actionData.data;
    console.log(data.postsId, data.createdAt);
  }

  if (actionData?.error) {
    // actionData.error is { message: string, label: string, ... }
    const error = actionData.error;
    console.log(error.additionalData);
  }

  return <div></div>;
}

// Render if loader throws an error
export function ErrorBoundary() {
  const response = useRouteError();
  const error = isErrorResponse(response) ? response.error : null;
  //             👆 is it from my error() function?

  return <div>{error?.message || "Hum, I'm not sure what happened."}</div>;
}
