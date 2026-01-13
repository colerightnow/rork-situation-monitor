import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors());

app.all("/trpc/*", async (c) => {
  const response = await fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`[tRPC Error] ${path}:`, error.message);
    },
  });
  return response;
});

app.get("/", (c) => {
  return c.json({ status: "ok", message: "Situation Monitor API is running", version: "1.3" });
});

app.get("/debug/routes", (c) => {
  const routes = Object.keys(appRouter._def.procedures);
  console.log("[debug/routes] Available procedures:", routes);
  return c.json({ 
    procedures: routes,
    hasTwitter: routes.some(r => r.startsWith('twitter')),
    timestamp: new Date().toISOString()
  });
});

export default app;
