import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

export type Sentiment = "bullish" | "bearish" | "neutral";
export type Confidence = "high" | "medium" | "low";
export type Category = "stocks" | "crypto" | "politics" | "general";

export interface Signal {
  id: string;
  accountHandle: string;
  accountName: string;
  tweetId: string;
  tweetUrl: string;
  content: string;
  tickers: string[];
  sentiment: Sentiment;
  confidence: Confidence;
  category: Category;
  entryPrice?: number;
  targetPrice?: number;
  stopPrice?: number;
  postedAt: string;
  createdAt: string;
}

interface SignalAnalysis {
  isSignal: boolean;
  tickers: string[];
  sentiment: Sentiment;
  confidence: Confidence;
  entryPrice: number | null;
  targetPrice: number | null;
  stopPrice: number | null;
  reasoning: string;
}

async function analyzeSignalWithAI(tweetText: string, accountHandle: string): Promise<SignalAnalysis> {
  const toolkitUrl = process.env.EXPO_PUBLIC_TOOLKIT_URL;
  
  if (!toolkitUrl) {
    console.log("[analyzeSignalWithAI] No toolkit URL, returning default");
    return {
      isSignal: false,
      tickers: [],
      sentiment: "neutral",
      confidence: "low",
      entryPrice: null,
      targetPrice: null,
      stopPrice: null,
      reasoning: "No AI service available",
    };
  }

  try {
    const response = await fetch(new URL("/agent/chat", toolkitUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Extract trading signal from this tweet. ONLY return isSignal: true if this is a real position/trade idea.

Tweet: "${tweetText}"
Author: ${accountHandle}

Return isSignal: true ONLY if this is:
- Actual position (bought/sold)
- Trade idea with entry/target
- Technical setup with levels
- Clear bullish/bearish call on a ticker

Return isSignal: false if:
- General opinion without actionable info
- News repost without analysis
- Joke/meme
- Question
- No specific ticker mentioned

Extract tickers as uppercase symbols (GME, BTC, ETH, etc). Include $ prefix removal.

Respond with ONLY a JSON object in this exact format, no other text:
{"isSignal": true/false, "tickers": ["SYMBOL"], "sentiment": "bullish|bearish|neutral", "confidence": "high|medium|low", "entryPrice": number|null, "targetPrice": number|null, "stopPrice": number|null, "reasoning": "brief explanation"}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.messages?.[0]?.content || data.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isSignal: parsed.isSignal || false,
        tickers: Array.isArray(parsed.tickers) ? parsed.tickers : [],
        sentiment: parsed.sentiment || "neutral",
        confidence: parsed.confidence || "low",
        entryPrice: parsed.entryPrice ?? null,
        targetPrice: parsed.targetPrice ?? null,
        stopPrice: parsed.stopPrice ?? null,
        reasoning: parsed.reasoning || "Analyzed by AI",
      };
    }
    
    throw new Error("Could not parse AI response");
  } catch (error) {
    console.error("[analyzeSignalWithAI] Error:", error);
    return {
      isSignal: false,
      tickers: [],
      sentiment: "neutral",
      confidence: "low",
      entryPrice: null,
      targetPrice: null,
      stopPrice: null,
      reasoning: "Analysis failed",
    };
  }
}

const signals: Signal[] = [];

export const signalsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        category: z.enum(["all", "stocks", "crypto", "politics", "general"]).optional(),
        limit: z.number().optional(),
      }).optional()
    )
    .query(({ input }) => {
      let filtered = [...signals];
      
      if (input?.category && input.category !== "all") {
        filtered = filtered.filter((s) => s.category === input.category);
      }
      
      filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
      
      if (input?.limit) {
        filtered = filtered.slice(0, input.limit);
      }
      
      console.log("[signals.list] Returning", filtered.length, "signals");
      return filtered;
    }),

  processTweet: publicProcedure
    .input(
      z.object({
        accountHandle: z.string(),
        accountName: z.string(),
        accountCategory: z.enum(["stocks", "crypto", "politics", "general"]),
        tweetId: z.string(),
        tweetText: z.string(),
        tweetUrl: z.string(),
        postedAt: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[signals.processTweet] Processing tweet from", input.accountHandle);
      
      const existing = signals.find((s) => s.tweetId === input.tweetId);
      if (existing) {
        console.log("[signals.processTweet] Tweet already processed:", input.tweetId);
        return { signal: existing, isNew: false };
      }

      try {
        const analysis = await analyzeSignalWithAI(input.tweetText, input.accountHandle);
        console.log("[signals.processTweet] AI analysis:", analysis);

        if (!analysis.isSignal || analysis.tickers.length === 0) {
          console.log("[signals.processTweet] Not a valid signal, skipping");
          return { signal: null, isNew: false };
        }

        const newSignal: Signal = {
          id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          accountHandle: input.accountHandle,
          accountName: input.accountName,
          tweetId: input.tweetId,
          tweetUrl: input.tweetUrl,
          content: input.tweetText,
          tickers: analysis.tickers,
          sentiment: analysis.sentiment,
          confidence: analysis.confidence,
          category: input.accountCategory,
          entryPrice: analysis.entryPrice ?? undefined,
          targetPrice: analysis.targetPrice ?? undefined,
          stopPrice: analysis.stopPrice ?? undefined,
          postedAt: input.postedAt,
          createdAt: new Date().toISOString(),
        };

        signals.push(newSignal);
        console.log("[signals.processTweet] Created new signal:", newSignal.id);
        return { signal: newSignal, isNew: true };
      } catch (error) {
        console.error("[signals.processTweet] Error processing tweet:", error);
        throw error;
      }
    }),

  clear: publicProcedure.mutation(() => {
    const count = signals.length;
    signals.length = 0;
    console.log("[signals.clear] Cleared", count, "signals");
    return { cleared: count };
  }),
});
