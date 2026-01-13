# Twitter API Integration Debug Guide

## Current Problem
The Twitter API integration is not working. Users cannot:
1. Import tweets by URL (fetching tweet content fails)
2. Look up Twitter users (for adding X accounts)

## Current Implementation

### Backend Files
- `backend/trpc/routes/twitter.ts` - Twitter API routes
- `backend/hono.ts` - Hono server setup

### Environment Variables Required
```
TWITTER_BEARER_TOKEN - Required for all Twitter API v2 calls
```

### API Endpoints
1. `twitter.getTweetById` - Fetches tweet text by tweet ID
2. `twitter.lookupUser` - Looks up user by username
3. `twitter.fetchTweets` - Fetches recent tweets from a user
4. `twitter.classifyAccount` - AI classification (works independently)

---

## Debugging Checklist

### 1. Bearer Token Issues

**Check token format:**
- Twitter Bearer Tokens start with `AAAAAAAAAAAAAAAA`
- They should NOT be URL-encoded when stored (no `%2B`, `%3D` etc.)
- Current code attempts to decode URL-encoded tokens, but this might cause issues

**Verify token is valid:**
```bash
curl -X GET "https://api.twitter.com/2/tweets/1234567890123456789" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN_HERE"
```

Expected responses:
- `200 OK` + JSON data = Token works
- `401 Unauthorized` = Token invalid/expired
- `403 Forbidden` = Token valid but lacks permissions
- `429 Too Many Requests` = Rate limited

### 2. Twitter API Access Level

**Free Tier Limitations (as of 2024):**
- Only 1 Project, 1 App
- Read-only access to tweets
- 1,500 tweets/month read limit
- NO access to user lookup on free tier (requires Basic $100/month)
- Rate limits: 15 requests per 15 minutes for most endpoints

**Required Access:**
- Tweet lookup (`/2/tweets/:id`) - Available on Free tier
- User lookup (`/2/users/by/username/:username`) - **Requires Basic tier ($100/mo)**

### 3. Common Error Codes

| Status | Meaning | Solution |
|--------|---------|----------|
| 401 | Unauthorized | Regenerate bearer token |
| 403 | Forbidden | Upgrade API access tier or check app permissions |
| 404 | Not Found | Tweet deleted or user doesn't exist |
| 429 | Rate Limited | Wait 15 minutes |

### 4. Tweet ID Extraction

The current regex for extracting tweet IDs:
```javascript
/twitter\.com\/\w+\/status\/(\d+)/
/x\.com\/\w+\/status\/(\d+)/
```

Test URL: `https://x.com/sunxliao/status/2011057063292780811?s=20`
- Extracted ID would be: `2011057063292780811`
- **Note:** This ID looks unusual. Twitter IDs are typically ~19 digits but valid ones from 2024+ can vary.

---

## How to Fix

### Option A: Use Basic Tier ($100/month)
1. Go to https://developer.twitter.com/
2. Upgrade to Basic tier
3. Regenerate bearer token after upgrade
4. Update `TWITTER_BEARER_TOKEN` env var

### Option B: Remove User Lookup (Keep Tweet Import Only)
If you only need tweet import, the free tier might work for `/2/tweets/:id` endpoint.

1. Remove or disable the `lookupUser` functionality
2. Focus only on tweet text extraction

### Option C: Use Alternative (Unofficial APIs)
Some options (may violate ToS):
- Nitter instances (scraping)
- RapidAPI Twitter alternatives
- Store mock data and skip API entirely

---

## Code Changes Needed

### If Bearer Token Format is Wrong

In `backend/trpc/routes/twitter.ts`, the `getBearerToken()` function:

```typescript
function getBearerToken(): string | null {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    return null;
  }
  
  // Remove any URL encoding - tokens should be stored raw
  let cleanToken = bearerToken;
  if (bearerToken.includes('%')) {
    try {
      cleanToken = decodeURIComponent(bearerToken);
    } catch {
      // Use as-is if decoding fails
    }
  }
  
  // Remove any whitespace or newlines
  cleanToken = cleanToken.trim();
  
  return cleanToken;
}
```

### If API Access is the Issue

Add graceful degradation:

```typescript
// In getTweetById, return helpful error:
if (response.status === 403) {
  return { 
    text: null, 
    error: "Twitter API requires Basic tier ($100/mo) for this feature. Use 'Paste Text' mode instead."
  };
}
```

---

## Quick Test

Run this in your terminal to test if the bearer token works:

```bash
# Replace with your actual token
TOKEN="YOUR_BEARER_TOKEN"

# Test tweet lookup (should work on free tier)
curl -s "https://api.twitter.com/2/tweets/1234567890123456789" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test user lookup (requires Basic tier)  
curl -s "https://api.twitter.com/2/users/by/username/elonmusk?user.fields=description" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Current Bearer Token (Provided by User)

```
AAAAAAAAAAAAAAAAAAAAAOLp6wEAAAAAvNf0UKe0smT%2BQ6tfJ0q0qhQ4nQk%3DEiMet1vszXCnUBVlDUyW8wKSpfSJf30x49fvDzbnhBgmFzKRiI
```

**Issues with this token:**
1. Contains `%2B` (URL-encoded `+`) and `%3D` (URL-encoded `=`)
2. Should be decoded to: `AAAAAAAAAAAAAAAAAAAAAOLp6wEAAAAAvNf0UKe0smT+Q6tfJ0q0qhQ4nQk=EiMet1vszXCnUBVlDUyW8wKSpfSJf30x49fvDzbnhBgmFzKRiI`
3. The decoded version has `=` in the middle which is unusual for bearer tokens

**Recommendation:** 
1. Go to Twitter Developer Portal
2. Regenerate the Bearer Token
3. Copy it RAW without any URL encoding
4. Paste directly into environment variable

---

## Summary

Most likely causes (in order of probability):

1. **API Access Level** - Free tier doesn't support user lookup, and has severe limits on tweet lookup
2. **Token Format** - URL-encoded token in env var causing auth failures
3. **Rate Limiting** - Hit the 15 req/15 min limit during testing
4. **Token Expired/Invalid** - Token was regenerated but old one is still in env

**Recommended Action:**
1. Test bearer token directly with curl
2. Check Twitter Developer Portal for your API access level
3. If on free tier, either upgrade to Basic ($100/mo) or remove features that require it
