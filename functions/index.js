const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Rate limiting: 20 requests per IP per hour
const RATE_LIMIT_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

exports.generatePost = onRequest(
  {
    cors: true, // Enable CORS for all origins
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      // Get client IP for rate limiting
      const clientIP = req.headers["x-forwarded-for"] ||
                      req.headers["x-real-ip"] ||
                      req.connection.remoteAddress ||
                      req.socket.remoteAddress ||
                      req.connection.socket?.remoteAddress ||
                      "unknown";

      // Check rate limit
      const rateLimitKey = `ratelimit_${clientIP}`;
      const rateLimitRef = admin.firestore().collection("rateLimits").doc(rateLimitKey);

      const rateLimitDoc = await rateLimitRef.get();
      const now = Date.now();

      if (rateLimitDoc.exists) {
        const data = rateLimitDoc.data();
        const windowStart = data.windowStart || now;
        const requestCount = data.requestCount || 0;

        // Reset window if it's been more than an hour
        if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
          await rateLimitRef.set({
            requestCount: 1,
            windowStart: now
          });
        } else if (requestCount >= RATE_LIMIT_REQUESTS) {
          return res.status(429).json({
            error: "Rate limit exceeded. Please try again later.",
            retryAfter: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - windowStart)) / 1000)
          });
        } else {
          await rateLimitRef.update({
            requestCount: requestCount + 1
          });
        }
      } else {
        // First request from this IP
        await rateLimitRef.set({
          requestCount: 1,
          windowStart: now
        });
      }

      // Extract request data
      const { topic, style, tone, context, cta } = req.body;

      // Validate required fields
      if (!topic || !style || !tone) {
        return res.status(400).json({
          error: "Missing required fields: topic, style, and tone are required"
        });
      }

      // Get Gemini API key from Firebase config
      const geminiApiKey = functions.config().gemini?.apikey;
      if (!geminiApiKey) {
        console.error("Gemini API key not configured");
        return res.status(500).json({ error: "Server configuration error" });
      }

      // Create system prompt
      const systemPrompt = `You are an expert AI transformation strategist and senior engineering leader. You write LinkedIn posts for C-suite and senior engineering leaders (CTOs, VPs of Engineering, principal engineers). Your posts are:
- Specific and practical (no generic motivational content)
- Executive-friendly with clear business impact
- Based on real industry trends and deep technical insights
- Written from a first-person perspective as a thought leader
- Designed to demonstrate expertise and drive engagement

Posts must be 900-1400 characters, with:
1. A strong opening hook that demands attention
2. Exactly 3 insight points (each 1-2 sentences)
3. A clear takeaway or call-to-action
4. 3-4 relevant hashtags at the end`;

      // Build user prompt
      let userPrompt = `Create 2 unique LinkedIn post drafts about: "${topic}"

Style: ${style}
Tone: ${tone}`;

      if (context && context.trim()) {
        userPrompt += `\nContext from user: ${context}`;
      }

      if (cta && cta !== 'none') {
        const ctaInstructions = {
          'question': 'End with a thought-provoking question.',
          'opinion': 'End by asking for the audience\'s perspectives.',
          'sharing': 'End by encouraging the audience to share their experiences.'
        };
        userPrompt += `\nCallout: ${ctaInstructions[cta]}`;
      }

      userPrompt += `

IMPORTANT: Return your response as a JSON array with exactly 2 objects. Each object must have:
{
  "label": "Draft 1" or "Draft 2",
  "angle": "One-line description of this draft's unique angle",
  "post": "The full LinkedIn post text (900-1400 characters, with 3-4 hashtags at the end)"
}

Return ONLY the JSON array, no other text.`;

      // Call Gemini API
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: userPrompt
            }]
          }],
          systemInstruction: {
            parts: [{
              text: systemPrompt
            }]
          }
        })
      });

      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.json();
        console.error("Gemini API error:", errorData);
        return res.status(500).json({
          error: `AI service error: ${geminiResponse.status}`
        });
      }

      const geminiData = await geminiResponse.json();

      if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
        console.error("Unexpected Gemini API response:", geminiData);
        return res.status(500).json({ error: "Unexpected AI service response" });
      }

      const generatedText = geminiData.candidates[0].content.parts[0].text;

      // Parse the JSON response
      let drafts;
      try {
        drafts = JSON.parse(generatedText);
        if (!Array.isArray(drafts) || drafts.length !== 2) {
          throw new Error("Invalid response format");
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", generatedText);
        return res.status(500).json({ error: "Failed to process AI response" });
      }

      // Return the drafts
      res.json({
        success: true,
        drafts: drafts
      });

    } catch (error) {
      console.error("Function error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);