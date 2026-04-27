import { corsHeaders } from "npm:@supabase/supabase-js@2.104.1/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { topic, context, style } = await req.json();

    if (!topic || typeof topic !== "string") {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Create a high-impact, click-worthy YouTube thumbnail (16:9 aspect ratio, 1280x720) for a video.

Topic: ${topic}
${context ? `Context / details: ${context}` : ""}
${style ? `Visual style: ${style}` : "Visual style: bold, modern, eye-catching"}

Requirements:
- Vibrant, saturated colors with strong contrast
- Bold, large, easy-to-read text overlay (max 3-5 words) that captures the essence of the topic
- Dramatic lighting and depth
- A compelling focal subject (person, object, or scene related to the topic) with expressive emotion if applicable
- Clean composition optimized for small previews
- Professional, high-energy YouTube thumbnail aesthetic used by top creators
- No watermarks, no logos, no YouTube UI elements, no real people's likenesses, no copyrighted characters`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to generate thumbnail" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const upstreamError = data.choices?.[0]?.error;

    if (!imageUrl) {
      console.error("No image in response. Full payload:", JSON.stringify(data).slice(0, 1500));

      // Detect upstream rate limit / quota errors embedded in the SSE stream
      const upstreamCode = upstreamError?.code;
      const upstreamType = upstreamError?.metadata?.error_type;

      if (upstreamCode === 429 || upstreamType === "rate_limit_exceeded") {
        return new Response(
          JSON.stringify({ error: "The image model is rate-limited right now. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (upstreamCode === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const textReply = data.choices?.[0]?.message?.content;
      return new Response(
        JSON.stringify({
          error:
            typeof textReply === "string" && textReply.trim()
              ? `Image not generated: ${textReply.slice(0, 240)}`
              : "The AI couldn't generate an image for this prompt. Try rephrasing your topic or context (avoid real names, brands, or copyrighted material).",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("generate-thumbnail error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
