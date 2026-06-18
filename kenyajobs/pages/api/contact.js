import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, subject, message, phone } = req.body;

  // Basic validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  if (message.trim().length < 10) {
    return res.status(400).json({ error: "Message is too short. Please provide more detail." });
  }

  // Configure SMTP transporter from env vars
  // Set these in your Vercel/hosting dashboard:
  //   SMTP_HOST      e.g. smtp.gmail.com
  //   SMTP_PORT      e.g. 587
  //   SMTP_USER      e.g. hello@jobsworldwide.online
  //   SMTP_PASS      your app password (not your main password)
  //   CONTACT_TO     e.g. hello@jobsworldwide.online
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const toAddress = process.env.CONTACT_TO || "hello@jobsworldwide.online";
  const siteName = "JobsWorldwide";

  try {
    await transporter.sendMail({
      from: `"${siteName} Contact Form" <${process.env.SMTP_USER}>`,
      to: toAddress,
      replyTo: `"${name}" <${email}>`,
      subject: `[Contact] ${subject?.trim() || "New message from " + name}`,
      text: [
        `New contact form submission on ${siteName}`,
        "",
        `Name:    ${name}`,
        `Email:   ${email}`,
        phone ? `Phone:   ${phone}` : null,
        `Subject: ${subject || "(none)"}`,
        "",
        "--- Message ---",
        message,
        "",
        "---",
        `Sent via ${siteName} contact form`,
      ].filter(Boolean).join("\n"),
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#12161c;">
          <div style="background:#0b2233;padding:24px 28px;border-radius:8px 8px 0 0;">
            <p style="margin:0;color:#f2a93c;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">
              ${siteName} · Contact Form
            </p>
            <h2 style="margin:8px 0 0;color:#fff;font-size:20px;font-weight:600;">
              ${subject?.trim() || "New message from " + name}
            </h2>
          </div>
          <div style="background:#fff;border:1px solid #e2e5e8;border-top:none;padding:28px;border-radius:0 0 8px 8px;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f4f5f3;width:90px;color:#8b94a0;font-size:13px;font-weight:500;">Name</td>
                <td style="padding:8px 0;border-bottom:1px solid #f4f5f3;font-size:14px;color:#12161c;">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f4f5f3;color:#8b94a0;font-size:13px;font-weight:500;">Email</td>
                <td style="padding:8px 0;border-bottom:1px solid #f4f5f3;">
                  <a href="mailto:${email}" style="color:#1d4ed8;font-size:14px;">${email}</a>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f4f5f3;color:#8b94a0;font-size:13px;font-weight:500;">Phone</td>
                <td style="padding:8px 0;border-bottom:1px solid #f4f5f3;font-size:14px;color:#12161c;">${phone}</td>
              </tr>` : ""}
              <tr>
                <td style="padding:8px 0;color:#8b94a0;font-size:13px;font-weight:500;">Subject</td>
                <td style="padding:8px 0;font-size:14px;color:#12161c;">${subject || "—"}</td>
              </tr>
            </table>
            <div style="background:#f4f5f3;border-radius:6px;padding:20px;">
              <p style="margin:0 0 8px;color:#8b94a0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Message</p>
              <p style="margin:0;font-size:15px;color:#12161c;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>
            <p style="margin:24px 0 0;font-size:12px;color:#8b94a0;">
              Reply directly to this email to respond to ${name}.
            </p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact form mail error:", err);
    return res.status(500).json({
      error: "Failed to send message. Please try emailing us directly at hello@jobsworldwide.online",
    });
  }
}
