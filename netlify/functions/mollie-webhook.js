// netlify/functions/mollie-webhook.js
// Mollie → проверява плащането → изпраща PDF-ите чрез Brevo

const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
const BREVO_API_KEY  = process.env.BREVO_API_KEY;

// PDF файловете трябва да са качени някъде публично достъпно (напр. Netlify /public или CDN)
// Сложи реалните URL-та след качване
const PDF_SOS_URL     = process.env.PDF_SOS_URL     || 'https://hero-eltern.de/downloads/SOS_Eltern_Buch.pdf';
const PDF_WEG_URL     = process.env.PDF_WEG_URL     || 'https://hero-eltern.de/downloads/Der_Weg_nach_Innen.pdf';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Mollie праща само payment ID в body-то
    const params = new URLSearchParams(event.body);
    const paymentId = params.get('id');

    if (!paymentId) {
      return { statusCode: 400, body: 'No payment ID' };
    }

    // Проверяваме статуса на плащането директно при Mollie
    const mollieRes = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MOLLIE_API_KEY}` }
    });

    if (!mollieRes.ok) {
      console.error('Mollie API error:', mollieRes.status);
      return { statusCode: 500, body: 'Mollie API error' };
    }

    const payment = await mollieRes.json();
    console.log('Payment status:', payment.status, '| Email:', payment.metadata?.email);

    // Само ако плащането е успешно
    if (payment.status !== 'paid') {
      return { statusCode: 200, body: 'Payment not paid yet' };
    }

    const customerEmail = payment.metadata?.email || payment.billingEmail;
    const customerName  = payment.metadata?.name  || 'Liebe Eltern';

    if (!customerEmail) {
      console.error('No customer email found in payment metadata');
      return { statusCode: 200, body: 'No email found' };
    }

    // Изпращаме имейл с PDF линкове чрез Brevo
    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name:  'Günter Sommer | HERO Eltern',
          email: 'info@hero-eltern.de'
        },
        to: [{ email: customerEmail, name: customerName }],
        subject: '📚 Deine HERO Eltern Bücher sind da!',
        htmlContent: buildEmailHTML(customerName, PDF_SOS_URL, PDF_WEG_URL),
        tags: ['buch-kauf', 'pdf-delivery']
      })
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error('Brevo error:', err);
      return { statusCode: 500, body: 'Email send failed' };
    }

    console.log('✅ Email sent to:', customerEmail);
    return { statusCode: 200, body: 'OK' };

  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};

function buildEmailHTML(name, sosUrl, wegUrl) {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1A1612;padding:32px 40px;border-radius:8px 8px 0 0;text-align:center;">
            <p style="margin:0;color:#C9A84C;font-size:12px;letter-spacing:3px;text-transform:uppercase;">HERO ELTERN</p>
            <h1 style="margin:8px 0 0;color:#FAF6F0;font-size:26px;font-weight:bold;">Deine Bücher sind da! 📚</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;border-radius:0 0 8px 8px;">
            <p style="color:#1A1612;font-size:16px;line-height:1.6;">
              Liebe/r ${name},
            </p>
            <p style="color:#444;font-size:15px;line-height:1.7;">
              vielen Dank für deinen Kauf! 🙏 Du hast jetzt Zugang zu beiden Büchern — lade sie direkt herunter und leg los.
            </p>

            <!-- Book 1 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid #E8E0D5;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 4px;color:#C8432A;font-size:11px;letter-spacing:2px;font-weight:bold;text-transform:uppercase;">BUCH 1</p>
                  <p style="margin:0 0 8px;color:#1A1612;font-size:18px;font-weight:bold;">SOS Eltern</p>
                  <p style="margin:0 0 16px;color:#666;font-size:14px;">Der Notfallplan, wenn der Alltag explodiert — 30 Tage, 5–10 Min täglich</p>
                  <a href="${sosUrl}" style="display:inline-block;background:#C8432A;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:bold;">
                    📥 SOS Eltern Buch herunterladen
                  </a>
                </td>
              </tr>
            </table>

            <!-- Book 2 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid #E8E0D5;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 4px;color:#C9A84C;font-size:11px;letter-spacing:2px;font-weight:bold;text-transform:uppercase;">BONUS BUCH</p>
                  <p style="margin:0 0 8px;color:#1A1612;font-size:18px;font-weight:bold;">Der Weg nach Innen</p>
                  <p style="margin:0 0 16px;color:#666;font-size:14px;">Eine Reise zu dir selbst — Meditation, Achtsamkeit, innere Stille</p>
                  <a href="${wegUrl}" style="display:inline-block;background:#C9A84C;color:#1A1612;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:bold;">
                    📥 Der Weg nach Innen herunterladen
                  </a>
                </td>
              </tr>
            </table>

            <p style="color:#444;font-size:14px;line-height:1.7;margin-top:24px;">
              Die PDFs öffnen sich direkt in deinem Browser oder werden automatisch heruntergeladen. Du kannst sie auch auf deinem Telefon speichern und überall lesen.
            </p>

            <p style="color:#444;font-size:14px;line-height:1.7;">
              Wenn du Fragen hast, schreib uns einfach: <a href="mailto:info@hero-eltern.de" style="color:#C8432A;">info@hero-eltern.de</a>
            </p>

            <p style="color:#1A1612;font-size:15px;margin-top:32px;">
              Alles Gute,<br>
              <strong>Günter Sommer</strong><br>
              <span style="color:#999;font-size:13px;">HERO Eltern · hero-eltern.de</span>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0;text-align:center;">
            <p style="color:#aaa;font-size:12px;margin:0;">
              © 2026 HERO Eltern · hero-eltern.de<br>
              <a href="mailto:info@hero-eltern.de" style="color:#aaa;">info@hero-eltern.de</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
}
