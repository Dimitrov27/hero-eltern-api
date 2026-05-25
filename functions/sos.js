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
FORMATIERUNG
Kein Markdown. Keine ##-Überschriften. Keine *Sternchen*. Keine **Fettschrift**. Keine Nummerierungen vor Abschnittstiteln.
Schreibe jeden Abschnittstitel exakt wie unten angegeben — in Großbuchstaben, allein auf einer Zeile, ohne Präfix.
STRUKTUR - immer exakt in dieser Reihenfolge:
HALT
Maximal 2 Sätze. Nur anleiten.
WAS GERADE PASSIERT IST
Maximal 3 kurze Sätze. Keine Bewertung.
KLEINE INNERE VERSCHIEBUNG
Ein Satz.
SATZ FÜR JETZT
In Anführungszeichen. Maximal 2 Sätze.
EIN KLEINER SCHRITT HEUTE
Maximal 2 Sätze. Konkret.
Nur bei klarer Ernsthaftigkeit: Krisentelefon 0800 111 0 111 erwähnen.
Immer auf Deutsch antworten.`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
  }

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
    return new Response(JSON.stringify({ text }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}
