import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  if (!url) {
    throw new Error(
      "EXPO_PUBLIC_RORK_API_BASE_URL is not set"
    );
  }

  // Remove trailing slash and /trpc suffix if present to avoid double path
  let cleanUrl = url.replace(/\/$/, '');
  if (cleanUrl.endsWith('/trpc')) {
    cleanUrl = cleanUrl.slice(0, -5);
  }
  
  console.log('[trpc] Base URL:', cleanUrl);
  return cleanUrl;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/trpc`,
      transformer: superjson,
    }),
  ],
});
