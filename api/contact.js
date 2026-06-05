import { Resend } from "resend";

// Where enquiries are delivered.
const TO = "bailey@ignitedbybailey.ca";

// The "from" address must be on a domain you've verified in Resend.
// Once ignitedbybailey.ca is verified, this works as-is. For quick testing
// before verification, set FROM_EMAIL to "onboarding@resend.dev".
const FROM = process.env.FROM_EMAIL || "Website Enquiries <noreply@ignitedbybailey.ca>";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "Email service is not configured." });
  }

  // Vercel parses JSON bodies automatically; fall back just in case.
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const name = String(body.fname || "").trim();
  const email = String(body.femail || "").trim();
  const org = String(body.forg || "").trim();
  const topic = String(body.ftopic || "").trim();
  const message = String(body.fmsg || "").trim();

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6">
      <h2 style="margin:0 0 16px">New website enquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${org ? `<p><strong>Organization:</strong> ${escapeHtml(org)}</p>` : ""}
      ${topic ? `<p><strong>Topic:</strong> ${escapeHtml(topic)}</p>` : ""}
      ${message ? `<p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>` : ""}
    </div>
  `;

  const text = [
    "New website enquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    org ? `Organization: ${org}` : null,
    topic ? `Topic: ${topic}` : null,
    message ? `\nMessage:\n${message}` : null,
  ].filter(Boolean).join("\n");

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `Website enquiry from ${name}${topic ? ` — ${topic}` : ""}`,
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(502).json({ error: "Could not send your enquiry. Please try again later." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Send failed:", err);
    return res.status(500).json({ error: "Could not send your enquiry. Please try again later." });
  }
}
