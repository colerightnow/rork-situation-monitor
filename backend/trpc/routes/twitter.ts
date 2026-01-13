import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

type Category = "stocks" | "crypto" | "politics" | "general";

interface ClassificationResult {
  category: Category;
  confidence: number;
  reasoning: string;
}

async function classifyWithAI(username: string, bio: string): Promise<ClassificationResult> {
  const toolkitUrl = process.env.EXPO_PUBLIC_TOOLKIT_URL;
  
  if (!toolkitUrl) {
    console.log("[classifyWithAI] No toolkit URL, returning default");
    return {
      category: "general",
      confidence: 0.5,
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
            content: `You are a trading signal classifier. Analyze this Twitter account and categorize it.

Username: @${username}
Bio: "${bio}"

Categories:
- stocks: US equities, options, day trading, stock market analysis
- crypto: Bitcoin, altcoins, DeFi, cryptocurrency trading  
- politics: Political analysis, elections, policy impacts on markets
- general: Everything else

Respond with ONLY a JSON object in this exact format, no other text:
{"category": "stocks|crypto|politics|general", "confidence": 0.0-1.0, "reasoning": "brief explanation"}`,
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
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        category: parsed.category || "general",
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || "Classified by AI",
      };
    }
    
    throw new Error("Could not parse AI response");
  } catch (error) {
    console.error("[classifyWithAI] Error:", error);
    return {
      category: "general",
      confidence: 0.5,
      reasoning: "Classification failed, defaulting to general",
    };
  }
}

function getBearerToken(): string | null {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    console.log("[getBearerToken] No TWITTER_BEARER_TOKEN found");
    return null;
  }
  
  let cleanToken = bearerToken.trim();
  
  if (cleanToken.includes('%')) {
    try {
      cleanToken = decodeURIComponent(cleanToken);
      console.log("[getBearerToken] Decoded URL-encoded token");
    } catch {
      console.log("[getBearerToken] Token not URL-encoded, using as-is");
    }
  }
  
  console.log("[getBearerToken] Token found, length:", cleanToken.length);
  console.log("[getBearerToken] Token prefix:", cleanToken.substring(0, 40) + "...");
  return cleanToken;
}

function createMockUser(username: string, apiError?: string) {
  return {
    id: `mock_${username}`,
    username: username,
    name: username,
    description: "Trading account",
    public_metrics: {
      followers_count: 0,
      following_count: 0,
      tweet_count: 0,
    },
    isMock: true,
    ...(apiError && { apiError }),
  };
}

export const twitterRouter = createTRPCRouter({
  lookupUser: publicProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ input }) => {
      const username = input.username.replace("@", "").trim();
      console.log("[twitter.lookupUser] Looking up user:", username);

      const bearerToken = getBearerToken();
      
      if (!bearerToken) {
        console.log("[twitter.lookupUser] No Twitter API key, returning mock data");
        return createMockUser(username);
      }

      try {
        console.log("[twitter.lookupUser] Making Twitter API request...");
        console.log("[twitter.lookupUser] Bearer token prefix:", bearerToken.substring(0, 20) + "...");
        
        const response = await fetch(
          `https://api.twitter.com/2/users/by/username/${username}?user.fields=description,public_metrics`,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );

        console.log("[twitter.lookupUser] Response status:", response.status);
        
        const responseText = await response.text();
        console.log("[twitter.lookupUser] Response preview:", responseText.substring(0, 300));

        // Check for common error responses
        if (response.status === 401) {
          console.error("[twitter.lookupUser] 401 Unauthorized - Invalid or expired bearer token");
          return createMockUser(username, "Twitter API: Unauthorized (401) - Check bearer token");
        }
        
        if (response.status === 403) {
          console.error("[twitter.lookupUser] 403 Forbidden - API access level issue");
          return createMockUser(username, "Twitter API: Forbidden (403) - Check API access level");
        }
        
        if (response.status === 429) {
          console.error("[twitter.lookupUser] 429 Rate limited");
          return createMockUser(username, "Twitter API: Rate limited (429)");
        }

        if (!response.ok) {
          console.error("[twitter.lookupUser] Twitter API error:", response.status);
          return createMockUser(username, `Twitter API error: ${response.status}`);
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[twitter.lookupUser] JSON parse error:", parseError);
          console.error("[twitter.lookupUser] Raw response:", responseText.substring(0, 500));
          return createMockUser(username, "Failed to parse Twitter response");
        }
        
        if (data.errors && data.errors.length > 0) {
          console.log("[twitter.lookupUser] Twitter API returned errors:", data.errors);
          return createMockUser(username, data.errors[0]?.message || "Twitter API error");
        }
        
        if (!data.data) {
          console.log("[twitter.lookupUser] User not found in response");
          return createMockUser(username, "User not found");
        }
        
        console.log("[twitter.lookupUser] Found user:", data.data?.username);
        return { ...data.data, isMock: false };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("[twitter.lookupUser] Unexpected error:", errMsg);
        return createMockUser(username, `Error: ${errMsg}`);
      }
    }),

  classifyAccount: publicProcedure
    .input(
      z.object({
        username: z.string(),
        bio: z.string(),
        recentTweets: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[twitter.classifyAccount] Classifying:", input.username);

      const result = await classifyWithAI(input.username, input.bio);
      console.log("[twitter.classifyAccount] Result:", result);
      return result;
    }),

  getTweetById: publicProcedure
    .input(z.object({ tweetId: z.string() }))
    .mutation(async ({ input }) => {
      console.log("[twitter.getTweetById] Fetching tweet:", input.tweetId);

      const bearerToken = getBearerToken();
      
      if (!bearerToken) {
        console.log("[twitter.getTweetById] No Twitter API key");
        return { text: null, error: "No API key" };
      }

      try {
        console.log("[twitter.getTweetById] Making request with token prefix:", bearerToken.substring(0, 30) + "...");
        
        const response = await fetch(
          `https://api.twitter.com/2/tweets/${input.tweetId}?tweet.fields=text,created_at,author_id`,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );

        console.log("[twitter.getTweetById] Response status:", response.status);
        const responseText = await response.text();
        console.log("[twitter.getTweetById] Response preview:", responseText.substring(0, 300));

        if (response.status === 401) {
          console.error("[twitter.getTweetById] 401 Unauthorized - Invalid bearer token");
          return { text: null, error: "Twitter API: Unauthorized (401) - Check bearer token" };
        }
        
        if (response.status === 403) {
          console.error("[twitter.getTweetById] 403 Forbidden - Check API access level");
          return { text: null, error: "Twitter API: Forbidden (403) - Check API access level" };
        }

        if (!response.ok) {
          console.error("[twitter.getTweetById] Twitter API error:", response.status, responseText);
          return { text: null, error: `API error: ${response.status}` };
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[twitter.getTweetById] JSON parse error:", parseError);
          return { text: null, error: "Failed to parse Twitter response" };
        }
        
        if (data.errors && data.errors.length > 0) {
          console.error("[twitter.getTweetById] Twitter API errors:", data.errors);
          return { text: null, error: data.errors[0]?.message || "Twitter API error" };
        }
        
        console.log("[twitter.getTweetById] Got tweet:", data.data?.text?.substring(0, 100));
        
        return {
          text: data.data?.text || null,
          authorId: data.data?.author_id,
          createdAt: data.data?.created_at,
        };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("[twitter.getTweetById] Error:", errMsg);
        return { text: null, error: `Failed to fetch tweet: ${errMsg}` };
      }
    }),

  fetchTweets: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        username: z.string(),
        maxResults: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[twitter.fetchTweets] Fetching tweets for:", input.username);

      const bearerToken = getBearerToken();
      
      if (!bearerToken || input.userId.startsWith("mock_")) {
        console.log("[twitter.fetchTweets] No Twitter API or mock user, returning empty");
        return { tweets: [], isMock: true };
      }

      try {
        const maxResults = input.maxResults || 10;
        console.log("[twitter.fetchTweets] Making request for user ID:", input.userId);
        
        const response = await fetch(
          `https://api.twitter.com/2/users/${input.userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics`,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );

        console.log("[twitter.fetchTweets] Response status:", response.status);
        const responseText = await response.text();
        console.log("[twitter.fetchTweets] Response preview:", responseText.substring(0, 300));

        if (!response.ok) {
          console.error("[twitter.fetchTweets] Twitter API error:", response.status);
          return { tweets: [], isMock: true, error: `API error: ${response.status}` };
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[twitter.fetchTweets] JSON parse error:", parseError);
          return { tweets: [], isMock: true, error: "Failed to parse response" };
        }
        
        console.log("[twitter.fetchTweets] Got", data.data?.length || 0, "tweets");
        
        return {
          tweets: (data.data || []).map((tweet: { id: string; text: string; created_at: string }) => ({
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at,
            url: `https://twitter.com/${input.username}/status/${tweet.id}`,
          })),
          isMock: false,
        };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("[twitter.fetchTweets] Error:", errMsg);
        return { tweets: [], isMock: true, error: errMsg };
      }
    }),
});
