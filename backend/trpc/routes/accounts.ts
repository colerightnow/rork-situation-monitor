import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

export type Category = "stocks" | "crypto" | "politics" | "general";

export interface StoredAccount {
  id: string;
  twitterHandle: string;
  name: string;
  category: Category;
  bio: string;
  followersCount: number;
  isActive: boolean;
  addedAt: string;
}

const accounts: StoredAccount[] = [];

export const accountsRouter = createTRPCRouter({
  list: publicProcedure.query(() => {
    console.log("[accounts.list] Returning", accounts.length, "accounts");
    return accounts;
  }),

  add: publicProcedure
    .input(
      z.object({
        twitterHandle: z.string(),
        name: z.string(),
        category: z.enum(["stocks", "crypto", "politics", "general"]),
        bio: z.string().optional(),
        followersCount: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const handle = input.twitterHandle.replace("@", "").trim();
      
      const existing = accounts.find(
        (a) => a.twitterHandle.toLowerCase() === `@${handle}`.toLowerCase()
      );
      if (existing) {
        console.log("[accounts.add] Account already exists:", handle);
        return existing;
      }

      const newAccount: StoredAccount = {
        id: `acc_${Date.now()}`,
        twitterHandle: `@${handle}`,
        name: input.name || handle,
        category: input.category,
        bio: input.bio || "",
        followersCount: input.followersCount || 0,
        isActive: true,
        addedAt: new Date().toISOString(),
      };

      accounts.push(newAccount);
      console.log("[accounts.add] Added account:", newAccount.twitterHandle);
      return newAccount;
    }),

  remove: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const index = accounts.findIndex((a) => a.id === input.id);
      if (index !== -1) {
        const removed = accounts.splice(index, 1)[0];
        console.log("[accounts.remove] Removed account:", removed.twitterHandle);
        return { success: true, removed };
      }
      return { success: false, removed: null };
    }),
});
