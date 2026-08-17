import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    const response = await fetch(url, options);
    if ((response.status === 503 || response.status === 429) && i < retries) {
      const delay = (i + 1) * 3000;
      console.warn(`API busy (status ${response.status}). Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    return response;
  }
  return fetch(url, options);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) throw new Error("No image data provided");

    const apiKey = Deno.env.get('GOOGLE_AI_STUDIO_KEY');
    if (!apiKey) throw new Error("GOOGLE_AI_STUDIO_KEY not set in Supabase Secrets.");

    const pureBase64 = imageBase64.split(',')[1] || imageBase64;

    console.log("Phase 1: Deep Vision Inspection with Gemini 2.5 Flash...");

    // Phase 1: Extract a hyper-detailed portrait description optimised for Renaissance art generation
    const visionResponse = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `You are an expert art historian and portrait painter. Study this person's face very carefully.
                
Describe them in rich detail for a Renaissance portrait artist, covering:
- Exact skin tone and texture (e.g. "warm olive complexion with subtle rose in the cheeks")
- Eye shape, colour and expression (e.g. "deep-set almond eyes with dark amber irises")  
- Nose shape (e.g. "aquiline nose", "broad nose with rounded tip")
- Lips (e.g. "full lips with a pronounced cupid's bow")
- Jaw and facial structure (e.g. "strong square jaw", "soft oval face")
- Hair — colour, texture, length, style
- Any distinctive features (beard, freckles, strong brow, high cheekbones, etc.)
- Approximate age and apparent gender
- Their emotional expression

Write only a single dense paragraph of pure description, no commentary, no preamble.`
              },
              { inline_data: { mime_type: "image/jpeg", data: pureBase64 } }
            ]
          }]
        })
      }
    );

    if (!visionResponse.ok) {
      const errText = await visionResponse.text();
      throw new Error(`Gemini Vision Phase Failed: ${errText}`);
    }

    const visionData = await visionResponse.json();
    const personDescription = visionData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!personDescription) {
      throw new Error("Gemini failed to extract a description from the user photo.");
    }

    console.log("Vision complete. Description:", personDescription);
    console.log("Phase 2: Generating Renaissance Masterpiece via Pollinations.ai...");

    // Phase 2: Build a masterful Renaissance prompt
    const finalPrompt = [
      // Subject — from Gemini's description
      personDescription.trim(),

      // Style anchors — specific to Da Vinci / High Renaissance
      "Renaissance portrait painting in the style of Leonardo da Vinci",
      "sfumato technique, soft smoky transitions between light and shadow",
      "chiaroscuro lighting, single directional warm candlelight from upper left",
      "oil on wood panel, visible fine brushstrokes, aged craquelure texture",
      "three-quarter view portrait, neutral dark background transitioning to deep umber and olive shadow",

      // Era-specific costume & setting
      "wearing period 15th-century Italian Renaissance noble attire, rich fabric, subtle gold thread details",
      "hands folded or resting in frame like a da Vinci subject",

      // Quality boosters
      "museum-quality masterpiece, photorealistic oil painting, extremely detailed, 8k resolution",
      "sharp focus on eyes, realistic skin texture, subsurface scattering, anatomically precise face",
      "National Gallery London, Louvre collection quality",
    ].join(", ");

    const randomSeed = Math.floor(Math.random() * 9999999);
    const encodedPrompt = encodeURIComponent(finalPrompt);

    // Use flux-realism for best portrait fidelity, higher resolution
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&seed=${randomSeed}&width=768&height=960&nologo=true&enhance=true`;

    console.log("Calling Pollinations with enhanced prompt...");
    const pollinationResponse = await fetchWithRetry(pollinationsUrl, { method: "GET" });

    if (!pollinationResponse.ok) {
      throw new Error(`Pollinations API Failed: ${pollinationResponse.statusText}`);
    }

    // Convert to base64 for safe return
    const generatedBlob = await pollinationResponse.blob();
    const buffer = await generatedBlob.arrayBuffer();

    let generatedBase64 = "";
    const chunk = 8 * 1024;
    const uintArray = new Uint8Array(buffer);
    for (let i = 0; i < uintArray.length; i += chunk) {
      generatedBase64 += String.fromCharCode.apply(null, uintArray.subarray(i, i + chunk) as unknown as number[]);
    }
    const finalBase64 = btoa(generatedBase64);

    console.log("Masterpiece Complete!");

    return new Response(JSON.stringify({
      success: true,
      url: `data:image/png;base64,${finalBase64}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Critical Edge Function Error:", error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
