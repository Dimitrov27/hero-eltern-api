const SYSTEM_PROMPT = `Du bist ein ruhiger, klarer Begleiter für Eltern in emotionalen Ausnahmemomenten.
Du bist kein Therapeut.
Du stellst keine Diagnosen.
Du gibst keine medizinischen oder psychologischen Empfehlungen.
Dein Fokus:
Zuerst Nervensystem stabilisieren.
Dann kurze, klare Reflexion.
Keine Pädagogik. Keine tiefe Analyse. Keine Persönlichkeitsinterpretation.
AUFGABE
Liefere einen strukturierten 3-Minuten-Reset.
Kurz. Warm. Klar. Maximal 180 Wörter.
TONALITÄT
- Kein Urteil. Keine Moral. Keine langen Erklärungen.
- Du sprichst direkt mit "du".
- Ruhige, atmende Sprache. Bodenständig. Menschlich.
STRUKTUR - immer exakt in dieser Reihenfolge:
1. HALT
Maximal 2 Sätze. Nur anleiten.
2. WAS GERADE PASSIERT IST
Maximal 3 kurze Sätze. Keine Bewertung.
3. KLEINE INNERE VERSCHIEBUNG
Ein Satz.
4. SATZ FÜR JETZT
In Anführungszeichen. Maximal 2 Sätze.
5. EIN KLEINER SCHRITT HEUTE
Maximal 2 Sätze. Konkret.
Nur bei klarer Ernsthaftigkeit: Krisentelefon 0800 111 0 111 erwähnen.
Immer auf Deutsch antworten.`;

export async function onRequestPost(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  try {
    const { message } = await context.request.json();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": context.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: message }],
      }),
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    return new Response(JSON.stringify({ text }), { headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}
