import { createTRPCRouter } from "./create-context";
import { accountsRouter } from "./routes/accounts";
import { signalsRouter } from "./routes/signals";
import { twitterRouter } from "./routes/twitter";

console.log("[app-router] Building router with twitter:", !!twitterRouter);
console.log("[app-router] Twitter router keys:", twitterRouter ? Object.keys(twitterRouter._def.procedures || {}) : "none");

export const appRouter = createTRPCRouter({
  accounts: accountsRouter,
  signals: signalsRouter,
  twitter: twitterRouter,
});

console.log("[app-router] Final router procedures:", Object.keys(appRouter._def.procedures));

export type AppRouter = typeof appRouter;
