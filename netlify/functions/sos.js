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

exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message } = JSON.parse(event.body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
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

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
