import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_MODEL = "whisper-large-v3-turbo";
const PARAGUAYAN_SPANISH_PROMPT =
  "Esta es una grabación de clase o conferencia en español de Paraguay. Puede contener expresiones locales, modismos y palabras ocasionales en guaraní o jopará. Transcribe con alta fidelidad manteniendo el contexto en español, aplicando puntuación correcta (puntos, comas) y organizando el texto en párrafos lininhos y coherentes.";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY no está configurada en el servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const incoming = await req.formData();
    const file = incoming.get("file");
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No se recibió archivo de audio." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const outgoing = new FormData();
    outgoing.append("file", file, file.name || "chunk.wav");
    outgoing.append("model", GROQ_MODEL);
    outgoing.append("language", "es");
    outgoing.append("response_format", "json");
    outgoing.append("prompt", PARAGUAYAN_SPANISH_PROMPT);

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: outgoing,
    });

    const body = await groqRes.text();
    if (!groqRes.ok) {
      return new Response(body, {
        status: groqRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(body, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
