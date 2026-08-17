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

    console.log("Phase 1: Inspecting face with Gemini 2.5 Flash...");

    // Phase 1: Get a detailed description of the person's face
    const visionResponse = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Describe this person's face in a short paragraph. Focus on:
- Skin tone
- Eye shape and colour
- Nose and mouth shape
- Hair colour and style
- Approximate age and gender
- Their expression

Write only a plain description paragraph, no commentary.`
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
    console.log("Phase 2: Generating clown image via Pollinations.ai...");

    // Phase 2: Build a detailed clown prompt based on the person's face
    const finalPrompt = [
      // The subject — their real features carry through
      `A photorealistic portrait of a ${personDescription.trim()}`,

      // The clown transformation
      "transformed into a professional circus clown",
      "bright white clown face paint covering the entire face",
      "exaggerated red bulbous clown nose",
      "large painted red smile extending far beyond the lips",
      "thick black outlines around the eyes with dramatic arched painted eyebrows",
      "colorful clown eye shadow, red circles painted on cheeks",
      "wearing a oversized colorful polka-dot clown costume with big ruffled collar",
      "wild colorful clown wig — bright orange or rainbow afro",

      // Style & quality
      "ultra photorealistic, studio portrait lighting, sharp focus",
      "professional photography, 8k, hyper detailed",
      "the person's original facial features are still recognisable beneath the clown makeup",
    ].join(", ");

    const randomSeed = Math.floor(Math.random() * 9999999);
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&seed=${randomSeed}&width=768&height=960&nologo=true&enhance=true`;

    console.log("Calling Pollinations with clown prompt...");
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

    console.log("Clown complete! Honk honk.");

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
