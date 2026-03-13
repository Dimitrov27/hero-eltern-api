export async function onRequestPost(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const { email } = await context.request.json();

    if (!email || !email.includes("@") || !email.includes(".")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const BREVO_KEY = context.env.BREVO_API_KEY;

    // 1. Добави контакт в List 5 (SOS-Tool-Leads)
    await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": BREVO_KEY },
      body: JSON.stringify({ email, listIds: [5], updateEnabled: true }),
    });

    // 2. Изпрати Welcome email (Template 6)
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": BREVO_KEY },
      body: JSON.stringify({ templateId: 6, to: [{ email }] }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
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
