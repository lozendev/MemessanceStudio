import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchWithRetry(url: string, options: RequestInit, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const response = await fetch(url, options);
    if ((response.status === 503 || response.status === 429) && i < retries) {
      console.warn(`API busy (status ${response.status}). Retrying in 2 seconds... (Attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
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

    console.log("Phase 1: Starting Vision Inspection with Gemini 2.5 Flash...");
    
    const visionResponse = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Look at this person carefully. Describe their face, hair, expression, and any distinct features in a short, hyper-detailed paragraph. Do not mention the background." },
            { inline_data: { mime_type: "image/jpeg", data: pureBase64 } }
          ]
        }]
      })
    });

    if (!visionResponse!.ok) {
      const errText = await visionResponse!.text();
      throw new Error(`Gemini Vision Phase Failed: ${errText}`);
    }

    const visionData = await visionResponse!.json();
    const personDescription = visionData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!personDescription) {
        throw new Error("Gemini failed to extract a description from the user photo.");
    }

    console.log("Vision complete. Description:", personDescription);
    console.log("Phase 2: Generating Renaissance Art via Pollinations.ai...");

    // Build the final optimized prompt for Pollinations
    const finalPrompt = `${personDescription}. A masterpiece 16th-century Renaissance oil painting portrait, sfumato, chiaroscuro lighting.`;
    const randomSeed = Math.floor(Math.random() * 9999999);
    
    // Pollinations URL
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&seed=${randomSeed}&width=512&height=512&nologo=true`;

    // Download the generated image from Pollinations 
    const pollinationResponse = await fetch(pollinationsUrl);
    if (!pollinationResponse.ok) {
        throw new Error(`Pollinations API Failed: ${pollinationResponse.statusText}`);
    }

    // Convert Pollinations Blob to Base64 to safely return to FrontEnd
    const generatedBlob = await pollinationResponse.blob();
    const buffer = await generatedBlob.arrayBuffer();
    
    // Use a fast chunking method to avoid maximum call stack size exceeded on large buffers
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
