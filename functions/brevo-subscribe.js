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

    // 1. Double opt-in — изпраща confirmation email автоматично
    await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": BREVO_KEY },
      body: JSON.stringify({
        email,
        includeListIds: [5],
        templateId: 3,
        redirectionUrl: "https://hero-eltern-api.pages.dev/danke",
      }),
    });

    // 2. НЕ изпращаме Welcome email тук — ще го изпрати Brevo автоматично
    //    след като потребителят потвърди double opt-in

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
