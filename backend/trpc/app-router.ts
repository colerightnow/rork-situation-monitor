import { createTRPCRouter } from "./create-context";
import { accountsRouter } from "./routes/accounts";
import { signalsRouter } from "./routes/signals";
import { twitterRouter } from "./routes/twitter";

export const appRouter = createTRPCRouter({
  accounts: accountsRouter,
  signals: signalsRouter,
  twitter: twitterRouter,
});

export type AppRouter = typeof appRouter;
